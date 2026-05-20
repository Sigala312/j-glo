"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  HardHat, 
  Users,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // 控制手機版側邊欄開關

  const navItems = [
    { icon: LayoutDashboard, label: "儀表板", href: "/ADMIN" },
    { icon: Receipt, label: "訂單管理", href: "/ADMIN/Order" },
    { icon: HardHat, label: "工程管理", href: "/ADMIN/Projects" },
    { icon: Users, label: "人事管理", href: "/ADMIN/HR" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-mono relative">
      
      {/* 📱 手機版頂部列 (Topbar) - 漢堡與 LOGO 位置已對調 */}
      <header className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#020617] border-b border-slate-800 flex items-center justify-between px-6 z-40">
        {/* 左側：漢堡按鈕 */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-slate-400 hover:text-white transition-colors p-1 -ml-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* 右側：LOGO 與標題 */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-sm rotate-45 flex items-center justify-center">
            <span className="rotate-[-45deg] font-black text-white italic text-xs">M</span>
          </div>
          <h1 className="text-lg font-black tracking-tighter italic text-white">ADMIN_SYS</h1>
        </div>
      </header>

      {/* 📱 手機版側邊欄背景遮罩 (Overlay) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* 💻📱 核心 RWD 側邊欄 */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-64 border-r border-slate-800 bg-[#020617] flex flex-col p-6 shrink-0 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* 電腦版側邊欄標題 (手機版隱藏) */}
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <span className="rotate-[-45deg] font-black text-white italic text-base">M</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter italic text-white">ADMIN_SYS</h1>
        </div>

        {/* 手機版展開時的頂部關閉按鈕 */}
        <div className="md:hidden flex justify-start mb-6">
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* 導覽連結 */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // 點擊後自動關閉手機版選單
                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all group ${
                  isActive 
                    ? 'bg-blue-600/10 border-l-2 border-blue-500 text-white shadow-[inset_4px_0_12px_rgba(37,99,235,0.05)]' 
                    : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400 transition-colors'} />
                  <span className="text-sm font-medium tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-400 animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* 登出區域 */}
        <div className="mt-auto pt-6 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group rounded-sm"
          >
            <LogOut size={18} className="text-slate-600 group-hover:text-red-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tight">SYSTEM_LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* 右側主內容容器 */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative bg-[#030712] pt-20 md:pt-8 custom-scrollbar">
        {/* 背景格線裝飾 */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}