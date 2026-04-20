"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ArrowUpRight, 
  Loader2, // 👈 增加載入圖示
  FileQuestion
} from 'lucide-react';
import axios from 'axios';

interface Project {
  id: string;
  projectNo: string;
  name: string;
  status: 'UNFILLED' | 'FILLED' | 'COMPLETED';
  client: { name: string };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<{
    completed: Project[],
    filled: Project[],
    unfilled: Project[]
  }>({ completed: [], filled: [], unfilled: [] });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 同時發送三個請求，提高效率
      const [resCompleted, resFilled, resUnfilled] = await Promise.all([
        axios.get('http://localhost:5000/api/projects/all?status=COMPLETED', { headers }),
        axios.get('http://localhost:5000/api/projects/all?status=FILLED', { headers }),
        axios.get('http://localhost:5000/api/projects/all?status=UNFILLED', { headers }),
      ]);

      setProjects({
        completed: resCompleted.data,
        filled: resFilled.data,
        unfilled: resUnfilled.data
      });
    } catch (err) {
      console.error("Dashboard 資料抓取失敗", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1-3: 頂部數據概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="完成" count={projects.completed.length} icon={CheckCircle2} color="text-green-500" />
        <StatusCard title="待處理" count={projects.filled.length} icon={AlertCircle} color="text-orange-500" />
        <StatusCard title="未填寫" count={projects.unfilled.length} icon={FileQuestion} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 5: 未填寫資料專案 (抓 UNFILLED) */}
          <section>
            <SectionHeader title="未填寫資料專案" code="UNFILLED_DATA" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {projects.unfilled.length > 0 ? (
                projects.unfilled.map(proj => (
                  <ProjectBox key={proj.id} project={proj} />
                ))
              ) : (
                <div className="col-span-2 py-8 border border-dashed border-slate-800 text-center text-slate-600 text-xs">NO_UNFILLED_DATA_FOUND</div>
              )}
            </div>
          </section>

          {/* 4: 待處理專案 (抓 FILLED) */}
          <section>
            <SectionHeader title="待處理專案" code="FILLED_AWAITING_REVIEW" />
            <div className="space-y-3 mt-4">
              {projects.filled.length > 0 ? (
                projects.filled.map(proj => (
                  <ProjectBox key={proj.id} project={proj} />
                ))
              ) : (
                <div className="py-8 border border-dashed border-slate-800 text-center text-slate-600 text-xs">NO_PENDING_PROTOCOLS</div>
              )}
            </div>
          </section>
        </div>

        {/* 右側：訊息牆 (這部分可以保留模擬或之後接 Activity Log API) */}
        <aside className="bg-black/40 border border-slate-800 rounded-sm p-6 backdrop-blur-md h-fit lg:h-[calc(100vh-280px)] overflow-hidden flex flex-col">
          <SectionHeader title="系統動態" code="LIVE_FEED" />
          <div className="mt-6 space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 text-[10px] text-slate-500 italic">
             {">"} DATA_SYNCHRONIZED_SUCCESSFULLY...<br/>
             {">"} WAITING_FOR_NEW_INPUTS...
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- 子元件區 (微調以適應 API 資料結構) ---

function ProjectBox({ project }: { project: Project }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, backgroundColor: "rgba(30, 41, 59, 0.4)" }}
      className="p-4 border border-slate-800 bg-black/20 flex items-center justify-between group cursor-pointer"
    >
      <div>
        <p className="text-[9px] text-blue-500 mb-1">{project.projectNo}</p>
        <h4 className="text-sm text-slate-200 group-hover:text-white transition-colors">{project.name}</h4>
        <p className="text-[10px] text-slate-500">{project.client?.name || '未知客戶'}</p>
      </div>
      <ArrowUpRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
    </motion.div>
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

// function ProjectBox({ project, status }: { project: any; status: 'filled' | 'pending' }) {
//   return (
//     <motion.div 
//       whileHover={{ scale: 1.01, backgroundColor: "rgba(30, 41, 59, 0.4)" }}
//       className="p-4 border border-slate-800 bg-black/20 flex items-center justify-between group cursor-pointer"
//     >
//       <div>
//         <p className="text-[9px] text-blue-500 mb-1">{project.id}</p>
//         <h4 className="text-sm text-slate-200 group-hover:text-white transition-colors">{project.name}</h4>
//         <p className="text-[10px] text-slate-500">{project.client}</p>
//       </div>
//       <ArrowUpRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
//     </motion.div>
//   );
// }