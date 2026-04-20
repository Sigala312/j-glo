// app/dashboard/layout.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  HardHat, 
  ChevronRight ,
  LogOut
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: LayoutDashboard, label: "儀表板", href: "/ADMIN" },
    { icon: Receipt, label: "訂單", href: "/ADMIN/Order" },
    { icon: HardHat, label: "工程", href: "/Dashboard/Projects" },
  ];

  const handleLogout = () => {
    // 1. 清除憑證
    localStorage.removeItem('token');
    
    // 2. 強制跳轉回首頁 (或登入頁)
    // 使用 window.location.href 可以確保 React State 徹底重置，更安全
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* 側邊欄 Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-sm rotate-45 flex items-center justify-center">
            <span className="rotate-[-45deg] font-black text-white italic">M</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter italic text-white">ADMIN_SYS</h1>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all group ${
                  isActive 
                    ? 'bg-blue-600/10 border-l-2 border-blue-500 text-white' 
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-600'} />
                  <span className="text-sm font-medium tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group rounded-sm"
          >
            <LogOut size={18} className="text-slate-600 group-hover:text-red-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tighter">登出</span>
          </button>
        </div>
      </aside>

      {/* 右側主內容容器 */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        {children}
      </main>
    </div>
  );
}