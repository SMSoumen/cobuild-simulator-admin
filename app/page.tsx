"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set a simple token
    document.cookie = 'token=dummy-token; path=/';
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#EF6B23]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#EF6B23]/10 to-transparent rounded-full blur-3xl"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232323]/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#EF6B23]/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {/* Logo - Improved */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#EF6B23]/40 to-orange-500/40 rounded-3xl blur-xl scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                
                {/* Logo container */}
                <div className="relative w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Logo image */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/co-build-logo-01-1.png"
                      alt="Cobuild Logo"
                      width={64}
                      height={64}
                      className="relative z-10 object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
                  Welcome Back
                </h1>
                <Sparkles className="w-6 h-6 text-[#EF6B23] animate-pulse" />
              </div>
              <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[#EF6B23] transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/30 focus:bg-[#1a1a1a] transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[#EF6B23] transition-colors duration-200" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/30 focus:bg-[#1a1a1a] transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] text-[#EF6B23] focus:ring-[#EF6B23] focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-[#EF6B23] hover:text-orange-400 transition-colors font-medium hover:underline">
                  Forgot password?
                </a>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#EF6B23] to-orange-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-[#EF6B23]/50 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-[#EF6B23] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-base">Sign In</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 relative z-10" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-gradient-to-br from-[#2a2a2a] to-[#232323] text-gray-500">
                  New to Cobuild?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-[#EF6B23] transition-colors group"
              >
                Create an account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 Cobuild. All rights reserved.
        </p>
      </div>
    </div>
  );
}
