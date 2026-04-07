"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react';

// 模擬數據 (之後可接 API)
const mockActivity = [
  { id: 1, action: "INITIALIZE_PROJECT", target: "Cathay_Life_S01", time: "10:24", status: "SUCCESS" },
  { id: 2, action: "UPDATE_FINANCE", target: "Fubon_Archive_V2", time: "09:45", status: "PENDING" },
  { id: 3, action: "ACCESS_GRANTED", target: "User_Max", time: "08:12", status: "AUTH" },
];

const mockProjects = {
  filled: [
    { id: 'P-001', name: '國泰人壽雲端遷移', client: 'Cathay Life' },
    { id: 'P-002', name: '富邦金控安全審計', client: 'Fubon Financial' },
  ],
  pending: [
    { id: 'P-003', name: '台積電維護合約', client: 'TSMC', urgent: true },
    { id: 'P-004', name: '中鋼報價系統', client: 'CSC', urgent: false },
  ]
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 頂部數據概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="COMPLETED_NODES" count={mockProjects.filled.length} icon={CheckCircle2} color="text-green-500" />
        <StatusCard title="PENDING_PROTOCOLS" count={mockProjects.pending.length} icon={AlertCircle} color="text-orange-500" />
        <StatusCard title="SYSTEM_UPTIME" count="99.9%" icon={Activity} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：專案區塊 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 已填寫專案 */}
          <section>
            <SectionHeader title="已填寫資料專案" code="STABLE_PROJECTS" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {mockProjects.filled.map(proj => (
                <ProjectBox key={proj.id} project={proj} status="filled" />
              ))}
            </div>
          </section>

          {/* 未填寫專案 */}
          <section>
            <SectionHeader title="待處理專案" code="AWAITING_INPUT" />
            <div className="space-y-3 mt-4">
              {mockProjects.pending.map(proj => (
                <ProjectBox key={proj.id} project={proj} status="pending" />
              ))}
            </div>
          </section>
        </div>

        {/* 右側：訊息牆 */}
        <aside className="bg-black/40 border border-slate-800 rounded-sm p-6 backdrop-blur-md h-[calc(100vh-280px)] overflow-hidden flex flex-col">
          <SectionHeader title="系統動態" code="LIVE_FEED" />
          <div className="mt-6 space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {mockActivity.map((log) => (
              <div key={log.id} className="border-l-2 border-slate-800 pl-4 py-1 group hover:border-blue-500 transition-colors">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-blue-500 font-bold">{log.action}</span>
                  <span className="text-slate-600">{log.time}</span>
                </div>
                <p className="text-xs text-slate-300 truncate">{log.target}</p>
                <div className="mt-2 h-[1px] w-0 group-hover:w-full bg-blue-900/30 transition-all duration-500" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900 text-[9px] text-slate-700 animate-pulse">
            {">"} LISTENING_FOR_EVENTS...
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- 子元件區 ---

function StatusCard({ title, count, icon: Icon, color }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={48} />
      </div>
      <p className="text-[10px] tracking-[0.2em] text-slate-500 mb-2">{title}</p>
      <h3 className="text-3xl font-bold text-white">{count}</h3>
    </motion.div>
  );
}

function SectionHeader({ title, code }: { title: string; code: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
      <h2 className="text-xs font-bold tracking-widest text-slate-200">{title}</h2>
      <span className="text-[9px] text-slate-600 font-mono">[{code}]</span>
    </div>
  );
}

function ProjectBox({ project, status }: { project: any; status: 'filled' | 'pending' }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, backgroundColor: "rgba(30, 41, 59, 0.4)" }}
      className="p-4 border border-slate-800 bg-black/20 flex items-center justify-between group cursor-pointer"
    >
      <div>
        <p className="text-[9px] text-blue-500 mb-1">{project.id}</p>
        <h4 className="text-sm text-slate-200 group-hover:text-white transition-colors">{project.name}</h4>
        <p className="text-[10px] text-slate-500">{project.client}</p>
      </div>
      <ArrowUpRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
    </motion.div>
  );
}