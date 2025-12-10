
import React, { useState, useEffect, useRef } from 'react';
import { Step, IkigaiState, IkigaiResult, User } from './types';
import WizardStep from './components/WizardStep';
import DashboardOS from './components/DashboardOS';
import HeroIkigai from './components/HeroIkigai';
import LegalPages from './components/LegalPages';
import SynthesisScreen from './components/SynthesisScreen';
import { generateCoreAnalysis, enrichIdea } from './services/geminiService';
import { supabase } from './lib/supabaseClient';
import { Loader2, LogIn, Crown, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const App = () => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [previousStep, setPreviousStep] = useState<Step>(Step.WELCOME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User & Subscription State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  // UNLOCKED: Everyone is a Founder by default
  const [isPro, setIsPro] = useState(true);
  const [proUserCount, setProUserCount] = useState(7);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data State
  const [ikigaiData, setIkigaiData] = useState<IkigaiState>({
    love: [],
    goodAt: [],
    worldNeeds: [],
    paidFor: []
  });

  const [result, setResult] = useState<IkigaiResult | null>(null);

  const userRef = useRef<string | null>(null);

  // --- LOCAL STORAGE PERSISTENCE (AUTO-SAVE/LOAD) ---
  useEffect(() => {
    // 1. Load Data on Mount
    const savedData = localStorage.getItem('ikigaiData');
    if (savedData) {
      try {
        setIkigaiData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved ikigai data", e);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Save Data on Change (Debounced slightly by React batching)
    if (ikigaiData.love.length || ikigaiData.goodAt.length || ikigaiData.worldNeeds.length || ikigaiData.paidFor.length) {
      localStorage.setItem('ikigaiData', JSON.stringify(ikigaiData));
    }
  }, [ikigaiData]);

  // --- SAFETY TIMEOUT (GLOBAL LOADING) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSessionLoading) {
        console.warn("Session loading timed out. Forcing render.");
        setIsSessionLoading(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [isSessionLoading]);

  // --- SAFETY TIMEOUT (ANALYSIS) ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === Step.ANALYZING) {
      // If analysis takes longer than 2 minutes, force an error state so user isn't stuck
      timer = setTimeout(() => {
        console.warn("Analysis timed out in UI.");
        setLoading(false);
        setError("The analysis is taking longer than expected. Please try again.");
        setStep(Step.PAID_FOR);
      }, 120000);
    }
    return () => clearTimeout(timer);
  }, [step]);

  // --- HELPERS (Defined before useEffect) ---
  const checkForPaymentSuccess = async (userId: string) => {
    const url = window.location.href;
    if (url.includes('success=true') || url.includes('success=1') || url.includes('#success=true')) {
      try {
        const { error } = await supabase.rpc('upgrade_user_to_pro');
        if (!error) {
          setIsPro(true);
          setShowSuccessModal(true);
          triggerConfettiLoop();
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }
      } catch (e) { console.error(e); }
    }
  };

  const triggerConfettiLoop = () => {
    const duration = 5000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF6B6B', '#4ECDC4', '#F7B731'] });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF6B6B', '#4ECDC4', '#F7B731'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const fetchProCount = async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_pro', true);
    if (count !== null) setProUserCount(count);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('is_pro').eq('id', userId).maybeSingle();
      if (data) {
        setIsPro(data.is_pro || false);
      }
    } catch (e) { console.error("Profile fetch error", e); }
  };

  const fetchLatestResult = async (userId: string) => {
    try {
      const { data } = await supabase.from('ikigai_results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) {
        setResult({
          statement: data.statement,
          description: data.description,
          intersectionPoints: data.intersection_points,
          roadmap: data.roadmap,
          marketIdeas: data.market_ideas,
          sources: data.sources
        });
        setStep(Step.RESULT);
      } else {
        // Fallback to Local Cache (Save Costs)
        const cached = localStorage.getItem('ikigaiResult');
        if (cached) {
          try {
            setResult(JSON.parse(cached));
            setStep(Step.RESULT);
          } catch (e) { console.error("Cached result parse error", e); }
        }
      }
    } catch (e) { console.error("Result fetch error", e); }
  };

  // --- AUTH & DATA LOADING ---
  useEffect(() => {
    let mounted = true;

    const handleSession = async (session: any) => {
      if (!mounted) return;

      // 1. No User
      if (!session?.user) {
        if (userRef.current) {
          // Logout detected
          setUser(null);
          setIkigaiData({ love: [], goodAt: [], worldNeeds: [], paidFor: [] });
          setResult(null);
          setStep(Step.WELCOME);
          // UNLOCKED: Everyone is a Founder
          setIsPro(true);
          userRef.current = null;
        } else {
          // Guest Load: Check Local Cache
          const cached = localStorage.getItem('ikigaiResult');
          if (cached) {
            try {
              setResult(JSON.parse(cached));
              setStep(Step.RESULT);
            } catch (e) { console.error("Cached result parse error", e); }
          }
        }
        setIsSessionLoading(false);
        return;
      }

      // 2. Load User Data (Always refresh on session init to be safe)
      userRef.current = session.user.id;
      // Only show loading if we are actually switching users or starting up
      // setIsSessionLoading(true); // removed to prevent flicker loop

      try {
        setUser({
          name: session.user.user_metadata.full_name || 'User',
          email: session.user.email || '',
          photoUrl: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`
        });

        // Restore saved inputs from metadata if local is empty
        const savedState = session.user.user_metadata?.saved_state;
        if (savedState && ikigaiData.love.length === 0) {
          setIkigaiData(savedState);
        }

        // Parallel Fetch
        await Promise.all([
          fetchUserProfile(session.user.id),
          fetchLatestResult(session.user.id)
        ]);

        checkForPaymentSuccess(session.user.id);
      } catch (err) {
        console.error("Error loading session data", err);
      } finally {
        if (mounted) setIsSessionLoading(false);
      }
    };

    // Initialize
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session)).catch(e => {
      console.error("Get Session Failed", e);
      setIsSessionLoading(false);
    });

    // Force Pro for development/demo purposes
    setIsPro(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => handleSession(session));

    fetchProCount();

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const resetApp = async () => {
    setIsSessionLoading(true);
    await supabase.auth.signOut();
    localStorage.clear();
    setIkigaiData({ love: [], goodAt: [], worldNeeds: [], paidFor: [] }); // Clear state immediately
    window.location.href = '/'; // Hard reload to clear everything
  };

  // --- WIZARD LOGIC ---
  const handleNext = async () => {
    switch (step) {
      case Step.WELCOME: setStep(Step.LOVE); break;
      case Step.LOVE: setStep(Step.GOOD_AT); break;
      case Step.GOOD_AT: setStep(Step.WORLD_NEEDS); break;
      case Step.WORLD_NEEDS: setStep(Step.PAID_FOR); break;
      case Step.PAID_FOR: setStep(Step.ANALYZING); await performAnalysis(); break;
      default: break;
    }
  };

  const performAnalysis = async () => {
    setLoading(true);
    try {
      // 1. Generate CORE Analysis (Fast Skeleton)
      const coreResult = await generateCoreAnalysis(ikigaiData);
      setResult(coreResult);

      // 2. UNBLOCK UI IMMEDIATELY
      setStep(Step.RESULT);
      setLoading(false);

      // 3. Background Enrichment (The Muscle)
      // Save initial result first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Initial Save
        await supabase.from('ikigai_results').insert({
          user_id: currentUser.id,
          statement: coreResult.statement,
          description: coreResult.description,
          intersection_points: coreResult.intersectionPoints,
          roadmap: coreResult.roadmap,
          market_ideas: coreResult.marketIdeas,
          sources: coreResult.sources
        });
      }

      // 4. Enrich Loop: Fetch deep data for each idea one by one
      const enrichedIdeas = [...coreResult.marketIdeas];
      for (let i = 0; i < enrichedIdeas.length; i++) {
        // Fetch details for idea i
        const deepData = await enrichIdea(enrichedIdeas[i], ikigaiData);
        if (deepData) {
          // Merge deep data into the idea
          enrichedIdeas[i] = { ...enrichedIdeas[i], ...deepData };

          // Update UI State incrementally
          setResult(prev => prev ? ({ ...prev, marketIdeas: [...enrichedIdeas] }) : null);

          // Update Database (optional, but good for persistence)
          if (currentUser) {
            // We would ideally patch the specific row, but for now we mainly rely on local state
            // or we could overwrite the 'market_ideas' column if we tracked the row ID.
            // For this MVP, we just update the local UX.
          }
        }
      }

      // Final Save to ensure full data is persisted
      if (currentUser) {
        // Simplest way: just save a new row or update. 
        // For now, let's assume the user considers "Done" when all loaded.
        // Or strictly reliance on localStorage for the active session.
        localStorage.setItem('ikigaiResult', JSON.stringify({ ...coreResult, marketIdeas: enrichedIdeas }));
      }

    } catch (e) {
      console.error(e);
      setLoading(false);
      // If core fails, we show error
    }
  };

  const handleSkipAnalysis = () => {
    // Provide a safe placeholder if the user decides to skip the long wait
    const placeholderResult: IkigaiResult = {
      statement: "Your Ikigai (Generated)",
      description: "We couldn't finish the deep analysis in time, but you can refine your inputs here and try again.",
      intersectionPoints: {
        passion: "Pending",
        mission: "Pending",
        profession: "Pending",
        vocation: "Pending"
      },
      marketIdeas: [],
      roadmap: [],
      sources: []
    };
    setResult(placeholderResult);
    setStep(Step.RESULT);
    setLoading(false);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent select_account' } }
    });
  };

  // --- RENDER ---
  const founderSlotsLeft = Math.max(0, 100 - proUserCount);

  if (isSessionLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
      <p className="text-slate-500 animate-pulse font-medium mb-8">Loading Productivity OS...</p>

      <button
        onClick={resetApp}
        className="text-xs text-slate-400 hover:text-red-500 underline border border-transparent hover:border-red-100 p-2 rounded transition-colors"
      >
        Stuck? Reset Application
      </button>
    </div>
  );

  // === THE NEW OS VIEW ===
  if (step === Step.RESULT && result) {
    return (
      <>
        <DashboardOS
          user={user}
          result={result}
          ikigaiData={ikigaiData}
          setIkigaiData={setIkigaiData}
          setResult={setResult}
          isPro={isPro}
          onUpgrade={() => setShowSuccessModal(true)}
          onLogout={resetApp}
          slotsLeft={founderSlotsLeft}
        />
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl text-center relative overflow-hidden">
              <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600"><Crown size={32} /></div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome to Founder's Club</h2>
              <p className="text-slate-600 mt-2 mb-6">You have unlocked the full power of the Productivity OS.</p>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Access Dashboard</button>
            </div>
          </div>
        )}
      </>
    );
  }

  // === THE WIZARD VIEW ===
  const getBgClass = () => {
    switch (step) {
      case Step.LOVE: return 'from-red-100 to-rose-50';
      case Step.GOOD_AT: return 'from-teal-100 to-emerald-50';
      case Step.WORLD_NEEDS: return 'from-sky-100 to-blue-50';
      case Step.PAID_FOR: return 'from-amber-100 to-yellow-50';
      default: return 'from-gray-100 to-slate-50';
    }
  };

  if (step === Step.PRIVACY || step === Step.TERMS) {
    return <div className="p-8 bg-slate-50 min-h-screen"><LegalPages type={step === Step.PRIVACY ? 'privacy' : 'terms'} onBack={() => setStep(previousStep)} /></div>;
  }

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${getBgClass()} transition-colors duration-1000 flex flex-col font-sans text-slate-800`}>
      <header className="px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/30 sticky top-0 z-50">
        <div onClick={() => setStep(Step.WELCOME)} className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2 cursor-pointer">
          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">IK</span> Pathfinder
        </div>
        <div className="flex items-center gap-4">
          {user ? <div className="flex items-center gap-2"><span className="text-sm font-medium">{user.name}</span><img src={user.photoUrl} className="w-8 h-8 rounded-full" /></div> :
            step !== Step.WELCOME && <button onClick={handleLogin} className="text-sm font-semibold flex items-center gap-1"><LogIn size={16} /> Sign In</button>}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col justify-center items-center relative">
        {step === Step.WELCOME && (
          <div className="text-center max-w-2xl animate-in fade-in zoom-in duration-700 space-y-8 flex flex-col items-center">
            <div className="hover:scale-105 transition-transform duration-700"><HeroIkigai /></div>
            <div className="-mt-10 relative z-10">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-slate-900">Discover Your Ikigai</h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">Find your purpose with AI-driven market analysis.</p>
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  <button onClick={() => result ? setStep(Step.RESULT) : handleNext()} className="px-10 py-4 bg-slate-900 text-white text-lg rounded-full font-medium hover:scale-105 transition-transform">
                    {result ? 'Enter Dashboard' : 'Start Analysis'}
                  </button>
                  {!result && ikigaiData.love.length > 0 && (
                    <button onClick={() => setStep(Step.PAID_FOR)} className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1">
                      Resume Analysis <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <button onClick={handleLogin} className="px-8 py-3 bg-white text-slate-800 border border-slate-200 shadow-md text-lg rounded-full font-medium hover:bg-slate-50 flex items-center gap-3 w-64 justify-center">
                    {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Sign in with Google'}
                  </button>
                  {ikigaiData.love.length > 0 ? (
                    <button onClick={() => setStep(Step.PAID_FOR)} className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1">
                      Resume Analysis <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button onClick={handleNext} className="text-slate-500 text-sm hover:underline">Continue as Guest</button>
                  )}
                </div>
              )}
            </div>

            {/* Legal Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col items-center gap-3 text-xs text-slate-400">
              <div className="flex gap-6">
                <button onClick={() => { setPreviousStep(step); setStep(Step.PRIVACY); }} className="hover:text-slate-600 transition-colors">Privacy Policy</button>
                <button onClick={() => { setPreviousStep(step); setStep(Step.TERMS); }} className="hover:text-slate-600 transition-colors">Terms of Service</button>
              </div>
              <p>© {new Date().getFullYear()} Ikigai Pathfinder. All rights reserved.</p>
              <a href="mailto:syewhite@gmail.com" className="hover:text-slate-600 transition-colors">Support: syewhite@gmail.com</a>
            </div>
          </div>
        )
        }

        {
          [Step.LOVE, Step.GOOD_AT, Step.WORLD_NEEDS, Step.PAID_FOR].includes(step) && (
            <div className="w-full max-w-xl h-[600px]">
              <WizardStep
                title={step === Step.LOVE ? "What You Love" : step === Step.GOOD_AT ? "What You Are Good At" : step === Step.WORLD_NEEDS ? "What The World Needs" : "What You Can Be Paid For"}
                description={step === Step.LOVE ? "Passions & Hobbies" : step === Step.GOOD_AT ? "Skills & Talents" : step === Step.WORLD_NEEDS ? "Causes & Problems" : "Marketable Skills"}
                category={step === Step.LOVE ? "love" : step === Step.GOOD_AT ? "goodAt" : step === Step.WORLD_NEEDS ? "worldNeeds" : "paidFor"}
                colorClass={step === Step.LOVE ? "bg-[#FF6B6B]" : step === Step.GOOD_AT ? "bg-[#4ECDC4]" : step === Step.WORLD_NEEDS ? "bg-[#45B7D1]" : "bg-[#F7B731]"}
                items={ikigaiData[step === Step.LOVE ? "love" : step === Step.GOOD_AT ? "goodAt" : step === Step.WORLD_NEEDS ? "worldNeeds" : "paidFor"]}
                setItems={(items) => setIkigaiData({ ...ikigaiData, [step === Step.LOVE ? "love" : step === Step.GOOD_AT ? "goodAt" : step === Step.WORLD_NEEDS ? "worldNeeds" : "paidFor"]: items })}
                onNext={handleNext}
                onBack={step !== Step.LOVE ? () => setStep(Object.values(Step)[Object.values(Step).indexOf(step) - 1] as Step) : undefined}
                context={ikigaiData}
              />
            </div>
          )
        }

        {
          step === Step.ANALYZING && (
            <div className="w-full h-full flex items-center justify-center">
              <SynthesisScreen onSkip={handleSkipAnalysis} />
            </div>
          )
        }

        {error && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow-xl">{error}</div>}
      </main >
    </div >
  );
};

export default App;
