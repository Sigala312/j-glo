"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus, ChevronLeft } from "lucide-react";

export default function AuthDesktop({
  view,
  setView,
  regStep,
  setRegStep,
  formData,
  setFormData,
  departments,
  loading,
  handleLogin,
  handleFinalRegistration,
  loginWithGoogle,
  loginWithMicrosoft,
  ProgressBar
}: any) {
  return (
    <div className="z-10 w-full max-w-[380px] p-10 border border-slate-800 bg-black/60 backdrop-blur-2xl shadow-2xl relative">
      <div className="flex items-center gap-3 mb-6">
        {view === "login" ? <ShieldCheck className="text-blue-500" /> : <UserPlus className="text-blue-500" />}
        <h2 className="text-xs tracking-[0.3em] uppercase text-slate-200 font-bold">
          {view === "login" ? "Authentication_Gate" : "New_Protocol_Setup"}
        </h2>
      </div>

      {view === "register" && regStep < 4 && <ProgressBar />}

      {/* 登入狀態 */}
      {view === "login" && (
        <div className="space-y-6">
          <div className="group">
            <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Credential_ID</p>
            <input
              type="text"
              placeholder="USER_NAME_OR_MAIL"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="group">
            <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Access_Key</p>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            disabled={loading}
            onClick={handleLogin}
            className={`w-full py-4 mt-4 text-[10px] font-bold text-white uppercase tracking-[0.3em] transition-all ${
              loading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-600 active:scale-95"
            }`}
          >
            {loading ? "Authorizing..." : "Execute_Access"}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-900"></span></div>
            <div className="relative flex justify-center text-[8px] uppercase">
              <span className="bg-[#0c0c0c] px-2 text-slate-600 tracking-[0.3em]">External_Bridge</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => loginWithGoogle()} className="flex items-center justify-center gap-2 py-3 border border-slate-800 text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3 h-3" /> Google
            </button>
            <button onClick={() => loginWithMicrosoft()} className="flex items-center justify-center gap-2 py-3 border border-slate-800 text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all">
              <img src="https://www.svgrepo.com/show/354068/microsoft-icon.svg" className="w-3 h-3" /> MSAL
            </button>
          </div>
        </div>
      )}

      {/* 註冊 Step 1 */}
      {view === "register" && regStep === 1 && (
        <div className="space-y-6">
          <div className="group">
            <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Identity_Name</p>
            <input
              type="text"
              placeholder="YOUR_FULL_NAME"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="group">
            <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Sector_Assignment</p>
            <select
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm appearance-none"
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="" className="bg-[#0a0a0a]">SELECT_SECTOR</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id} className="bg-[#0a0a0a]">{d.name}</option>
              ))}
            </select>
          </div>
          <button
            disabled={!formData.name || !formData.departmentId}
            onClick={() => setRegStep(2)}
            className="w-full bg-blue-700 py-4 mt-6 text-[10px] font-bold text-white uppercase tracking-[0.3em] disabled:opacity-30"
          >
            Confirm_Identity
          </button>
        </div>
      )}

      {/* 註冊 Step 2 */}
      {view === "register" && regStep === 2 && (
        <div className="space-y-4">
          <p className="text-[9px] text-slate-500 mb-6 tracking-widest text-center uppercase">Linking External Auth Protocols...</p>
          <button onClick={() => loginWithGoogle()} className="w-full py-4 border border-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" /> Continue via Google
          </button>
          <button onClick={() => loginWithMicrosoft()} className="w-full py-4 border border-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
            <img src="https://www.svgrepo.com/show/354068/microsoft-icon.svg" className="w-4 h-4" /> Continue via Microsoft
          </button>
          <button onClick={() => setRegStep(3)} className="w-full text-[9px] text-slate-600 hover:text-blue-400 py-4 tracking-widest uppercase">
            Or Internal Mail Setup
          </button>
        </div>
      )}

      {/* 註冊 Step 3 */}
      {view === "register" && regStep === 3 && (
        <div className="space-y-6">
          <div className="group">
            <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Mail_Terminal</p>
            <input
              type="email"
              placeholder="EMAIL_ADDR"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="group">
            <p className="text-[9px] text-blue-500/70 mb-1 tracking-widest uppercase font-bold">Security_Phrase</p>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button onClick={handleFinalRegistration} className="w-full bg-blue-700 py-4 mt-4 text-[10px] font-bold text-white uppercase tracking-[0.3em]">
            Finalize_Registration
          </button>
        </div>
      )}

      {/* 註冊 Step 4 */}
      {view === "register" && regStep === 4 && (
        <div className="text-center py-10">
          <div className="flex justify-center mb-6">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" stroke="#2563eb" strokeWidth="2" fill="transparent" />
              <path d="M25 40 L35 50 L55 30" fill="transparent" stroke="#2563eb" strokeWidth="4" />
            </svg>
          </div>
          <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Identity_Logged</h3>
          <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-tighter">
            系統管理員正在審核您的權限。<br />通過後即可進入資料庫。
          </p>
          <button onClick={() => setView("home")} className="w-full border border-slate-800 py-4 mt-10 text-[10px] uppercase tracking-widest text-slate-400 bg-black/40 hover:text-white hover:border-blue-500 transition-colors">
            Return_to_Main
          </button>
        </div>
      )}

      {/* 底部導覽 */}
      {regStep < 4 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={() => { setView(view === "login" ? "register" : "login"); setRegStep(1); }} className="text-[9px] text-slate-600 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]">
            {view === "login" ? "[ Request New Identity ]" : "[ Back to Access Portal ]"}
          </button>
          <button onClick={() => { setView("home"); setRegStep(1); }} className="flex items-center justify-center gap-2 text-[9px] text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-[0.3em]">
            <ChevronLeft size={12} /> Exit to Main Terminal
          </button>
        </div>
      )}
    </div>
  );
}