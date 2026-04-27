import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  LogOut, Plus, Trash2, Loader2, Sparkles, Zap, Target, Clock, ChevronRight, 
  History, CheckCircle, AlertTriangle, Flame, Lightbulb, MousePointer2, 
  CheckCircle2, TrendingUp, Filter, LayoutGrid, BellRing, Info, Edit3, X, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusMode from '../components/FocusMode';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [insights, setInsights] = useState({ tips: [], streak: 0 });
  const [nudges, setNudges] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [context, setContext] = useState('work');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusingTask, setFocusingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [decisionMode, setDecisionMode] = useState(true);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, nextRes, insightsRes, nudgesRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/next'),
        api.get('/tasks/insights'),
        api.get('/tasks/nudges')
      ]);
      setTasks(tasksRes.data);
      setNextTask(nextRes.data);
      setInsights(insightsRes.data);
      setNudges(nudgesRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/tasks', { title: newTask, deadline: deadline || null, context });
      setNewTask(''); setDeadline('');
      await fetchData();
    } catch (err) { fetchData(); } finally { setSubmitting(false); }
  };

  const updateTask = async (id, data) => {
    try {
      await api.put(`/tasks/${id}`, data);
      setEditingTask(null);
      await fetchData();
    } catch (err) { fetchData(); }
  };

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchData();
    } catch (err) { fetchData(); }
  };

  const deleteTask = async (id) => {
    try {
      setTasks(tasks.filter(t => t.id !== id));
      await api.delete(`/tasks/${id}`);
      fetchData();
    } catch (err) { fetchData(); }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const displayedTasks = decisionMode ? pendingTasks.slice(0, 3) : pendingTasks;
  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-10 h-10 text-primary-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 surface-glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">IntelliTask <span className="text-primary-600 italic">AI</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">High Performance OS</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-3 bg-white/50 border border-slate-200/60 rounded-full px-4 py-1.5 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Momentum: {Math.round(progress)}%</span>
             </div>
             <div className="h-8 w-px bg-slate-200/60 mx-2"></div>
             <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm click-feedback border border-transparent hover:border-rose-100">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 flex flex-col lg:grid lg:grid-cols-[1fr,380px] gap-12">
        {/* Main Operating Area */}
        <div className="space-y-12">
          {/* Real-time Nudges */}
          <AnimatePresence>
            {nudges.map((nudge, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-6 rounded-[2rem] flex items-center justify-between gap-6 shadow-xl shadow-amber-900/5 group"
              >
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
                       <BellRing className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 leading-tight">{nudge.message}</p>
                      <p className="text-xs text-amber-700/60 mt-1 font-medium">Intelligent nudge based on your workflow</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setFocusingTask(pendingTasks[0])}
                  className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold text-sm click-feedback shadow-lg shadow-amber-600/20 shrink-0 hover:bg-amber-700 transition-colors"
                 >
                    Address Now
                 </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Productivity Hero */}
          <AnimatePresence mode="wait">
            {nextTask && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="hero-card p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12 group"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
                   <Target className="w-80 h-80 -rotate-12" />
                </div>
                
                <div className="flex-1 space-y-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-600/20">
                       Optimal Decision
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                       <Clock className="w-3.5 h-3.5" /> High Performance Window
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                    {nextTask.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-3">
                     <span className="bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">{nextTask.context}</span>
                     {nextTask.riskLevel === 'high' && (
                       <span className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">High Risk Objective</span>
                     )}
                  </div>
                </div>

                <button 
                  onClick={() => setFocusingTask(nextTask)}
                  className="btn-human-primary w-full md:w-auto md:px-12 h-24 text-xl group flex items-center justify-center gap-4 shrink-0"
                >
                  Enter Focus Mode
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Adaptive Workspace Grid */}
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="flex items-center gap-8 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 w-fit">
                  <button 
                    onClick={() => setDecisionMode(true)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${decisionMode ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Smart View
                  </button>
                  <button 
                    onClick={() => setDecisionMode(false)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${!decisionMode ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Full Backlog
                  </button>
               </div>
               {decisionMode && (
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white border border-slate-200/60 px-4 py-2 rounded-full shadow-sm">
                   <Zap className="w-3.5 h-3.5 text-primary-500" /> AI Filter: Top 3 Decisions
                 </div>
               )}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {displayedTasks.map((task) => (
                  <motion.div
                    key={task.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`surface-card p-6 rounded-[2rem] flex items-center gap-8 relative group overflow-hidden ${task.riskLevel === 'high' ? 'border-rose-100 bg-rose-50/5' : ''}`}
                  >
                    <div className={`state-indicator ${task.status === 'completed' ? 'state-completed' : task.riskLevel === 'high' ? 'state-overdue' : 'state-pending'}`}></div>
                    
                    <button 
                      onClick={() => toggleTask(task.id, task.status)}
                      className="shrink-0 w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center transition-all bg-white click-feedback hover:border-primary-500 hover:bg-primary-50 group/check"
                    >
                       <CheckCircle2 className={`w-7 h-7 transition-colors ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-200 group-hover/check:text-primary-500'}`} />
                    </button>
                    
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                         <h4 className={`text-xl font-bold tracking-tight transition-all ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                           {task.title}
                         </h4>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{task.context}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {task.deadline && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        {task.explanation && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-500 uppercase tracking-widest italic">
                            <Info className="w-3.5 h-3.5" /> {task.explanation}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingTask(task)} 
                        className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all click-feedback"
                      >
                         <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all click-feedback"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {pendingTasks.length === 0 && (
                <div className="py-20 text-center space-y-4 bg-slate-100/30 border-2 border-dashed border-slate-200 rounded-[3rem]">
                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-slate-800">Operational Excellence</h3>
                     <p className="text-slate-400 font-medium">All objectives for this cycle have been cleared.</p>
                   </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Intelligence Sidebar */}
        <aside className="space-y-10">
          {/* Quick Capture */}
          <div className="surface-card p-8 rounded-[2.5rem]">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Objective Capture</h3>
             <form onSubmit={addTask} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" placeholder="What's next?" className="human-input w-full"
                    value={newTask} onChange={(e) => setNewTask(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</label>
                    <select 
                      value={context} onChange={(e) => setContext(e.target.value)}
                      className="human-input w-full appearance-none py-3"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                    <input 
                      type="date" className="human-input w-full py-3"
                      value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full btn-human-primary">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Seed Objective</>}
                </button>
             </form>
          </div>

          {/* AI Insights & Progress */}
          <div className="surface-card p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Momentum</h3>
                <TrendingUp className="w-4 h-4 text-primary-500" />
             </div>
             
             <div className="relative h-5 bg-slate-200/50 rounded-2xl overflow-hidden mb-6 p-1">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl shadow-lg shadow-primary-600/20"
                ></motion.div>
             </div>
             
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-4xl font-bold text-slate-900 tracking-tight">{Math.round(progress)}%</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completion Index</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-bold text-slate-700">{insights.streak}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Streak</p>
                </div>
             </div>
          </div>

          {/* AI Behavioral Tips */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-slate-950/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-20 h-20 text-primary-400 fill-primary-400" />
             </div>
             
             <div className="flex items-center gap-2 relative z-10">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400">Behavioral Intelligence</h3>
             </div>
             
             <div className="space-y-4 relative z-10">
               {insights.tips.map((tip, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                     <p className="text-sm font-medium text-slate-300 leading-relaxed italic">“{tip}”</p>
                  </div>
               ))}
               {insights.tips.length === 0 && <p className="text-xs text-slate-500 italic">Synthesizing behavioral patterns...</p>}
             </div>
          </div>
        </aside>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setEditingTask(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md surface-card p-10 rounded-[3rem] shadow-2xl"
            >
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Objective</h2>
                  <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
               </div>
               
               <form onSubmit={(e) => {
                 e.preventDefault();
                 updateTask(editingTask.id, { 
                   title: editingTask.title, 
                   deadline: editingTask.deadline, 
                   context: editingTask.context 
                 });
               }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      type="text" className="human-input w-full"
                      value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</label>
                      <select 
                        value={editingTask.context} onChange={(e) => setEditingTask({...editingTask, context: e.target.value})}
                        className="human-input w-full appearance-none py-3"
                      >
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="learning">Learning</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                      <input 
                        type="date" className="human-input w-full py-3"
                        value={editingTask.deadline ? new Date(editingTask.deadline).toISOString().split('T')[0] : ''} 
                        onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-human-primary py-5 text-lg">Update Objective</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {focusingTask && (
          <FocusMode 
            task={focusingTask} 
            onClose={() => setFocusingTask(null)}
            onComplete={async (id) => {
               await toggleTask(id, 'pending');
               setFocusingTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
