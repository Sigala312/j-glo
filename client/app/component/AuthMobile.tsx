"use client";

import React from "react";
import { ChevronLeft, ShieldCheck, UserPlus } from "lucide-react";

export default function AuthMobile({
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
    // 手機版特製：寬度吃滿 (w-full)，內縮改為 p-5 釋放空間，移除不必要的 backdrop-blur 以提升流暢度
    <div className="z-10 w-full p-5 border border-slate-800 bg-black/80 shadow-2xl relative">
      <div className="flex items-center gap-2 mb-5">
        {view === "login" ? <ShieldCheck className="text-blue-500" size={16} /> : <UserPlus className="text-blue-500" size={16} />}
        <h2 className="text-[10px] tracking-[0.15em] uppercase text-slate-200 font-bold truncate">
          {view === "login" ? "Authentication_Gate" : "New_Protocol_Setup"}
        </h2>
      </div>

      {view === "register" && regStep < 4 && <ProgressBar />}

      {/* 登入 */}
      {view === "login" && (
        <div className="space-y-5">
          <div>
            <p className="text-[8px] text-blue-500/70 mb-1 tracking-wider uppercase font-bold">Credential_ID</p>
            <input
              type="text"
              placeholder="USER_NAME_OR_MAIL"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm rounded-none"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <p className="text-[8px] text-blue-500/70 mb-1 tracking-wider uppercase font-bold">Access_Key</p>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm rounded-none"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            disabled={loading}
            onClick={handleLogin}
            className="w-full py-3.5 mt-2 bg-blue-700 text-[10px] font-bold text-white uppercase tracking-[0.2em]"
          >
            {loading ? "Authorizing..." : "Execute_Access"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-900"></span></div>
            <div className="relative flex justify-center text-[8px] uppercase">
              <span className="bg-[#0a0a0a] px-2 text-slate-600 tracking-wider">External_Bridge</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => loginWithGoogle()} className="flex items-center justify-center gap-1 py-2.5 border border-slate-800 text-[9px] uppercase tracking-wider">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3 h-3" /> Google
            </button>
            <button onClick={() => loginWithMicrosoft()} className="flex items-center justify-center gap-1 py-2.5 border border-slate-800 text-[9px] uppercase tracking-wider">
              <img src="https://www.svgrepo.com/show/354068/microsoft-icon.svg" className="w-3 h-3" /> MSAL
            </button>
          </div>
        </div>
      )}

      {/* 註冊 Step 1 */}
      {view === "register" && regStep === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-[8px] text-blue-500/70 mb-1 tracking-wider uppercase font-bold">Identity_Name</p>
            <input
              type="text"
              placeholder="YOUR_FULL_NAME"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm rounded-none"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <p className="text-[8px] text-blue-500/70 mb-1 tracking-wider uppercase font-bold">Sector_Assignment</p>
            <select
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm appearance-none rounded-none"
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
            className="w-full bg-blue-700 py-3.5 mt-4 text-[10px] font-bold text-white uppercase tracking-[0.2em] disabled:opacity-30"
          >
            Confirm_Identity
          </button>
        </div>
      )}

      {/* 其他步驟（2, 3, 4）在手機上與桌機一致，僅微調間距 */}
      {view === "register" && regStep === 2 && (
        <div className="space-y-3">
          <p className="text-[9px] text-slate-500 mb-4 text-center uppercase">Linking Protocols...</p>
          <button onClick={() => loginWithGoogle()} className="w-full py-3.5 border border-slate-800 text-[10px] uppercase flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" /> Google
          </button>
          <button onClick={() => loginWithMicrosoft()} className="w-full py-3.5 border border-slate-800 text-[10px] uppercase flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/354068/microsoft-icon.svg" className="w-4 h-4" /> Microsoft
          </button>
          <button onClick={() => setRegStep(3)} className="w-full text-[9px] text-slate-600 py-2 text-center uppercase">
            Or Internal Mail Setup
          </button>
        </div>
      )}

      {view === "register" && regStep === 3 && (
        <div className="space-y-5">
          <div>
            <p className="text-[8px] text-blue-500/70 mb-1 tracking-wider uppercase font-bold">Mail_Terminal</p>
            <input
              type="email"
              placeholder="EMAIL_ADDR"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm rounded-none"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <p className="text-[8px] text-blue-500/70 mb-1 tracking-wider uppercase font-bold">Security_Phrase</p>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-slate-800 py-2 outline-none focus:border-blue-500 text-white text-sm rounded-none"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button onClick={handleFinalRegistration} className="w-full bg-blue-700 py-3.5 mt-4 text-[10px] font-bold text-white uppercase tracking-[0.2em]">
            Finalize
          </button>
        </div>
      )}

      {view === "register" && regStep === 4 && (
        <div className="text-center py-6">
          <h3 className="text-white text-xs font-bold uppercase mb-2">Identity_Logged</h3>
          <p className="text-[9px] text-slate-500 leading-relaxed px-2">管理員審核中，通過後開放存取。</p>
          <button onClick={() => setView("home")} className="w-full border border-slate-800 py-3 mt-6 text-[10px] text-slate-400 bg-black/40">
            Return_to_Main
          </button>
        </div>
      )}

      {/* 底部導覽 */}
      {regStep < 4 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={() => { setView(view === "login" ? "register" : "login"); setRegStep(1); }} className="text-[9px] text-slate-600 uppercase tracking-wider">
            {view === "login" ? "[ Request New Identity ]" : "[ Back to Access Portal ]"}
          </button>
          <button onClick={() => { setView("home"); setRegStep(1); }} className="flex items-center justify-center gap-1 text-[9px] text-slate-500 uppercase tracking-wider">
            <ChevronLeft size={10} /> Exit Terminal
          </button>
        </div>
      )}
    </div>
  );
}