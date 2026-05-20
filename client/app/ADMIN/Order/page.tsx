"use client";

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Link from 'next/link';
import { CheckCircle2, Edit3, Trash2, DollarSign, User } from 'lucide-react';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get('/api/order', config);
      setData(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const pendingProjects = data.filter(p => !p.order || p.order.status === 'PENDING');
  const completedProjects = data.filter(p => p.order && p.order.status === 'COMPLETED');

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* 頁首響應式排版 */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-900 pb-4 gap-2">
        <div>
          <h2 className="text-[10px] font-mono text-blue-500 tracking-[0.3em] uppercase mb-0.5">Financial_Management</h2>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">Order_Control_Center</h1>
        </div>
        <div className="font-mono text-[9px] md:text-[10px] text-slate-500">
          SYSTEM_STATE: <span className="text-slate-300 font-bold">ONLINE</span>
        </div>
      </header>

      {/* Tab 切換器 */}
      <div className="flex gap-2 sm:gap-4 border-b border-slate-800/80">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'pending' ? 'text-white font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          待核定資料 ({pendingProjects.length})
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'completed' ? 'text-white font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          已完成訂單 ({completedProjects.length})
          {activeTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />}
        </button>
      </div>

      {/* 列表內容 */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-900/20 border border-slate-800/60 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'pending' ? (
          <PendingList projects={pendingProjects} refresh={fetchOrders} />
        ) : (
          <CompletedList projects={completedProjects} refresh={fetchOrders} />
        )}
      </div>
    </div>
  );
}

// --- 子元件：待核定列表 ---
function PendingList({ projects, refresh }: any) {
  const [amounts, setAmounts] = useState<any>({});

  const handleFinalize = async (projectId: string) => {
    const amount = parseFloat(amounts[projectId]);
    if (!amount || amount <= 0) return alert("請輸入有效金額");

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.post('/api/order/finalize', { projectId, amount }, config);
      refresh();
    } catch (err) { 
      alert("核定失敗"); 
    }
  };

  return (
    <div className="grid gap-4">
      {projects.map((p: any) => (
        <div key={p.id} className="bg-slate-900/20 border border-slate-800 p-4 sm:p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group backdrop-blur-md">
          <div className="flex-1 min-w-0">
            <Link href={`/ADMIN/Invoice/${p.id}`} className="block group">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm shrink-0 border border-blue-500/10">
                  {p.projectNo}
                </span>
                <h4 className="font-bold text-sm sm:text-base text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                  {p.name}
                </h4>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <User size={12} className="text-slate-700" />
                客戶：<span className="text-slate-400">{p.client?.name || '未指定'}</span>
              </p>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:shrink-0">
            <div className="relative flex-1 sm:flex-initial">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="number" 
                placeholder="輸入核定金額"
                className="bg-slate-950/60 border border-slate-700/80 pl-8 pr-3 py-2 text-xs sm:text-sm rounded-sm focus:border-blue-500 outline-none w-full sm:w-40 text-white font-mono"
                onChange={(e) => setAmounts({...amounts, [p.id]: e.target.value})}
                value={amounts[p.id] || ''} 
              />
            </div>
            <button 
              onClick={() => handleFinalize(p.id)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 sm:py-2 text-xs font-bold rounded-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
            >
              <CheckCircle2 size={14} /> 核定確認
            </button>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="py-12 text-center border border-dashed border-slate-800/60 text-slate-600 text-xs font-mono italic">
          SECURE: NO_PENDING_PROJECTS_FOUND
        </div>
      )}
    </div>
  );
}

// --- 子元件：已完成列表 ---
function CompletedList({ projects, refresh }: any) {
  const handleDelete = async (orderId: string) => {
    if (!confirm("確定要刪除這筆財務紀錄嗎？")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.delete(`/api/order/${orderId}`, config);
      refresh();
    } catch (err) { 
      alert("刪除失敗"); 
    }
  };

  return (
    <>
      {/* 💻 桌面端專用檢視 */}
      <div className="hidden md:block bg-slate-900/20 border border-slate-800/80 rounded-sm overflow-hidden backdrop-blur-md">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase tracking-widest font-medium">
              <th className="py-4 px-6">Project</th>
              <th className="py-4 px-6">Client</th>
              <th className="py-4 px-6 text-right">Amount</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-800/40">
            {projects.map((p: any) => (
              <tr key={p.id} className="hover:bg-blue-600/5 transition-colors group">
                <td className="py-4 px-6">
                  <Link href={`/ADMIN/Invoice/${p.id}`} className="block group/item">
                    <p className="font-bold text-slate-200 group-hover/item:text-blue-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{p.projectNo}</p>
                  </Link>
                </td>
                <td className="py-4 px-6 text-slate-400">{p.client?.name || '未指定'}</td>
                <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">
                  ${Number(p.order?.amount || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-4 text-slate-500">
                    <Link href={`/ADMIN/Invoice/${p.id}`} className="hover:text-blue-400 transition-colors p-1" title="編輯明細">
                      <Edit3 size={15} />
                    </Link>
                    <button onClick={() => handleDelete(p.order?.id)} className="hover:text-rose-500 transition-colors p-1" title="移除訂單">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 手機/平板端專用清單 */}
      <div className="block md:hidden space-y-4">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-slate-900/20 border border-slate-800 p-4 rounded-sm space-y-3">
            <div className="flex justify-between items-start gap-4">
              <Link href={`/ADMIN/Invoice/${p.id}`} className="block min-w-0">
                <h3 className="text-sm font-bold text-slate-200 truncate">{p.name}</h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{p.projectNo}</p>
              </Link>
              <div className="text-right font-mono text-emerald-400 font-bold text-sm shrink-0">
                ${Number(p.order?.amount || 0).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/40 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User size={11} className="text-slate-600" />
                <span>{p.client?.name || '未指定'}</span>
              </div>
              
              <div className="flex items-center gap-3 text-slate-400">
                <Link href={`/ADMIN/Invoice/${p.id}`} className="bg-slate-800/60 hover:bg-blue-600/20 hover:text-blue-400 border border-slate-700/60 p-2 rounded-sm transition-colors">
                  <Edit3 size={13} />
                </Link>
                <button 
                  onClick={() => handleDelete(p.order?.id)} 
                  className="bg-slate-800/60 hover:bg-rose-600/20 hover:text-rose-400 border border-slate-700/60 p-2 rounded-sm transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="py-12 text-center border border-dashed border-slate-800/60 text-slate-600 text-xs font-mono italic">
          SECURE: NO_COMPLETED_ORDERS_RECORDED
        </div>
      )}
    </>
  );
}