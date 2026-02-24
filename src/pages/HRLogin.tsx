import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function HRLogin() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/hr/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Invalid credentials. Please check your email and password.');
    } else {
      navigate('/hr/dashboard');
    }
    setLoading(false);
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
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">HR Portal</h2>
            <p className="text-slate-500 font-mono text-sm">Sign in to manage job applications</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-mono mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                  placeholder="hr@thelixholdings.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
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
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
