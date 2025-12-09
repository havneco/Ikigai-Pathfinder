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

  const addTask = async (status: TaskStatus = 'todo') => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Partial<Task> = {
      user_id: userId,
      title: newTaskTitle,
      status: status,
      priority: 'medium',
      ai_generated: false
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
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    } catch (e) {
       console.error('Error updating task', e);
       fetchTasks(); // Revert on error
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

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
                  onBlur={() => { if(!newTaskTitle) setIsAdding(false); }}
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
                   {task.quadrant ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold uppercase tracking-wider">{task.quadrant}</span>
                   ) : (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 text-slate-400 font-medium">Task</span>
                   )}
                   
                   <div className="flex items-center gap-1">
                      {status !== 'todo' && (
                        <button onClick={() => updateStatus(task.id, 'todo')} className="p-1 text-slate-300 hover:text-slate-500" title="Move to Todo"><Circle size={14}/></button>
                      )}
                      {status !== 'in_progress' && (
                        <button onClick={() => updateStatus(task.id, 'in_progress')} className="p-1 text-slate-300 hover:text-blue-500" title="Move to In Progress"><Clock size={14}/></button>
                      )}
                      {status !== 'done' && (
                        <button onClick={() => updateStatus(task.id, 'done')} className="p-1 text-slate-300 hover:text-green-500" title="Move to Done"><CheckCircle2 size={14}/></button>
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

  if (loading) return <div className="p-10 text-center text-slate-400">Loading tasks...</div>;

  return (
    <div className="h-full p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Action Board</h2>
            <p className="text-slate-500 text-sm">Execute your roadmap one step at a time.</p>
         </div>
         <button 
           onClick={() => setIsAdding(true)}
           className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800"
         >
           <Plus size={16} /> Add Task
         </button>
      </div>

      <div className="flex-1 overflow-x-auto">
         <div className="flex gap-6 h-full min-w-[900px]">
            <Column title="To Do" status="todo" icon={Circle} color="border-slate-300" />
            <Column title="In Progress" status="in_progress" icon={Clock} color="border-blue-400" />
            <Column title="Completed" status="done" icon={CheckCircle2} color="border-green-500" />
         </div>
      </div>
    </div>
  );
};

export default TaskBoard;
