"use client";

import React, { useState, useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import {
  FolderKanban,
  FileText,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  FileWarning,
} from "lucide-react";

import api from '../../../../lib/api';

import { motion, AnimatePresence } from "framer-motion";

// 定義狀態類型

type ProjectStatus = "UNFILLED" | "PENDING" | "COMPLETED";

export default function ClientProjectsPage() {
  const { id } = useParams();

  const router = useRouter();

  const [projects, setProjects] = useState([]);

  const [clientName, setClientName] = useState("");

  const [loading, setLoading] = useState(true);

  // 當前選中的頁籤狀態 (預設顯示未填寫/草稿)

  const [activeTab, setActiveTab] = useState<ProjectStatus>("UNFILLED");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/customer/${id}`);

        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log("🔍 原始專案資料內容:", data.projects); 
        
        setClientName(data?.name || "未知客戶");
        setProjects(data?.projects || []);
      } catch (err) {
        console.error("讀取專案失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 根據 activeTab 過濾專案 (假設你的資料庫有 status 欄位)

  // 如果資料庫還沒 status，你可以先根據是否有報價單來判斷

  const filteredProjects = projects.filter((p: any) => p.status === activeTab);

  const tabs = [
    {
      id: "UNFILLED",
      label: "未填寫",
      icon: <FileWarning size={14} />,
      color: "text-amber-500",
    },

    {
      id: "FILLED",
      label: "已填寫",
      icon: <Clock size={14} />,
      color: "text-blue-500",
    },

    {
      id: "COMPLETED",
      label: "已完成",
      icon: <CheckCircle2 size={14} />,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      {/* 返回按鈕 */}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-[10px] mb-6 transition-colors font-mono tracking-widest"
      >
        <ArrowLeft size={14} /> RETURN_TO_REGISTRY
      </button>

      {/* 標題區 (移除 NEW_PROJECT) */}

      <div className="mb-10 border-b border-slate-800 pb-6">
        <h2 className="text-blue-500 text-[10px] font-bold tracking-[.4em] mb-2 uppercase opacity-70">
          Client_Project_Terminal
        </h2>

        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
          {clientName || "LOADING..."}
        </h1>
      </div>

      {/* 狀態切換頁籤 (Tabs) */}

      <div className="flex gap-2 mb-8 bg-slate-900/50 p-1 border border-slate-800 rounded-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProjectStatus)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold tracking-[.2em] transition-all

              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
          >
            {tab.icon} {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 專案列表區 */}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />

          <span className="text-[10px] text-slate-500 tracking-[.3em]">
            FETCHING_PROJECTS...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project: any) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-slate-900/40 border border-slate-800 p-6 relative group"
                >
                  <div className="mb-8">
                    <span className="text-[10px] font-mono text-blue-500/40 block mb-1">
                      REF_{project.projectNo}
                    </span>

                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                  </div>

                  {/* 只保留報價單按鈕 */}

                  <button
                    onClick={() =>
                      router.push(
                        `/Dashboard/Browse/Project/${project.id}`,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 bg-blue-600/10 border border-blue-600/30 hover:bg-blue-600 hover:text-white py-3 text-[10px] font-bold text-blue-400 transition-all uppercase tracking-widest"
                  >
                    <FileText size={14} /> Open_Quote_System
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 border border-dashed border-slate-800 text-center"
              >
                <p className="text-[10px] text-slate-600 tracking-[.5em] uppercase font-mono">
                  No_Data_In_This_Sector
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
