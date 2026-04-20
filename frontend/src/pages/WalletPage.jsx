import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  Wallet, 
  Clock, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  User,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  SearchIcon,
  Filter,
  CreditCard,
  Banknote,
  ChevronRight
} from 'lucide-react';

const WalletPage = () => {
  const transactions = [
    { id: 1, type: 'Income', title: 'AI Model RLHF Evaluation', amount: '+$12.00', date: 'Oct 24, 2024', status: 'Completed', icon: ArrowDownLeft, color: 'text-emerald-500' },
    { id: 2, type: 'Income', title: 'Sentiment Analysis', amount: '+$4.50', date: 'Oct 23, 2024', status: 'Completed', icon: ArrowDownLeft, color: 'text-emerald-500' },
    { id: 3, type: 'Withdrawal', title: 'Payout to Bank Account', amount: '-$50.00', date: 'Oct 20, 2024', status: 'Processing', icon: ArrowUpRight, color: 'text-slate-900' },
    { id: 4, type: 'Income', title: 'Creative Writing Tasks', amount: '+$25.00', date: 'Oct 19, 2024', status: 'Completed', icon: ArrowDownLeft, color: 'text-emerald-500' },
    { id: 5, type: 'Income', title: 'Audio Transcription', amount: '+$18.00', date: 'Oct 18, 2024', status: 'Completed', icon: ArrowDownLeft, color: 'text-emerald-500' },
  ];

  const payoutMethods = [
    { id: 1, name: 'Bank Transfer', details: 'Ending in 4521', icon: Banknote },
    { id: 2, name: 'PayPal', details: 'john.doe@email.com', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#7f0df2] p-1.5 rounded-lg">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CrowdTask</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/dashboard/tasker" className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Search className="w-4 h-4" />
            Browse Tasks
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[#7f0df2] bg-purple-50 rounded-xl">
            <Wallet className="w-4 h-4" />
            Wallet & Payouts
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>

        <div className="p-4 mt-auto">
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
          <h1 className="text-xl font-bold text-slate-900">My Wallet</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400 cursor-pointer" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#7f0df2] rounded-full border-2 border-white"></div>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
              <User className="w-5 h-5 text-[#7f0df2]" />
            </div>
          </div>
        </header>

        {/* Wallet Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Top Section: Balance & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Balance Card */}
              <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-[240px]">
                <div className="relative z-10">
                  <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-widest">Available Balance</p>
                  <h2 className="text-4xl lg:text-5xl font-black text-white">$1,240.50</h2>
                </div>
                <div className="relative z-10 flex gap-4 mt-8">
                    <button className="flex-1 py-3 bg-[#7f0df2] hover:bg-purple-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                        Withdraw
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#7f0df2]/20 rounded-full blur-3xl"></div>
                <div className="absolute top-4 right-4 text-white/10">
                    <Wallet className="w-24 h-24" />
                </div>
              </div>

              {/* Weekly Chart Placeholder / Payout Methods */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Earnings Streak</h3>
                        <p className="text-sm text-slate-500">You've reached your daily goal 5 days in a row!</p>
                    </div>
                    <div className="flex items-end gap-2 h-24 mt-4">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-purple-50 rounded-t-md relative group">
                                <div className="absolute bottom-0 left-0 right-0 bg-[#7f0df2] rounded-t-md transition-all duration-500" style={{ height: `${h}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Payout Methods</h3>
                    <div className="space-y-4">
                        {payoutMethods.map((method) => (
                            <div key={method.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-[#7f0df2]/20 hover:bg-purple-50/50 transition-all cursor-pointer group">
                                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                                    <method.icon className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="grow">
                                    <p className="text-sm font-bold text-slate-900">{method.name}</p>
                                    <p className="text-xs text-slate-500">{method.details}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7f0df2]" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold rounded-xl hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        Add New Method
                    </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Transaction History */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
                        <p className="text-sm text-slate-500">View and manage your recent financial activity.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative grow md:w-64">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-[#7f0df2]/20" placeholder="Search transactions..." />
                        </div>
                        <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100"><Filter className="w-5 h-5 text-slate-600" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <th className="px-8 py-4">Transaction</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white border border-slate-100 transition-all">
                                                <tx.icon className={`w-5 h-5 ${tx.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{tx.title}</p>
                                                <p className="text-xs text-slate-500">{tx.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-sm text-slate-500 font-medium">{tx.date}</td>
                                    <td className="px-6 py-6">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`text-base font-black ${tx.amount.startsWith('+') ? 'text-[#7f0df2]' : 'text-slate-900'}`}>
                                            {tx.amount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                    <button className="text-sm font-bold text-slate-500 hover:text-[#7f0df2] transition-colors">Show All Transactions</button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Internal Plus icon since it was used in Wallet balance quick action
const Plus = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default WalletPage;
