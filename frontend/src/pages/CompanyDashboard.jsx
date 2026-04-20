import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  Wallet, 
  Clock, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Plus,
  Users,
  Grid,
  TrendingUp,
  User,
  Bell,
  MoreVertical,
  Activity,
  Layers,
  ArrowRight,
  X,
  Target,
  DollarSign,
  Calendar,
  MapPin,
  Globe,
  Edit3,
  PlayCircle,
  PauseCircle,
  BarChart,
  Map as MapIcon,
  FileEdit
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { getCurrencyInfo, formatCurrency } from '../utils/currency';
import MapPicker from '../components/MapPicker';
import SurveyBuilder from '../components/SurveyBuilder';
import { useToastStore } from '../store/useToastStore';


const CompanyDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const currencyInfo = getCurrencyInfo(user?.company?.country);
  const [locations, setLocations] = useState([]);
  
  const [editingTaskId, setEditingTaskId] = useState(null);
  const selectedTask = tasks.find(t => t.id === editingTaskId);
  const [liveDataTask, setLiveDataTask] = useState(null);
  
  const [surveyConfig, setSurveyConfig] = useState(null);
  const [isSurveyBuilderOpen, setIsSurveyBuilderOpen] = useState(false);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const taskType = watch('type', 'SURVEY');
  const showToast = useToastStore(state => state.showToast);


  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
      showToast('Failed to update status.', 'error');
    }

  };

  const handleEditTask = async (task) => {
    try {
      // Direct high-consistency fetch to ensure we have all locations
      const response = await api.get(`/tasks/${task.id}`);
      const freshTask = response.data;
      
      setEditingTaskId(freshTask.id);
      reset({
        title: freshTask.title,
        description: freshTask.description,
        type: freshTask.type,
        reward: freshTask.reward,
        maxParticipants: freshTask.maxParticipants,
        deadline: freshTask.deadline ? new Date(freshTask.deadline).toISOString().split('T')[0] : ''
      });
      // Load existing locations onto the map
      setLocations(freshTask.locations || []); 
      setSurveyConfig(freshTask.surveyConfig || null);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      showToast('Failed to load project details.', 'error');
    }

  };

  const handleOpenNewModal = () => {
    setEditingTaskId(null);
    reset({ title: '', description: '', type: 'SURVEY', reward: '', maxParticipants: '', deadline: '' });
    setLocations([]);
    setSurveyConfig(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, locations, surveyConfig };
      
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, payload);
        showToast('Project updated successfully!', 'success');
      } else {
        if (locations.length === 0) {
          showToast('Please select at least one geographic target on the map.', 'warning');
          return;
        }
        await api.post('/tasks', payload);
        showToast('Project launched successfully across all selected locations!', 'success');
      }

      
      setIsModalOpen(false);
      reset();
      setLocations([]);
      setSurveyConfig(null);
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error('Task save failed:', error);
      showToast(error.response?.data?.message || 'Failed to save project.', 'error');
    }

  };

  const stats = [
    { label: 'Active Projects', value: tasks.filter(t => t.status === 'ACTIVE').length, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Taskers', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Budget Spent', value: formatCurrency(0, user?.company?.country), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Completion Rate', value: '0%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#7f0df2] p-1.5 rounded-lg">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CrowdTask</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#7f0df2] bg-purple-50 rounded-xl">
            <LayoutDashboard className="w-4 h-4" />
            Project Hub
          </button>
          <button 
            onClick={handleOpenNewModal}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Users className="w-4 h-4" />
            Team Management
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Wallet className="w-4 h-4" />
            Billing & Invoices
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-900 rounded-2xl p-4 mb-4">
            <p className="text-slate-400 text-xs font-medium mb-1">PRO PLAN</p>
            <p className="text-white text-sm font-bold mb-3">Upgrade for automated quality control.</p>
            <button className="w-full py-2 bg-[#7f0df2] text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors">Upgrade Now</button>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors mb-2">
            <Settings className="w-4 h-4" />
            Admin Settings
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Company Overview</h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">{user?.company?.companyName || 'My Company'}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
               <Search className="w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search projects..." className="bg-transparent border-none outline-none text-xs w-32" />
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#7f0df2] rounded-full border-2 border-white"></div>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <span className="text-blue-600 text-xs font-bold">{user?.name?.charAt(0) || 'C'}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Welcome Card */}
          <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="relative z-10 max-w-lg">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Welcome Back, {user?.name}</p>
              <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">Manage your projects with <span className="text-[#7f0df2]">precision</span>.</h2>
              <p className="text-slate-500 text-base font-normal mb-6">Launch new tasks to start collecting data from our global workforce instantly.</p>
              <button 
                onClick={handleOpenNewModal}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 group"
              >
                Launch New Project
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#7f0df2]/5 rounded-full blur-3xl"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative z-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Ongoing Projects</h2>
              <button 
                onClick={handleOpenNewModal}
                className="px-4 py-2 bg-[#7f0df2] text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </button>
            </div>
            <div className="overflow-visible min-h-[150px]">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading projects...</div>
              ) : tasks.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No projects found. Launch your first project today!</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-4">Project Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Reward</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right pr-8">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{task.description}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-slate-600">{task.type}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-emerald-600">{formatCurrency(task.reward)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${task.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setLiveDataTask(task)} 
                              className="group relative p-1.5 rounded-lg text-slate-400 hover:text-[#7f0df2] hover:bg-purple-50 transition-colors"
                            >
                              <BarChart className="w-4 h-4" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  View Live Data
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                              </button>
                              {task.type === 'SURVEY' && (
                                <button 
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setSurveyConfig(task.surveyConfig || null);
                                    setIsSurveyBuilderOpen(true);
                                  }} 
                                  className="group relative p-1.5 rounded-lg text-slate-400 hover:text-[#7f0df2] hover:bg-purple-50 transition-colors"
                                >
                                  <FileEdit className="w-4 h-4" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Design Survey
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                  </div>
                                </button>
                              )}
                              <button 
                                onClick={() => handleEditTask(task)} 
                              className="group relative p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Edit Project
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </button>
                            {task.status === 'ACTIVE' ? (
                               <button 
                                 onClick={() => handleUpdateStatus(task.id, 'PAUSED')} 
                                 className="group relative p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                               >
                                 <PauseCircle className="w-4 h-4" />
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                   Pause Campaign
                                   <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                 </div>
                               </button>
                            ) : (
                               <button 
                                 onClick={() => handleUpdateStatus(task.id, 'ACTIVE')} 
                                 className="group relative p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                               >
                                 <PlayCircle className="w-4 h-4" />
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                   Resume Campaign
                                   <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                 </div>
                               </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Optimized Unified Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[4px] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-[95vw] max-w-[1400px] h-[95vh] shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* 1. Slim Header */}
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-[#7f0df2] p-2 rounded-xl shadow-lg shadow-purple-100">
                  <Target className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-none">{editingTaskId ? 'Edit Deployment' : 'Initialize Deployment'}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{editingTaskId ? 'Update configured parameters' : 'Configure your global workforce'}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* 2. Content: Two-Column Flex Layout */}
            <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-slate-50/20">
              {/* Left Column: Core Configuration */}
              <div className="w-full lg:w-[440px] shrink-0 border-r border-slate-100 p-7 space-y-5 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Project Name</label>
                    <input 
                      {...register('title', { required: 'Project name is required' })}
                      className={`w-full h-11 bg-white border ${errors.title ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 text-xs font-bold focus:border-[#7f0df2] outline-none transition-all shadow-sm`}
                      placeholder="e.g. Infrastructure Audit"
                    />
                    {errors.title && <span className="text-red-500 text-[10px] font-bold">{errors.title.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Instructions</label>
                    <textarea 
                      {...register('description', { required: 'Instructions are required' })}
                      rows="3"
                      className={`w-full bg-white border ${errors.description ? 'border-red-400' : 'border-slate-200'} rounded-xl p-4 text-xs font-bold focus:border-[#7f0df2] outline-none transition-all resize-none shadow-sm`}
                      placeholder="Task details..."
                    ></textarea>
                    {errors.description && <span className="text-red-500 text-[10px] font-bold">{errors.description.message}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                      <select {...register('type', { required: true })} className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer">
                        <option value="SURVEY">SURVEY</option>
                        <option value="DATA_ENTRY">DATA INPUT</option>
                        <option value="REVIEW">AUDIT</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#7f0df2] uppercase tracking-widest pl-1">Reward ({currencyInfo.symbol})</label>
                      <input {...register('reward', { required: 'Required', min: 0.01 })} type="number" step="0.01" className={`w-full h-12 bg-white border ${errors.reward ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 text-xs font-black text-slate-900 outline-none shadow-sm`} placeholder="0.00" />
                      {errors.reward && <span className="text-red-500 text-[10px] font-bold">{errors.reward.message}</span>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Capacity</label>
                      <input {...register('maxParticipants', { required: 'Required', min: 1 })} type="number" className={`w-full h-12 bg-white border ${errors.maxParticipants ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 text-xs font-bold outline-none shadow-sm`} placeholder="00" />
                      {errors.maxParticipants && <span className="text-red-500 text-[10px] font-bold">{errors.maxParticipants.message}</span>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deadline</label>
                      <input {...register('deadline')} type="date" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer shadow-sm" />
                    </div>
                  </div>
                  
                  {taskType === 'SURVEY' && (
                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsSurveyBuilderOpen(true)}
                        className={`w-full py-3 px-4 border text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${surveyConfig ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-purple-50 border-purple-200 text-[#7f0df2] hover:bg-purple-100'}`}
                      >
                        <Settings className="w-4 h-4" />
                        {surveyConfig ? 'Edit Configured Survey' : 'Open Survey Builder'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Geographic Canvas */}
              <div className="flex-1 p-7 overflow-y-auto">
                <MapPicker 
                  key={editingTaskId || 'new'} 
                  onLocationsUpdate={setLocations} 
                  initialLocations={locations} 
                />
              </div>
            </form>

            {/* 3. Action Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
               <div className="hidden md:flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Engine Ready</span>
               </div>
               <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 h-12 text-slate-400 text-xs font-black hover:text-slate-950 transition-colors uppercase tracking-widest">Discard</button>
                  <button type="submit" form="project-form" className={`px-10 h-12 ${editingTaskId ? 'bg-[#7f0df2] hover:bg-purple-700' : 'bg-[#1a1a1a] hover:bg-black'} text-white text-[11px] font-black rounded-xl shadow-xl active:scale-95 transition-all flex items-center gap-3 uppercase tracking-tighter`}>
                    {editingTaskId ? 'Save Changes' : 'Broadcast Project'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Data Dummy Modal */}
      {liveDataTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[4px] animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl p-8 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative border border-slate-100">
             <button onClick={() => setLiveDataTask(null)} className="absolute right-6 top-6 p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                <X className="w-4 h-4 text-slate-400 cursor-pointer" />
             </button>
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-2xl">
                   <BarChart className="text-[#7f0df2] w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Insights: {liveDataTask.title}</h2>
                   <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Real-time data stream active • 12 active nodes</p>
                </div>
             </div>
             <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submissions</p>
                   <p className="text-3xl font-black text-slate-900">14</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acceptance Rate</p>
                   <p className="text-3xl font-black text-emerald-500">92%</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget Burned</p>
                   <p className="text-3xl font-black text-orange-500">{formatCurrency(liveDataTask.reward * 14)}</p>
                </div>
             </div>
             
             <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Participant ID</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Submission Time</th>
                      <th className="px-6 py-4">Quality Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-6 py-4"><span className="text-xs font-bold font-mono text-slate-600">USR-84A9</span></td>
                      <td className="px-6 py-4 flex items-center gap-2"><MapIcon className="w-3 h-3 text-slate-400"/> <span className="text-xs font-bold text-slate-800">Islamabad Focus Zone</span></td>
                      <td className="px-6 py-4"><span className="text-xs font-bold text-slate-500">2 mins ago</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">9.8/10</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-6 py-4"><span className="text-xs font-bold font-mono text-slate-600">USR-912B</span></td>
                      <td className="px-6 py-4 flex items-center gap-2"><MapIcon className="w-3 h-3 text-slate-400"/> <span className="text-xs font-bold text-slate-800">Sector F-8 Alpha</span></td>
                      <td className="px-6 py-4"><span className="text-xs font-bold text-slate-500">14 mins ago</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">9.4/10</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-6 py-4"><span className="text-xs font-bold font-mono text-slate-600">USR-22CQ</span></td>
                      <td className="px-6 py-4 flex items-center gap-2"><MapIcon className="w-3 h-3 text-slate-400"/> <span className="text-xs font-bold text-slate-800">Blue Area Main</span></td>
                      <td className="px-6 py-4"><span className="text-xs font-bold text-slate-500">1 hr ago</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black">6.2/10 (Review)</span></td>
                    </tr>
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}

      {/* Survey Builder Modal */}
      {isSurveyBuilderOpen && (
        <SurveyBuilder 
          initialJson={surveyConfig}
          onSave={async (json) => {
            setSurveyConfig(json);
            setIsSurveyBuilderOpen(false);
            
            // If we opened this directly from the table (main modal is closed), save it instantly
            if (!isModalOpen && editingTaskId) {
              try {
                await api.put(`/tasks/${editingTaskId}`, { surveyConfig: json });
                fetchTasks();
                showToast('Survey changes synced to database', 'success');
              } catch (error) {
                console.error('Fast survey save failed:', error);
                showToast('Saved survey to view, but failed to sync to database.', 'error');
              }

            }
          }}
          onClose={() => {
            setIsSurveyBuilderOpen(false);
            if (!isModalOpen) setEditingTaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;
