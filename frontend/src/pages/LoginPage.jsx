import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network, HelpCircle, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const loginStore = useAuthStore(state => state.login);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', data);
      const user = response.data;
      loginStore(user, user.token);
      
      // Redirect based on role
      if (user.role === 'COMPANY') {
        navigate('/dashboard/company');
      } else {
        navigate('/dashboard/tasker');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 lg:px-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Network className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight">CrowdForge</h2>
          </Link>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span>Help Center</span>
            </button>
            <Link to="/register" className="h-10 px-5 bg-primary text-white text-sm font-bold rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              Create Account
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-transparent">
          <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-primary/5 p-8 md:p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400">Sign in to manage your tasks or projects.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input 
                    {...register('email', { required: 'Email is required' })}
                    className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none focus:border-primary transition-all text-sm" 
                    placeholder="name@example.com" 
                    type="email" 
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <Link className="text-primary text-xs font-bold hover:underline" to="#">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input 
                    {...register('password', { required: 'Password is required' })}
                    className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-12 focus:ring-2 focus:ring-primary/20 outline-none focus:border-primary transition-all text-sm" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'} 
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center gap-2 py-1 ml-1">
                <input className="size-4 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all" id="remember" type="checkbox"/>
                <label className="text-slate-500 dark:text-slate-400 text-xs font-medium cursor-pointer" htmlFor="remember">Keep me signed in</label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
                <span className="relative px-4 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path></svg>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  Apple
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              New to CrowdForge?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">Create an account</Link>
            </p>
          </div>
        </main>

        <footer className="p-8 text-center text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex justify-center gap-8 mb-4">
            <Link className="hover:text-primary transition-colors" to="#">Privacy</Link>
            <Link className="hover:text-primary transition-colors" to="#">Terms</Link>
            <Link className="hover:text-primary transition-colors" to="#">Contact</Link>
          </div>
          <p>© 2024 CrowdForge Inc.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
