"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronLeft, ShieldCheck, UserPlus, CheckCircle2 } from 'lucide-react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import api from './lib/api';
import { useRouter } from 'next/navigation';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { msalConfig, loginRequest } from "./lib/authConfig";

// --- 配置區 ---
const GOOGLE_CLIENT_ID = "303259997714-1fbt0jvi4ri2fnjhusaiur08d0upcnr0.apps.googleusercontent.com";
const msalInstance = new PublicClientApplication(msalConfig);
let msalInitialized = false;

const TechHeroContent = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [view, setView] = useState<'home' | 'login' | 'register'>('home');
  const [regStep, setRegStep] = useState(1); // 1:身分, 2:通訊協議, 3:內部密鑰, 4:審核中
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [formData, setFormData] = useState({ name: '', departmentId: '', email: '', password: '' });
  
  const router = useRouter();
  const { instance } = useMsal();
  const [isMsalReady, setIsMsalReady] = useState(false);

  // 初始化 MSAL
  useEffect(() => {
    const init = async () => {
      if (!msalInitialized) {
        try {
          await instance.initialize();
          msalInitialized = true;
          setIsMsalReady(true);
        } catch (e) { console.error("MSAL 失敗:", e); }
      } else { setIsMsalReady(true); }
    };
    init();
  }, [instance]);

  // 抓取部門
  useEffect(() => {
    if (view === 'register' && departments.length === 0) {
      api.get('/api/departments').then(res => setDepartments(res.data)).catch(() => {});
    }
  }, [view]);

  const handleAuthSuccess = (data: any) => {
    const { token, user } = data;
    localStorage.setItem('token', token);
    if (user.status === 'PENDING') { setRegStep(4); return; }
    router.push(user.role === 'ADMIN' ? '/ADMIN' : '/Dashboard');
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await api.post("/api/auth/google-login", {
          accessToken: tokenResponse.access_token,
          name: formData.name,
          departmentId: formData.departmentId
        });
        handleAuthSuccess(response.data);
      } catch (error) { alert("驗證失敗"); } finally { setLoading(false); }
    },
  });

  const loginWithMicrosoft = async () => {
    if (!isMsalReady) return;
    try {
      await instance.loginPopup(loginRequest).then(async (result) => {
        const response = await api.post("/api/auth/microsoft-login", {
          accessToken: result.accessToken,
          name: formData.name,
          departmentId: formData.departmentId
        });
        handleAuthSuccess(response.data);
      });
    } catch (e) { console.error(e); }
  };

  // 進度條組件
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between text-[8px] tracking-[0.2em] text-slate-600 mb-2 uppercase">
        <span className={regStep >= 1 ? "text-blue-500" : ""}>01_Identity</span>
        <span className={regStep >= 2 ? "text-blue-500" : ""}>02_Protocol</span>
        <span className={regStep >= 3 ? "text-blue-500" : ""}>03_Security</span>
      </div>
      <div className="h-[2px] w-full bg-slate-900 flex gap-1">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-full transition-all duration-500 ${regStep >= s ? "bg-blue-600 w-1/3 shadow-[0_0_8px_rgba(37,99,235,0.6)]" : "bg-slate-900 w-1/3"}`} 
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center font-mono text-slate-400">
      
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="z-10 flex flex-col items-center">
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-16 relative">
              J-GLOBAL<span className="text-blue-600">.</span>
            </h1>
            <div className="flex flex-col md:flex-row gap-8">
              <motion.button 
                onClick={() => setView('login')} 
                className="px-12 py-3 border border-slate-700 text-slate-200 tracking-[0.2em] uppercase text-sm hover:bg-slate-100 hover:text-black transition-all"
              >
                登入
              </motion.button>
              <motion.button 
                onClick={() => { setView('register'); setRegStep(1); }} 
                className="px-12 py-3 bg-blue-600 text-white tracking-[0.2em] uppercase text-sm font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all"
              >
                註冊
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="z-10 w-full max-w-[380px] p-10 border border-slate-800 bg-black/60 backdrop-blur-2xl shadow-2xl relative">
            
            {/* 標題與進度條 */}
            <div className="flex items-center gap-3 mb-6">
              {view === 'login' ? <ShieldCheck className="text-blue-500" /> : <UserPlus className="text-blue-500" />}
              <h2 className="text-xs tracking-[0.3em] uppercase text-slate-200 font-bold">
                {view === 'login' ? 'Authentication_Gate' : `New_Protocol_Setup`}
              </h2>
            </div>

            {view === 'register' && regStep < 4 && <ProgressBar />}

            {/* --- 內容區 --- */}

            {/* 1. 登入 */}
            {view === 'login' && (
              <div className="space-y-6">
                <div className="group">
                  <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Credential_ID</p>
                  <input type="text" placeholder="USER_NAME_OR_MAIL" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="group">
                  <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Access_Key</p>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <motion.button className="w-full bg-blue-700 py-4 mt-4 text-[10px] font-bold text-white uppercase tracking-[0.3em]">Execute_Access</motion.button>
                
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-900"></span></div>
                  <div className="relative flex justify-center text-[8px] uppercase"><span className="bg-[#0c0c0c] px-2 text-slate-600 tracking-[0.3em]">External_Bridge</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => loginWithGoogle()} className="flex items-center justify-center gap-2 py-3 border border-slate-800 text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all"><img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3 h-3" /> Google</button>
                  <button onClick={() => loginWithMicrosoft()} className="flex items-center justify-center gap-2 py-3 border border-slate-800 text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all"><img src="https://www.svgrepo.com/show/354068/microsoft-icon.svg" className="w-3 h-3" /> MSAL</button>
                </div>
              </div>
            )}

            {/* 2. 註冊 Step 1: 身分 */}
            {view === 'register' && regStep === 1 && (
              <div className="space-y-6">
                <div className="group">
                  <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Identity_Name</p>
                  <input type="text" placeholder="YOUR_FULL_NAME" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="group">
                  <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Sector_Assignment</p>
                  <select className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm appearance-none" onChange={(e) => setFormData({...formData, departmentId: e.target.value})}>
                    <option value="" className="bg-[#0a0a0a]">SELECT_SECTOR</option>
                    {departments.map(d => <option key={d.id} value={d.id} className="bg-[#0a0a0a]">{d.name}</option>)}
                  </select>
                </div>
                <motion.button disabled={!formData.name || !formData.departmentId} onClick={() => setRegStep(2)} className="w-full bg-blue-700 py-4 mt-6 text-[10px] font-bold text-white uppercase tracking-[0.3em] disabled:opacity-30">Confirm_Identity</motion.button>
              </div>
            )}

            {/* 3. 註冊 Step 2: 協議 */}
            {view === 'register' && regStep === 2 && (
              <div className="space-y-4">
                <p className="text-[9px] text-slate-500 mb-6 tracking-widest text-center uppercase">Linking External Auth Protocols...</p>
                <button onClick={() => loginWithGoogle()} className="w-full py-4 border border-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" /> Continue via Google
                </button>
                <button onClick={() => loginWithMicrosoft()} className="w-full py-4 border border-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
                  <img src="https://www.svgrepo.com/show/354068/microsoft-icon.svg" className="w-4 h-4" /> Continue via Microsoft
                </button>
                <button onClick={() => setRegStep(3)} className="w-full text-[9px] text-slate-600 hover:text-blue-400 py-4 tracking-widest uppercase">Or Internal Mail Setup</button>
              </div>
            )}

            {/* 4. 註冊 Step 3: 安全 */}
            {view === 'register' && regStep === 3 && (
              <div className="space-y-6">
                <div className="group">
                  <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Mail_Terminal</p>
                  <input type="email" placeholder="EMAIL_ADDR" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="group">
                  <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Security_Phrase</p>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <motion.button onClick={() => { /* 實作註冊 API */ }} className="w-full bg-blue-700 py-4 mt-4 text-[10px] font-bold text-white uppercase tracking-[0.3em]">Finalize_Registration</motion.button>
              </div>
            )}

            {/* 5. 註冊 Step 4: 審核 */}
{view === 'register' && regStep === 4 && (
  <div className="text-center py-10">
    {/* --- 動態勾勾容器 --- */}
    <div className="flex justify-center mb-6">
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* 背景圓圈動畫 */}
        <motion.circle
          cx="40"
          cy="40"
          r="35"
          stroke="#2563eb"
          strokeWidth="2"
          fill="transparent"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {/* 勾勾路徑動畫 */}
        <motion.path
          d="M25 40 L35 50 L55 30"
          fill="transparent"
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>

    <motion.h3 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
      className="text-white text-xs font-bold tracking-widest uppercase mb-4"
    >
      Identity_Logged
    </motion.h3>
    
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-tighter"
    >
      系統管理員正在審核您的權限。<br/>通過後即可進入資料庫。
    </motion.p>

 <motion.button 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.8 }}
  whileHover="hover" // 連結子元件的 hover 狀態
  onClick={() => setView('home')} 
  className="relative w-full border border-slate-800 py-4 mt-10 text-[10px] uppercase tracking-widest text-slate-400 overflow-hidden bg-black/40 transition-colors duration-300 hover:text-white hover:border-blue-500"
>
  {/* --- 這是流動的白光層 --- */}
  <motion.div
    variants={{
      hover: {
        x: ['-100%', '100%'], // 從左邊界外移動到右邊界外
      }
    }}
    transition={{
      duration: 0.6,
      ease: "linear",
      repeat: Infinity, // 如果你希望滑鼠放著就一直閃，可以加這行
      repeatDelay: 0.5
    }}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '50%', // 光束的寬度
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      skewX: '-20deg', // 讓光束斜斜的更有動感
    }}
  />

  {/* 按鈕文字（確保在光束上方） */}
  <span className="relative z-10">Return_to_Main</span>
</motion.button>
  </div>
)}

            {/* 導覽按鈕 */}
            {regStep < 4 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setRegStep(1); }} className="text-[9px] text-slate-600 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]">
                  {view === 'login' ? "[ Request New Identity ]" : "[ Back to Access Portal ]"}
                </button>
                <button onClick={() => { setView('home'); setRegStep(1); }} className="flex items-center justify-center gap-2 text-[9px] text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-[0.3em]">
                  <ChevronLeft size={12} /> Exit to Main Terminal
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 掃描線 */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-scan z-50 pointer-events-none" />
      <style jsx>{`
        @keyframes scan { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-100vh); opacity: 0; } }
        .animate-scan { animation: scan 12s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default function TechHeroPage() {
  return (
    <MsalProvider instance={msalInstance}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <TechHeroContent />
      </GoogleOAuthProvider>
    </MsalProvider>
  );
}