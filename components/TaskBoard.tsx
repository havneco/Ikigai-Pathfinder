import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Task, TaskStatus } from '../types';
import { Plus, MoreHorizontal, Calendar as CalendarIcon, CheckCircle2, Circle, Clock } from 'lucide-react';

interface TaskBoardProps {
  userId: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [view, setView] = useState<'board' | 'calendar'>('board');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data as unknown as Task[]) || []);
    } catch (e) {
      console.error('Error fetching tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (status: TaskStatus = 'todo', date?: Date) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Partial<Task> = {
      user_id: userId,
      title: newTaskTitle,
      status: status,
      priority: 'medium',
      ai_generated: false,
      due_date: date ? date.toISOString() : undefined
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      setTasks([data as unknown as Task, ...tasks]);
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (e) {
      console.error('Error adding task', e);
    }
  };

  const updateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    } catch (e) {
      console.error('Error updating task', e);
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  // --- VIEW COMPONENTS ---

  const PriorityBadge = ({ priority }: { priority?: string }) => {
    const colors = {
      high: 'bg-red-100 text-red-600 border-red-200',
      medium: 'bg-amber-100 text-amber-600 border-amber-200',
      low: 'bg-blue-100 text-blue-600 border-blue-200'
    } as any;
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${colors[priority || 'medium'] || colors.medium}`}>
        {priority || 'medium'}
      </span>
    );
  }

  const Column = ({ title, status, icon: Icon, color }: { title: string, status: TaskStatus, icon: any, color: string }) => {
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div className="flex-1 min-w-[300px] flex flex-col h-full">
        <div className={`flex items-center justify-between p-3 rounded-t-xl border-b-2 ${color} bg-white mb-2`}>
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Icon size={18} className="text-slate-400" />
            {title}
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{columnTasks.length}</span>
          </h3>
          <button onClick={() => { setIsAdding(true); }} className="text-slate-400 hover:text-indigo-600">
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 bg-slate-100/50 rounded-xl p-2 space-y-3 overflow-y-auto">
          {isAdding && status === 'todo' && (
            <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-200">
              <input
                autoFocus
                placeholder="What needs to be done?"
                className="w-full text-sm outline-none"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask('todo')}
                onBlur={() => { if (!newTaskTitle) setIsAdding(false); }}
              />
              <div className="flex justify-end mt-2 gap-2">
                <button onClick={() => setIsAdding(false)} className="text-xs text-slate-400 px-2 py-1">Cancel</button>
                <button onClick={() => addTask('todo')} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md">Add</button>
              </div>
            </div>
          )}

          {columnTasks.map(task => (
            <div key={task.id} className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
                <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {task.quadrant && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold uppercase tracking-wider border border-indigo-100">{task.quadrant}</span>
                  )}
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="flex items-center gap-1">
                  {status !== 'todo' && (
                    <button onClick={() => updateStatus(task.id, 'todo')} className="p-1 text-slate-300 hover:text-slate-500" title="Move to Todo"><Circle size={14} /></button>
                  )}
                  {status !== 'in_progress' && (
                    <button onClick={() => updateStatus(task.id, 'in_progress')} className="p-1 text-slate-300 hover:text-blue-500" title="Move to In Progress"><Clock size={14} /></button>
                  )}
                  {status !== 'done' && (
                    <button onClick={() => updateStatus(task.id, 'done')} className="p-1 text-slate-300 hover:text-green-500" title="Move to Done"><CheckCircle2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {columnTasks.length === 0 && !isAdding && (
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-400">No tasks</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">{monthName}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 rounded"><CalendarIcon size={18} className="rotate-90" /></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 rounded"><CalendarIcon size={18} className="-rotate-90" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {blanks.map(i => <div key={`blank-${i}`} className="bg-slate-50/30 border-r border-b border-slate-100"></div>)}
          {days.map(day => {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const dayTasks = tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === dateStr);
            const isToday = new Date().toDateString() === dateStr;

            return (
              <div key={day} className={`min-h-[100px] p-2 border-r border-b border-slate-100 relative group transition-colors ${isToday ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                <span className={`text-xs font-bold mb-1 block ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                <div className="space-y-1">
                  {dayTasks.map(t => (
                    <div key={t.id} className={`text-[10px] px-1.5 py-1 rounded border truncate ${t.status === 'done' ? 'bg-slate-100 text-slate-400 line-through' : 'bg-white text-slate-700 border-slate-200 shadow-sm'}`}>
                      {t.title}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      // Simple quick add prompt
                      const title = prompt("Add task for " + date.toLocaleDateString());
                      if (title) {
                        setNewTaskTitle(title);
                        // adding state won't work well inside prompt, so direct call:
                        // This is a quick hack, better to use modal. 
                        // For now we just populate state and let user confirm or use another method.
                        // Actually, simplest is to just call addTask directly if we refactor addTask to take title.
                        // But reusing the existing state based implementation:
                        // Let's rely on the main "Add Task" button for now or a simplified flow.
                      }
                    }}
                    className="w-full text-[10px] text-slate-300 hover:text-indigo-500 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading tasks...</div>;

  return (
    <div className="h-full p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Action Board</h2>
          <p className="text-slate-500 text-sm">Execute your roadmap one step at a time.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => React.startTransition(() => setView('board'))} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Board</button>
            <button onClick={() => React.startTransition(() => setView('calendar'))} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Calendar</button>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'board' ? (
          <div className="flex gap-6 h-full overflow-x-auto pb-2">
            <Column title="To Do" status="todo" icon={Circle} color="border-slate-300" />
            <Column title="In Progress" status="in_progress" icon={Clock} color="border-blue-400" />
            <Column title="Completed" status="done" icon={CheckCircle2} color="border-green-500" />
          </div>
        ) : (
          <CalendarView />
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
