"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Loader2, 
  FileQuestion
} from 'lucide-react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  projectNo: string;
  name: string;
  status: 'UNFILLED' | 'FILLED' | 'COMPLETED';
  client: { name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<{
    completed: Project[],
    filled: Project[],
    unfilled: Project[]
  }>({ completed: [], filled: [], unfilled: [] });
  
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // 注意：精簡架構，已在 axios 攔截器處理 Token 的話，這裡 headers 可拿掉
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [resCompleted, resFilled, resUnfilled] = await Promise.all([
        api.get('/api/projects/all?status=COMPLETED', config),
        api.get('/api/projects/all?status=FILLED', config),
        api.get('/api/projects/all?status=UNFILLED', config),
      ]);
      
      setProjects({
        completed: resCompleted.data || [],
        filled: resFilled.data || [],
        unfilled: resUnfilled.data || []
      });
    } catch (err) {
      console.error("Dashboard 資料抓取失敗", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-xs text-slate-500 font-mono gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        LOADING_DATA_STREAM...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1-3: 頂部數據概覽 - RWD 在小螢幕下為單欄，自 sm 以上為三欄 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatusCard title="完成專案" count={projects.completed.length} icon={CheckCircle2} color="text-green-500" />
        <StatusCard title="待處理明細" count={projects.filled.length} icon={AlertCircle} color="text-orange-500" />
        <StatusCard title="未填寫專案" count={projects.unfilled.length} icon={FileQuestion} color="text-blue-500" />
      </div>

      {/* 雙欄主區塊：RWD 電腦版並排，小螢幕垂直落底 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* 5: 未填寫資料專案 */}
          <section>
            <SectionHeader title="未填寫資料專案" code="UNFILLED_DATA" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {projects.unfilled.length > 0 ? (
                projects.unfilled.map(proj => (
                  <ProjectBox key={proj.id} project={proj} onClick={() => router.push(`/Dashboard/Browse/${proj.id}`)} />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 py-10 border border-dashed border-slate-800/60 text-center text-slate-600 text-xs rounded-sm italic">
                  NO_UNFILLED_DATA_FOUND
                </div>
              )}
            </div>
          </section>

          {/* 4: 待處理專案 */}
          <section>
            <SectionHeader title="待處理專案" code="FILLED_AWAITING_REVIEW" />
            <div className="space-y-3 mt-4">
              {projects.filled.length > 0 ? (
                projects.filled.map(proj => (
                  <ProjectBox key={proj.id} project={proj} onClick={() => router.push(`/Dashboard/Browse/${proj.id}`)} />
                ))
              ) : (
                <div className="py-10 border border-dashed border-slate-800/60 text-center text-slate-600 text-xs rounded-sm italic">
                  NO_PENDING_PROTOCOLS
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 右側：系統動態牆 (優化手機端高度，使其不會無限延伸) */}
        <aside className="bg-black/40 border border-slate-800 rounded-sm p-4 sm:p-6 backdrop-blur-md h-fit lg:h-[calc(100vh-240px)] flex flex-col">
          <SectionHeader title="系統動態" code="LIVE_FEED" />
          <div className="mt-4 space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 text-[10px] text-slate-500 font-mono min-h-[100px] max-h-[200px] lg:max-h-none">
            <p className="text-blue-500/70">{">"} CONNECTION_ESTABLISHED_SUCCESSFULLY</p>
            <p>{">"} DATA_SYNCHRONIZED_FROM_REMOTE_NODE...</p>
            <p>{">"} STATUS_CODE_200: OK</p>
            <p className="text-slate-600 italic">{">"} WAITING_FOR_NEW_INPUTS...</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- 🔧 子元件區 (精簡、無重複、具備 RWD 安全邊距) ---

function StatusCard({ title, count, icon: Icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -3 }} 
      className="bg-slate-900/40 border border-slate-800 p-5 sm:p-6 rounded-sm relative overflow-hidden group backdrop-blur-md"
    >
      <div className={`absolute top-1/2 -translate-y-1/2 right-4 p-2 opacity-5 group-hover:opacity-15 transition-opacity duration-300 ${color}`}>
        <Icon size={40} />
      </div>
      <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-slate-500 uppercase mb-1">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono">{count}</h3>
    </motion.div>
  );
}

function SectionHeader({ title, code }: { title: string; code: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2">
      <h2 className="text-xs font-bold tracking-widest text-slate-200">{title}</h2>
      <span className="text-[9px] text-slate-600 font-mono shrink-0">[{code}]</span>
    </div>
  );
}

function ProjectBox({ project, onClick }: { project: Project; onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.005, backgroundColor: "rgba(30, 41, 59, 0.3)" }}
      onClick={onClick}
      className="p-4 border border-slate-800 bg-black/20 flex items-center justify-between group cursor-pointer rounded-sm min-w-0 gap-4"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-mono text-blue-400 mb-1 tracking-wider">{project.projectNo}</p>
        <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
          {project.name}
        </h4>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">
          客戶: {project.client?.name || '未知客戶'}
        </p>
      </div>
      <ArrowUpRight size={15} className="text-slate-700 group-hover:text-blue-500 transition-colors shrink-0" />
    </motion.div>
  );
}