import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network, X, Briefcase, Wallet, ShieldCheck, Lock, Shield, ArrowRight, User, Mail, Building2, CheckCircle2, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('COMPANY'); // Matches Prisma enum
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        role: role
      };
      
      const response = await api.post('/auth/register', payload);
      login(response.data, response.data.token);
      
      // Redirect based on role
      if (role === 'COMPANY') {
        navigate('/dashboard/company');
      } else {
        navigate('/dashboard/tasker');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong during registration');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-primary/10 overflow-hidden relative z-10 my-auto">
            
            {/* Header */}
            <header className="flex items-center justify-between border-b border-primary/5 px-8 py-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="size-9 flex items-center justify-center bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                  <Network className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">CrowdForge</h2>
              </Link>
              <button 
                onClick={() => navigate('/')}
                className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-8 md:p-10">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {step} of 3</p>
                  <span className="text-xs font-bold text-slate-400">{(step/3*100).toFixed(0)}% Complete</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${(step/3)*100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">How will you use the platform?</h1>
                    <p className="text-slate-500 dark:text-slate-400">Choose the account type that best fits your needs.</p>
                  </div>
                  
                  <div className="grid gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setRole('COMPANY')}
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                        role === 'COMPANY' 
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-primary/30'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${role === 'COMPANY' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">I want to Hire</p>
                        <p className="text-sm text-slate-500 mt-1">Post tasks, manage projects, and scale your data needs.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('PARTICIPANT')}
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                        role === 'PARTICIPANT' 
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-primary/30'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${role === 'PARTICIPANT' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">I want to Earn</p>
                        <p className="text-sm text-slate-500 mt-1">Complete micro-tasks and earn rewards from anywhere.</p>
                      </div>
                    </button>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={nextStep}
                    className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-4"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Create your profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">Tell us a bit about yourself.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          {...register('name', { required: 'Name is required' })}
                          className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                          })}
                          type="email"
                          className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                          type="password"
                          className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="flex-1 h-14 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="button"
                      onClick={nextStep}
                      className="flex-[2] h-14 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      Next Step <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Details & Submit */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">
                      {role === 'COMPANY' ? 'Company Details' : 'Finalize Account'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                      {role === 'COMPANY' ? 'Tell us about your organization.' : 'Review and confirm your details.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {role === 'COMPANY' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                              {...register('companyName', { required: role === 'COMPANY' ? 'Company name is required' : false })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                              placeholder="Acme Inc."
                            />
                          </div>
                          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Region / Country</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            <select 
                              {...register('country', { required: role === 'COMPANY' ? 'Country is required' : false })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                               <option value="Pakistan">Pakistan</option>
                               <option value="UK">United Kingdom</option>
                               <option value="UAE">United Arab Emirates</option>
                               <option value="US">United States</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : ( 
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-3 text-green-500">
                          <CheckCircle2 className="w-6 h-6" />
                          <p className="font-bold">You're ready to start earning!</p>
                        </div>
                        <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
                          <li>Instant access to task board</li>
                          <li>Secure payment processing</li>
                          <li>Skill-based task matching</li>
                        </ul>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <input type="checkbox" required className="mt-1 size-4 rounded border-primary text-primary focus:ring-primary" />
                      <p className="text-xs text-slate-500 leading-normal">
                        I agree to the <Link to="#" className="text-primary font-bold">Terms of Service</Link> and <Link to="#" className="text-primary font-bold">Privacy Policy</Link>.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="flex-1 h-14 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className={`flex-[2] h-14 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Creating Account...' : 'Complete Registration'} {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </p>
            </form>
            
            {/* Footer Trust Symbols */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Orbs */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </div>
  );
};

export default RegisterPage;
