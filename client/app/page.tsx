"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// --- 配置區 ---
const GOOGLE_CLIENT_ID = "303259997714-1fbt0jvi4ri2fnjhusaiur08d0upcnr0.apps.googleusercontent.com";
const BACKEND_URL = "http://localhost:5000/api/auth/google-login";

const TechHeroContent = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [view, setView] = useState<'home' | 'login' | 'register'>('home');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // 追蹤鼠標位置
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- Google 登入邏輯 ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // 呼叫你的 Express 後端
        const response = await axios.post(BACKEND_URL, {
          idToken: tokenResponse.access_token, // 注意：這裡根據後端 verify 邏輯可能需要調整為 credential
        });

        const { token, user } = response.data;

        // 儲存 JWT 到本地
        localStorage.setItem('token', token);
        
        // 根據角色導向不同頁面
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/Dashboard');
        }
      } catch (error) {
        console.error("Backend Auth Error:", error);
        alert("登入失敗，請檢查後端連線或 Google 配置");
      } finally {
        setLoading(false);
      }
    },
    onError: () => console.log('Google Login Failed'),
  });

  

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center font-mono text-slate-400">
      
      {/* 1. 背景裝飾層 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* 2. 互動光暈 */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
        }}
      />

      {/* 3. 裝飾性數據端點 */}
      <div className="absolute top-8 left-8 text-[10px] tracking-[0.2em] uppercase opacity-50 hidden md:block">
        <p>Status: {loading ? 'Processing...' : (view === 'home' ? 'System_Idle' : 'Authorization_Required')}</p>
        <p>Node_ID: 27.0.4.19</p>
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] tracking-[0.2em] uppercase opacity-50 text-right hidden md:block">
        <p>© 2026 J-GLOBAL ARCHIVE</p>
        <p>Coord: {mousePos.x}px / {mousePos.y}px</p>
      </div>

      {/* 4. 核心內容切換區 */}
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(15px)" }}
            transition={{ duration: 0.6 }}
            className="z-10 flex flex-col items-center"
          >
            <div className="mb-4 flex items-center gap-2 text-blue-500">
              <Cpu size={16} className="animate-pulse" />
              <span className="text-xs tracking-[0.4em] uppercase font-bold">Data Repository</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-16 relative">
              J-GLOBAL<span className="text-blue-600">.</span>
            </h1>

            <div className="flex flex-col md:flex-row gap-8">
              <motion.button
                onClick={() => setView('login')}
                whileHover={{ scale: 1.05, backgroundColor: "#f8fafc", color: "#0a0a0a" }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-3 border border-slate-700 text-slate-200 tracking-[0.2em] uppercase text-sm transition-colors duration-300 backdrop-blur-sm"
              >
                Access
              </motion.button>

              <motion.button
                onClick={() => setView('register')}
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(37, 99, 235, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-3 bg-blue-600 text-white tracking-[0.2em] uppercase text-sm font-bold transition-all duration-300"
              >
                Initialize
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -30, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "anticipate" }}
            className="z-10 w-full max-w-[380px] p-10 border border-slate-800 bg-black/60 backdrop-blur-2xl relative shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-10">
              {view === 'login' ? <ShieldCheck className="text-blue-500" /> : <UserPlus className="text-blue-500" />}
              <h2 className="text-xs tracking-[0.3em] uppercase text-slate-200 font-bold">
                {view === 'login' ? 'Authentication_Gate' : 'New_Protocol_Setup'}
              </h2>
            </div>

            {/* 輸入欄位 */}
            <div className="space-y-6">
              <div className="group">
                <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold group-focus-within:text-blue-400 transition-colors">Credential_ID</p>
                <input type="text" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 transition-colors text-white text-sm placeholder:text-slate-700" placeholder="USER_NAME_OR_MAIL" />
              </div>
              <div className="group">
                <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold group-focus-within:text-blue-400 transition-colors">Access_Key</p>
                <input type="password" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 transition-colors text-white text-sm placeholder:text-slate-700" placeholder="••••••••" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-700 py-4 mt-10 text-[10px] font-bold text-white uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20"
            >
              {view === 'login' ? 'Execute_Access' : 'Authorize_New_Entry'}
            </motion.button>

            {/* SSO 區塊 */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-900"></span></div>
              <div className="relative flex justify-center text-[9px] uppercase">
                <span className="bg-[#0c0c0c] px-3 text-slate-600 tracking-[0.4em]">External_Bridge</span>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button 
                onClick={() => loginWithGoogle()} // 👈 觸發 Google 登入
                disabled={loading}
                whileHover={{ borderColor: "#475569", backgroundColor: "rgba(255,255,255,0.03)" }}
                className="flex items-center justify-center gap-3 w-full py-3 border border-slate-800 text-[9px] uppercase tracking-[0.2em] transition-all text-slate-300 disabled:opacity-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3 h-3 grayscale opacity-70" alt="Google" />
                {loading ? 'Verifying...' : 'Continue via Google'}
              </motion.button>
            </div>

            {/* 導覽 */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-[9px] text-slate-600 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]">
                {view === 'login' ? "[ Request New Identity ]" : "[ Back to Access Portal ]"}
              </button>
              <button onClick={() => setView('home')} className="flex items-center justify-center gap-2 text-[9px] text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-[0.3em] mt-2">
                <ChevronLeft size={12} /> Exit to Main Terminal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 掃描線特效 */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-scan z-50 pointer-events-none" />

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        .animate-scan {
          animation: scan 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

// 最終導出的組件：包裹 Provider
export default function TechHeroPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TechHeroContent />
    </GoogleOAuthProvider>
  );
}