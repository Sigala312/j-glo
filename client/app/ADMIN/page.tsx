// app/dashboard/page.tsx
"use client";

import React from 'react';
import { TrendingUp, Users, Briefcase } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const monthlyData = [
  { name: 'Jan', income: 4000 },
  { name: 'Feb', income: 3000 },
  { name: 'Mar', income: 5000 },
  { name: 'Apr', income: 2780 },
  { name: 'May', income: 1890 },
  { name: 'Jun', income: 2390 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h2 className="text-xs font-mono text-blue-500 tracking-[0.3em] uppercase">System_Overview</h2>
        <h1 className="text-3xl font-bold tracking-tighter text-white">OPERATIONAL_DASHBOARD</h1>
      </header>

      {/* 頂部三個小區塊 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="MONTHLY_INCOME" value="$128,400" icon={TrendingUp} color="text-emerald-400" percent="+12%" />
        <StatCard title="LABOR_COSTS" value="$45,000" icon={Users} color="text-rose-400" percent="+3.4%" />
        <StatCard title="PROJECT_EXPENSES" value="$32,800" icon={Briefcase} color="text-amber-400" percent="-1.2%" />
      </div>

      {/* 下面兩個大區塊 (7:3) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* 左側 7: 收入折線圖 */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-6 rounded-sm backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold tracking-widest text-slate-400">INCOME_ANALYTICS_V2</h3>
            <span className="text-[9px] text-slate-600 font-mono italic">Live Data Feed</span>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右側 3: 作業內容時間軸 */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 p-6 rounded-sm">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-6 uppercase italic">Work_Log_Feed</h3>
          <div className="space-y-6">
            <TimelineItem time="14:30" action="Order_Verified" desc="Cathay Project Approved" />
            <TimelineItem time="12:00" action="Expense_Logged" desc="Material Purchase S02" />
            <TimelineItem time="10:15" action="System_Sync" desc="Manual DB backup" />
            <TimelineItem time="09:00" action="Admin_Login" desc="System Session Started" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 內部子元件 ---

function StatCard({ title, value, icon: Icon, color, percent }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm relative group overflow-hidden">
      <div className={`absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={80} />
      </div>
      <p className="text-[10px] tracking-[0.2em] text-slate-500 mb-2 uppercase">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-white">{value}</h3>
        <span className={`text-[10px] font-mono ${percent.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {percent}
        </span>
      </div>
    </div>
  );
}

function TimelineItem({ time, action, desc }: any) {
  return (
    <div className="relative pl-6 border-l border-slate-800 py-1">
      <div className="absolute left-[-4.5px] top-2.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      <p className="text-[10px] font-mono text-slate-600 mb-1">{time}</p>
      <p className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{action}</p>
      <p className="text-[10px] text-slate-500 truncate">{desc}</p>
    </div>
  );
}