import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Settings, LogOut, Crown } from 'lucide-react';
import { User } from '../types';

interface DashboardLayoutProps {
  user: User | null;
  activeView: 'analysis' | 'tasks' | 'calendar';
  onViewChange: (view: 'analysis' | 'tasks' | 'calendar') => void;
  children: React.ReactNode;
  isPro: boolean;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, activeView, onViewChange, children, isPro, onLogout 
}) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: 'analysis' | 'tasks' | 'calendar', icon: any, label: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeView === view 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[800px] bg-slate-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-serif font-bold">IK</div>
           <span className="font-serif font-bold text-slate-900 tracking-tight">Pathfinder OS</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="analysis" icon={LayoutDashboard} label="Ikigai Analysis" />
          <NavItem view="tasks" icon={CheckSquare} label="Action Plan" />
          <NavItem view="calendar" icon={Calendar} label="Calendar" />
        </nav>

        <div className="p-4 border-t border-slate-100">
           {isPro ? (
             <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
               <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                 <Crown size={18} />
               </div>
               <div>
                 <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Founder Plan</p>
                 <p className="text-[10px] text-amber-600">Active</p>
               </div>
             </div>
           ) : (
             <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Free Plan</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full w-[40%]"></div>
                </div>
             </div>
           )}

           <div className="flex items-center gap-3 px-2 py-2">
              <img src={user?.photoUrl} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <button onClick={onLogout} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                  <LogOut size={10} /> Sign Out
                </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
         <div className="h-full">
            {children}
         </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
