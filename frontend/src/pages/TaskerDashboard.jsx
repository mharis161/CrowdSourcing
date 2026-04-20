import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  Wallet, 
  Clock, 
  Trophy, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  CheckCircle2,
  Brain,
  ChevronRight,
  TrendingUp,
  User,
  Bell
} from 'lucide-react';

const TaskerDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');

  const stats = [
    { label: 'Total Earned', value: '$1,240.50', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tasks Completed', value: '48', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Hours', value: '124h', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Success Rate', value: '98.5%', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const tasks = [
    { id: 1, title: 'AI Model RLHF Evaluation', category: 'Testing', reward: '$12.00', time: '15 mins', difficulty: 'Medium', tags: ['AI', 'Logic'] },
    { id: 2, title: 'Sentiment Analysis for E-commerce', category: 'Data Labeling', reward: '$4.50', time: '5 mins', difficulty: 'Easy', tags: ['Data', 'Retail'] },
    { id: 3, title: 'Creative Writing: Story Prompts', category: 'Content', reward: '$25.00', time: '45 mins', difficulty: 'Hard', tags: ['Creative', 'English'] },
    { id: 4, title: 'Audio Transcription: Business Meeting', category: 'Transcription', reward: '$18.00', time: '30 mins', difficulty: 'Medium', tags: ['Audio', 'Business'] },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#7f0df2] p-1.5 rounded-lg">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CrowdTask</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[#7f0df2] bg-purple-50 rounded-xl">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Search className="w-4 h-4" />
            Browse Tasks
          </button>
          <Link to="/wallet" className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Wallet className="w-4 h-4" />
            Wallet & Payouts
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-900 rounded-2xl p-4 mb-4">
            <p className="text-slate-400 text-xs font-medium mb-1">PRO PLAN</p>
            <p className="text-white text-sm font-bold mb-3">Earn 2x more with our Pro features.</p>
            <button className="w-full py-2 bg-[#7f0df2] text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors">Upgrade Now</button>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors mb-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
            <h1 className="text-xl font-bold text-slate-900">Welcome back, John!</h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Level 4 Tasker</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
              <User className="w-5 h-5 text-[#7f0df2]" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Task List */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Recommended Tasks</h2>
                <button className="text-sm font-semibold text-[#7f0df2] hover:underline">View all</button>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#7f0df2] transition-all hover:shadow-md cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">{tag}</span>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-slate-900">{task.reward}</span>
                    </div>
                    <h3 className="text-md font-bold text-slate-900 group-hover:text-[#7f0df2] transition-colors mb-2">{task.title}</h3>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {task.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        {task.difficulty}
                      </div>
                      <div className="ml-auto">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#7f0df2] transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-8">
              {/* Daily Goal */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-md font-bold text-slate-900 mb-4">Daily Goal</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Earnings goal</span>
                  <span className="text-sm font-bold text-slate-900">$18.50 / $25.00</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full mb-6">
                  <div className="h-2 bg-[#7f0df2] rounded-full" style={{ width: '74%' }}></div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">You're doing great! Complete 2 more medium tasks to reach your goal.</p>
              </div>

              {/* Achievements */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-md font-bold text-slate-900 mb-4">Recent Badges</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-orange-200">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 uppercase">Fast Learner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-blue-200">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 uppercase">Perfectionist</p>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">View Profile</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskerDashboard;
