import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Lock, Mail, Loader2, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AuthMode = 'login' | 'signup' | 'forgot_password';

export default function HRLogin() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState(() => localStorage.getItem('hr_first_name') || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem('hr_last_name') || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPasswordForEmail, signInWithOAuth, user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/hr/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Persist name data
  React.useEffect(() => {
    localStorage.setItem('hr_first_name', firstName);
    localStorage.setItem('hr_last_name', lastName);
  }, [firstName, lastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email.toLowerCase().endsWith('@thelixholdings.com')) {
          setError('You are not authorized to create an account.');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(email, password, {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        });

        if (signUpError) {
          setError(signUpError.message || 'Failed to create account.');
        } else {
          setMessage('Account created successfully! Please check your email to verify.');
          setMode('login');
        }
      } else if (mode === 'login') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError('Invalid credentials. Please check your email and password.');
        } else {
          navigate('/hr/dashboard');
        }
      } else if (mode === 'forgot_password') {
        const { error: resetError } = await resetPasswordForEmail(email);
        if (resetError) {
          setError(resetError.message || 'Failed to send reset email.');
        } else {
          setMessage('Password reset email sent. Please check your inbox.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { error: googleError } = await signInWithOAuth('google');
    if (googleError) {
      setError('Failed to sign in with Google.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border-white/60">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === 'login' && 'HR Portal'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot_password' && 'Reset Password'}
            </h2>
            <p className="text-slate-500 font-mono text-sm">
              {mode === 'login' && 'Sign in to manage job applications'}
              {mode === 'signup' && 'Join the HR team workspace'}
              {mode === 'forgot_password' && 'Enter your email to receive a reset link'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-mono mb-6 border border-red-100">
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-mono mb-6 border border-emerald-100">
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                      placeholder="Jane"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                  placeholder="hr@thelixholdings.com"
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-mono">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => { setMode('forgot_password'); setError(''); setMessage(''); }}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'login' && 'Sign in'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot_password' && 'Reset Password'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {mode !== 'forgot_password' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#f8fafc] text-slate-500 font-mono">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-slate-600 font-mono">
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Sign up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p className="text-sm text-slate-600 font-mono">
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-600 font-mono">
                Remember your password?{' '}
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </button>
              </p>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
