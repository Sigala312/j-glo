"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircle2, Clock, Edit3, Trash2, DollarSign } from 'lucide-react';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 取得資料
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/order', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 過濾資料：根據 Project 內的 order 狀態
  const pendingProjects = data.filter(p => !p.order || p.order.status === 'PENDING');
  const completedProjects = data.filter(p => p.order && p.order.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xs font-mono text-blue-500 tracking-[0.3em] uppercase">Financial_Management</h2>
        <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">Order_Control_Center</h1>
      </header>

      {/* Tab 切換器 */}
      <div className="flex gap-4 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          待核定資料 ({pendingProjects.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'completed' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          已完成訂單 ({completedProjects.length})
        </button>
      </div>

      {/* 列表內容 */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="text-slate-500 font-mono text-xs animate-pulse">LOADING_DATABASE...</div>
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
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/order/finalize', 
        { projectId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (err) { alert("核定失敗"); }
  };

  return (
    <div className="grid gap-4">
      {projects.map((p: any) => (
        <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-sm flex items-center justify-between group">
          <div>
            {/* 🚀 讓專案名稱可以點擊跳轉 */}
            <Link href={`/ADMIN/Invoice/${p.id}`} className="block group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {p.projectNo}
                </span>
                <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {p.name}
                </h4>
              </div>
              <p className="text-xs text-slate-500">客戶：{p.client?.name || '未指定'}</p>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="number" 
                placeholder="輸入核定金額"
                className="bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-sm rounded-sm focus:border-blue-500 outline-none w-40 text-white"
                onChange={(e) => setAmounts({...amounts, [p.id]: e.target.value})}
                value={amounts[p.id] || ''} 
              />
            </div>
            <button 
              onClick={() => handleFinalize(p.id)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold rounded-sm flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 size={14} /> 核定
            </button>
          </div>
        </div>
      ))}
      {projects.length === 0 && <p className="text-slate-600 text-xs italic">尚無待核定專案</p>}
    </div>
  );
}

// --- 子元件：已完成列表 ---
function CompletedList({ projects, refresh }: any) {
  const handleDelete = async (orderId: string) => {
    if (!confirm("確定要刪除這筆財務紀錄嗎？")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refresh();
    } catch (err) { alert("刪除失敗"); }
  };

 return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-widest">
            <th className="py-4 px-4 font-normal">Project</th>
            <th className="py-4 px-4 font-normal">Client</th>
            <th className="py-4 px-4 font-normal text-right">Amount</th>
            <th className="py-4 px-4 font-normal text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {projects.map((p: any) => (
            <tr key={p.id} className="border-b border-slate-900/50 hover:bg-slate-800/20 transition-colors group">
              <td className="py-4 px-4">
                {/* 🚀 點擊專案名稱進入詳細管理頁面 */}
                <Link href={`/ADMIN/Invoice/${p.id}`} className="block hover:translate-x-1 transition-transform">
                  <p className="font-bold text-slate-300 group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-600">{p.projectNo}</p>
                </Link>
              </td>
              <td className="py-4 px-4 text-slate-400">{p.client?.name}</td>
              <td className="py-4 px-4 text-right font-mono text-emerald-400 font-bold">
                ${p.order?.amount.toLocaleString()}
              </td>
              <td className="py-4 px-4">
                <div className="flex justify-center gap-3 text-slate-500">
                  {/* 🚀 這裡也可以加一個按鈕直接進去管理 */}
                  <Link href={`/ADMIN/Invoice/${p.id}`} className="hover:text-blue-400 transition-colors">
                    <Edit3 size={16} />
                  </Link>
                  <button onClick={() => handleDelete(p.order.id)} className="hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {projects.length === 0 && <p className="text-slate-600 text-xs italic mt-4 px-4">尚無已完成訂單</p>}
    </div>
  );
}