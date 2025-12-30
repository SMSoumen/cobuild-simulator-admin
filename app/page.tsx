"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await auth.login(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#EF6B23]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232323]/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 relative overflow-hidden">
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EF6B23]/40 to-orange-500/40 rounded-3xl blur-xl scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image src="/co-build-logo-01-1.png" alt="Cobuild" width={64} height={64} className="relative z-10 object-contain drop-shadow-2xl" priority />
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">Admin Login</h1>
                <Sparkles className="w-6 h-6 text-[#EF6B23] animate-pulse" />
              </div>
              <p className="text-gray-400 text-sm">Sign in to access the admin dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[#EF6B23] transition-colors" />
                  </div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/30 transition-all disabled:opacity-50"
                    placeholder="admin@cobuild.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[#EF6B23] transition-colors" />
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/30 transition-all disabled:opacity-50"
                    placeholder="••••••••" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading}
                    className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] text-[#EF6B23] focus:ring-[#EF6B23] cursor-pointer" />
                  <span className="text-gray-400 group-hover:text-gray-300">Remember me</span>
                </label>
              </div>
              
              <button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#EF6B23] to-orange-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-[#EF6B23]/50 transition-all flex items-center justify-center gap-2 group relative overflow-hidden mt-6 disabled:opacity-50">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-[#EF6B23] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                    <span className="relative z-10">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">© 2025 Cobuild. All rights reserved.</p>
      </div>
    </div>
  );
}
