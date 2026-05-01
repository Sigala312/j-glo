"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMsal } from "@azure/msal-react";
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  PlusSquare, 
  LogOut, 
  Cpu, 
  ChevronRight 
} from 'lucide-react';

// 側邊欄清單配置
const menuItems = [
  { name: '儀表板', path: '/Dashboard', icon: LayoutDashboard, code: 'DB_OVERVIEW' },
  { name: '瀏覽資料', path: '/Dashboard/Browse', icon: Search, code: 'DATA_BROWSE' },
  { name: '新增資料', path: '/Dashboard/Add', icon: PlusSquare, code: 'NEW_PROTOCOL' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  const { instance } = useMsal();

  // 1. 權限檢查 (守門員)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); // 沒 Token 直接踢回首頁
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleLogout = async () => {
    // 1. 清除本地認證
    localStorage.removeItem('token');

    // 2. 判斷是否有微軟帳戶登入，並執行微軟登出
    // 這會導向微軟的登出頁面，確保 Session 被清除，解決「閃現自動登入」問題
    try {
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        await instance.logoutRedirect({
          postLogoutRedirectUri: "/", // 登出後跳回首頁
        });
      } else {
        router.push('/');
      }
    } catch (e) {
      console.error("Logout Error:", e);
      router.push('/');
    }
  };

  if (!isAuth) return <div className="min-h-screen bg-[#0a0a0a]" />; // 檢查中回傳空白背景

  return (
    <div className="relative min-h-screen flex bg-[#0a0a0a] text-slate-300 font-mono selection:bg-blue-500/30">
      
      {/* 背景裝飾 (延續首頁) */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* --- 左側側邊欄 --- */}
      <aside className="w-64 border-r border-slate-800 bg-black/40 backdrop-blur-xl z-20 flex flex-col">
        <div className="p-8 flex items-center gap-3 text-blue-500">
          <Cpu size={20} className="animate-pulse" />
          <h1 className="text-sm font-bold tracking-[0.3em] text-white">J-GLOBAL</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full group flex items-center justify-between px-4 py-3 rounded-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600/10 border-l-2 border-blue-600 text-white' 
                    : 'hover:bg-slate-800/50 text-slate-500 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-blue-500' : ''} />
                  <span className="text-xs tracking-widest">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-600" />}
                <span className="absolute right-2 opacity-0 group-hover:opacity-100 text-[8px] text-blue-500/50 translate-x-2 transition-all">
                  {item.code}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 底部登出區 */}
        <div className="p-6 border-t border-slate-900">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-xs text-slate-600 hover:text-red-400 transition-colors tracking-tighter"
          >
            <LogOut size={16} />
            <span>登出</span>
          </button>
        </div>
      </aside>

      {/* --- 右側內容區 --- */}
      <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar">
        {/* 頂部狀態列 */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-10 bg-black/20">
          <div className="text-[10px] text-slate-600 tracking-widest">
            NODE_PATH: <span className="text-blue-500">{pathname.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM_READY
            </span>
          </div>
        </header>

        {/* 實際內容 */}
        <div className="p-10">
          {children}
        </div>
      </main>

      {/* 全域掃描線 (稍微調淡，避免干擾工作) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/5 shadow-[0_0_15px_rgba(37,99,235,0.2)] animate-scan pointer-events-none" />

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 15s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}