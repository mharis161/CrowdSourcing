import React from 'react';
import { Link } from 'react-router-dom';
import { Network, ArrowRight, Building2, CheckCircle2, Users, Wallet, Clock, Brain, Send } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Network className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-800 tracking-tight text-slate-900 dark:text-white">CrowdTask</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">How it Works</a>
            <a className="text-sm font-medium hover:text-primary transition-colors" href="#solutions">Solutions</a>
            <a className="text-sm font-medium hover:text-primary transition-colors" href="#rewards">Rewards</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Trusted by 5,000+ companies
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              Empower Your Projects with <span className="text-primary">Global Intelligence</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              CrowdTask connects forward-thinking companies with a skilled global workforce to complete data, research, and creative tasks faster and more accurately.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?role=company" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary/25 transition-all flex items-center gap-2">
                Start a Project <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register?role=participant" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all">
                Earn Rewards
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              <img alt="Collaborative team working in a modern office" className="w-full h-auto object-cover aspect-[4/3]" src="/assets/hero_team_collaboration.png"/>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="bg-white dark:bg-slate-900/50 py-12 border-y border-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">500K+</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Participants</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">2.5M+</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Tasks Completed</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">$10M+</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Paid to Contributors</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">99.8%</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Quality Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background-light dark:bg-background-dark" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Scalable Solutions for Everyone</h2>
            <p className="text-slate-600 dark:text-slate-400">Whether you're looking to scale your operations or earn extra income, CrowdTask provides the infrastructure for success.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Companies */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                <Building2 className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-6">For Companies</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <CheckCircle2 className="text-green-500 w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Post Complex Tasks</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Break down large projects into manageable micro-tasks for our global workforce.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="text-green-500 w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">AI-Assisted Quality Control</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Every result is verified by our multi-layered validation system to ensure accuracy.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="text-green-500 w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">On-Demand Scaling</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Access thousands of workers instantly without the overhead of traditional hiring.</p>
                  </div>
                </li>
              </ul>
              <Link to="/register?role=company" className="flex items-center justify-center mt-10 w-full py-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-all">Launch a Project</Link>
            </div>

            {/* For Participants */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                <Users className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-6">For Participants</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Wallet className="text-primary w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Earn Real Rewards</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Get paid in cash or gift cards for every task you successfully complete.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Clock className="text-primary w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Flexible Work</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Work whenever and wherever you want. All you need is an internet connection.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Brain className="text-primary w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Diverse Task Library</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">From AI data labeling to surveys and content review, choose tasks that fit your skills.</p>
                  </div>
                </li>
              </ul>
              <Link to="/register?role=participant" className="flex items-center justify-center mt-10 w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all">Start Earning</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Map/Global Section */}
      <section className="py-24 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#7f0df2 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">A Truly Borderless Workforce</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12">We span across 150+ countries, bringing diverse perspectives and 24/7 availability to your most critical projects.</p>
          <div className="bg-slate-800/50 rounded-3xl p-4 border border-slate-700 backdrop-blur-sm max-w-5xl mx-auto">
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img alt="Global connectivity map" className="w-full h-full object-cover opacity-60" src="/assets/global_connectivity_map.png"/>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary p-1 rounded-lg">
                  <Network className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-800 tracking-tight">CrowdTask</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">The premier platform for high-quality data and human intelligence at scale.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Press</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">Documentation</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">API Reference</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Newsletter</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Get the latest updates on crowdsourcing trends.</p>
              <div className="flex gap-2">
                <input className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Email" type="email"/>
                <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2024 CrowdTask Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-xs text-slate-500 hover:text-primary" href="#">Privacy Policy</a>
              <a className="text-xs text-slate-500 hover:text-primary" href="#">Terms of Service</a>
              <a className="text-xs text-slate-500 hover:text-primary" href="#">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
