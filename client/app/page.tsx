"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu } from "lucide-react";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import api from "./lib/api";
import { useRouter } from "next/navigation";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { msalConfig } from "./lib/authConfig";

// 💡 匯入通用響應式模板與拆開的視圖
import ResponsiveContainer from "./component/ResponsiveContainer";
import AuthDesktop from "./component/AuthDesktop";
import AuthMobile from "./component/AuthMobile";

const GOOGLE_CLIENT_ID = "303259997714-1fbt0jvi4ri2fnjhusaiur08d0upcnr0.apps.googleusercontent.com";
const msalInstance = new PublicClientApplication(msalConfig);

const TechHeroContent = () => {
  const [view, setView] = useState<"home" | "login" | "register">("home");
  const [regStep, setRegStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({ name: "", departmentId: "", email: "", password: "" });

  const router = useRouter();
  const { instance } = useMsal();

  // 微軟登入跳轉處理邏輯 (不變)
  useEffect(() => {
    const initAndHandleRedirect = async () => {
      try {
        await instance.initialize();
        const result = await instance.handleRedirectPromise();
        if (result) {
          setLoading(true);
          const savedData = localStorage.getItem("msal_reg_data");
          const parsedData = savedData ? JSON.parse(savedData) : null;
          localStorage.removeItem("msal_reg_data");
          const response = await api.post("/api/auth/microsoft-login", {
            accessToken: result.accessToken,
            name: parsedData?.name || formData.name || undefined,
            departmentId: parsedData?.departmentId || formData.departmentId || undefined,
          });
          handleAuthSuccess(response.data);
        }
      } catch (error: any) {
        console.error("❌ MSAL 流程出錯:", error);
        alert("微軟登入失敗，請重新嘗試");
      } finally {
        setLoading(false); 
      }
    };
    initAndHandleRedirect();
  }, [instance]); 

  // 抓取部門資料
  useEffect(() => {
    if (view === "register" && departments.length === 0) {
      api.get("/api/departments").then((res) => setDepartments(res.data)).catch(() => {});
    }
  }, [view]);

  const handleAuthSuccess = (data: any) => {
    const { token, user } = data;
    localStorage.setItem("token", token);
    if (user.status === "PENDING") {
      alert("身分驗證成功！但您的帳號目前處於『待審核』狀態，請等待管理員開通權限。");
      setRegStep(4);
      return;
    }
    router.push(user.role === "ADMIN" ? "/ADMIN" : "/Dashboard");
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (view === "register" && (!formData.name || !formData.departmentId)) {
        alert("請先完成第一步：填寫姓名與部門");
        setRegStep(1);
        return;
      }
      setLoading(true);
      try {
        const response = await api.post("/api/auth/google-login", {
          accessToken: tokenResponse.access_token,
          name: view === "register" ? formData.name : undefined,
          departmentId: view === "register" ? formData.departmentId : undefined,
        });
        handleAuthSuccess(response.data);
      } catch (error: any) {
        alert(error.response?.data?.message || "驗證失敗");
      } 
finally { setLoading(false); }
    },
  });

  const handleFinalRegistration = async () => {
    if (!formData.email || !formData.password) { alert("請填寫完整的信箱與密碼"); return; }
    setLoading(true);
    try {
      const response = await api.post("/api/auth/register", {
        name: formData.name, email: formData.email, password: formData.password, departmentId: formData.departmentId,
      });
      handleAuthSuccess(response.data);
    } catch (error: any) {
      alert(error.response?.data?.message || "註冊程序失敗");
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) { alert("請輸入帳號與密碼"); return; }
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", { email: formData.email, password: formData.password });
      handleAuthSuccess(response.data);
    } catch (error: any) {
      alert(error.response?.data?.message || "登入失敗，請檢查憑證");
    } finally { setLoading(false); }
  };

  const loginWithMicrosoft = async () => {
    try {
      const keysToRemove = ["msal.", "login.", "msid"];
      Object.keys(localStorage).forEach((key) => { if (keysToRemove.some(prefix => key.includes(prefix))) localStorage.removeItem(key); });
      Object.keys(sessionStorage).forEach((key) => { if (keysToRemove.some(prefix => key.includes(prefix))) sessionStorage.removeItem(key); });
    } catch (e) {}

    if (view === "register") {
      localStorage.setItem("msal_reg_data", JSON.stringify({ name: formData.name, departmentId: formData.departmentId, view: "register" }));
    }

    try {
      await instance.loginRedirect({ scopes: ["User.Read", "openid", "profile"], prompt: "select_account" });
    } catch (error: any) {
      if (error.name === "InteractionInProgressError" || error.errorMessage?.includes("interaction_in_progress")) {
        alert("偵測到登入連線衝突，系統已自動重設！請重新點擊。");
        localStorage.clear(); sessionStorage.clear(); window.location.reload();
      } else {
        alert(`跳轉失敗：${error.message}`);
      }
    }
  };

  // 進度條小組件
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between text-[8px] tracking-[0.2em] text-slate-600 mb-2 uppercase">
        <span className={regStep >= 1 ? "text-blue-500" : ""}>01_Id</span>
        <span className={regStep >= 2 ? "text-blue-500" : ""}>02_Proto</span>
        <span className={regStep >= 3 ? "text-blue-500" : ""}>03_Sec</span>
      </div>
      <div className="h-[2px] w-full bg-slate-900 flex gap-1">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-full transition-all duration-500 ${regStep >= s ? "bg-blue-600 w-1/3 shadow-[0_0_8px_rgba(37,99,235,0.6)]" : "bg-slate-900 w-1/3"}`} />
        ))}
      </div>
    </div>
  );

  // 打包要傳遞給子組件的 Props 包裹
  const commonProps = {
    view, setView, regStep, setRegStep, formData, setFormData, departments, loading,
    handleLogin, handleFinalRegistration, loginWithGoogle, loginWithMicrosoft, ProgressBar
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center font-mono text-slate-400 p-4">
      {/* 背景裝飾網格與掃描線 */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-scan z-50 pointer-events-none" />

      <AnimatePresence mode="wait">
        {view === "home" ? (
          <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="z-10 flex flex-col items-center w-full max-w-md">
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-16">
              J-GLOBAL<span className="text-blue-600">.</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-6 w-full px-4">
              <button onClick={() => setView("login")} className="flex-1 py-4 border border-slate-700 text-slate-200 tracking-[0.2em] uppercase text-sm hover:bg-slate-100 hover:text-black transition-all">登入</button>
              <button onClick={() => { setView("register"); setRegStep(1); }} className="flex-1 py-4 bg-blue-600 text-white tracking-[0.2em] uppercase text-sm font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all">註冊</button>
            </div>
          </motion.div>
        ) : (
          /* 💡 在這裡套用你的通用 ResponsiveContainer 模板 */
          <ResponsiveContainer
            title=""
            desktopView={<AuthDesktop {...commonProps} />}
            mobileView={<AuthMobile {...commonProps} />}
          />
        )}

        {/* 全域 Loading 遮罩 */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 border-2 border-blue-500/20 border-t-blue-500 rounded-full" />
              <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={32} />
            </div>
            <p className="mt-6 text-[10px] tracking-[0.5em] text-blue-500 font-bold uppercase animate-pulse">Syncing_with_Mainframe...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
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