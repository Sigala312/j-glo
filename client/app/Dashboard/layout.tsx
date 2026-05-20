"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMsal } from "@azure/msal-react";
import { 
  LayoutDashboard, 
  Search, 
  PlusSquare, 
  LogOut, 
  Cpu, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  { name: '儀表板', path: '/Dashboard', icon: LayoutDashboard, code: 'DB_OVERVIEW' },
  { name: '瀏覽資料', path: '/Dashboard/Browse', icon: Search, code: 'DATA_BROWSE' },
  { name: '新增資料', path: '/Dashboard/Add', icon: PlusSquare, code: 'NEW_PROTOCOL' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🔥 手機版側邊欄開關

  const { instance } = useMsal();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  // 監聽路由變化，在手機版跳轉頁面後自動收起側邊欄
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    try {
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        await instance.logoutRedirect({
          postLogoutRedirectUri: "/",
        });
      } else {
        router.push('/');
      }
    } catch (e) {
      console.error("Logout Error:", e);
      router.push('/');
    }
  };

  if (!isAuth) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <div className="relative min-h-screen flex bg-[#0a0a0a] text-slate-300 font-mono selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 背景格線裝飾 */}
      <div className="absolute inset-0 pointer-events-none opacity-5 md:opacity-10"
        style={{
          backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* 📱 手機版側邊欄遮罩 (Overlay) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden block animate-fadeIn"
        />
      )}

      {/* --- 側邊欄 (Aside) --- */}
      {/* 透過 md:translate-x-0 與 transitions 實現 RWD 滑出效果 */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 border-r border-slate-800 bg-black/90 lg:bg-black/40 backdrop-blur-xl z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 側邊欄標頭 */}
        <div className="p-6 md:p-8 flex items-center justify-between text-blue-500">
          <div className="flex items-center gap-3">
            <Cpu size={20} className="animate-pulse" />
            <h1 className="text-sm font-bold tracking-[0.3em] text-white">J-GLOBAL</h1>
          </div>
          {/* 手機版關閉按鈕 */}
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* 導覽選單 */}
        <nav className="flex-1 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full group flex items-center justify-between px-4 py-3 rounded-sm transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-blue-600/10 border-l-2 border-blue-600 text-white' 
                    : 'hover:bg-slate-800/50 text-slate-500 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} className={isActive ? 'text-blue-500' : ''} />
                  <span className="text-xs tracking-widest">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-600 shrink-0" />}
                <span className="absolute right-2 opacity-0 group-hover:opacity-100 lg:block hidden text-[8px] text-blue-500/50 translate-x-2 transition-all">
                  {item.code}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 底部登出區 */}
        <div className="p-6 border-t border-slate-900/60">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-xs text-slate-600 hover:text-red-400 transition-colors tracking-tighter w-full"
          >
            <LogOut size={16} />
            <span>登出 PROTOCOL</span>
          </button>
        </div>
      </aside>

      {/* --- 右側主內容區 --- */}
      {/* lg:pl-64 確保案頭端不會被固定定位的側邊欄擋住 */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* 頂部狀態列 */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-4 sm:px-6 md:px-10 bg-black/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* 漢堡按鈕 */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu size={20} />
            </button>
            <div className="text-[9px] sm:text-[10px] text-slate-600 tracking-widest truncate">
              NODE_PATH: <span className="text-blue-500">{pathname.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] sm:text-[10px] shrink-0">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">SYSTEM_READY</span>
            </span>
          </div>
        </header>

        {/* 實際內部頁面 */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* 全域掃描線 */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/5 shadow-[0_0_15px_rgba(37,99,235,0.2)] animate-scan pointer-events-none z-50" />

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 15s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}