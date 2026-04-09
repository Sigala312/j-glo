"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Receipt, Loader2, CheckCircle2, Save } from 'lucide-react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'; // 👈 1. 引入 useParams

interface PO {
  id: string;
  poNumber: string;
  item: string;
  quantity: number;
  amount: number;
  vendor: string;
}

export default function PurchaseOrderSection({ projectId: propProjectId }: { projectId: string }) {
  const params = useParams();
  const router = useRouter();

  const projectId = propProjectId || (params.id as string);
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 表單 State
  const [formData, setFormData] = useState({
    item: '',
    quantity: 1,
    vendor: '',
    amount: 0
  });

  useEffect(() => {
    // 4. 確保有 ID 才抓資料
    if (projectId) {
      fetchPOs();
    }
  }, [projectId]);

  const fetchPOs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/purchaseOrder?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPos(res.data);
    } catch (err) {
      console.error("讀取採購單失敗", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
console.log("📍 handleSubmit 觸發時的 projectId Props 值:", projectId);
    if (!projectId) {
    alert("CRITICAL_ERROR: Project_ID_Missing");
    return;
  }
    try {
      const token = localStorage.getItem('token');

      const payload = {
      item: formData.item,
      quantity: Number(formData.quantity), // 確保是數字
      amount: Number(formData.amount),     // 確保是數字
      vendor: formData.vendor,
      projectId: projectId                 // 確保這裡抓到的是 props 進來的 id
    };

    console.log("SENDING_PAYLOAD:", payload);
      await axios.post(`http://localhost:5000/api/purchaseOrder`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
      setShowAddForm(false);
      setFormData({ item: '', quantity: 1, vendor: '', amount: 0 }); // 重置表單
      fetchPOs(); // 重新整理
    } catch (err) {
      alert("新增失敗");
    }
  };

  const handleUpdateStatus = async (newStatus: "FILLED" | "COMPLETED") => {
    if (pos.length === 0) {
      alert("目前尚無採購單資料，無法變更狀態。");
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      // 呼叫我們剛剛寫好的 PATCH API
      await axios.patch(
        `http://localhost:5000/api/projects/${projectId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`專案狀態已更新為：${newStatus === 'FILLED' ? '已填寫' : '已完成'}`);
      
      // 如果點擊「完成」，通常代表結案，可以導回列表頁
      if (newStatus === 'COMPLETED') {
        router.push('/Dashboard/Browse');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "狀態更新失敗";
      alert(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-6 border-t border-slate-800 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
          <Receipt size={14} /> Purchase_Orders
        </h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="text-blue-500 hover:text-white text-[10px] flex items-center gap-1 border border-blue-500/30 px-2 py-1 hover:bg-blue-600 transition-all"
        >
          <Plus size={12} /> ADD_PO
        </button>
      </div>

      {/* 採購單列表 */}
      <div className="space-y-2">
        {loading ? (
          <Loader2 className="animate-spin text-slate-700 mx-auto" size={20} />
        ) : pos.length > 0 ? (
          pos.map(po => (
            <div key={po.id} className="bg-slate-900/60 border border-slate-800 p-3 flex justify-between items-center group">
              <div>
                <p className="text-[9px] font-mono text-slate-500">{po.poNumber}</p>
                <p className="text-sm text-white font-bold">{po.item} <span className="text-slate-500 text-xs">x{po.quantity}</span></p>
                <p className="text-[10px] text-blue-400/70">{po.vendor}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-400 font-mono">${po.amount.toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-slate-600 text-center py-4 border border-dashed border-slate-800">NO_PO_RECORDED</p>
        )}
      </div>

      {/* 簡易新增彈窗 (可以用更漂亮的 Modal 代替) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-blue-500/50 p-8 w-full max-w-md shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tighter italic">NEW_PURCHASE_ORDER</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">ITEM_NAME</label>
                <input 
                  required
                  className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                  onChange={e => setFormData({...formData, item: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">QUANTITY</label>
                  <input 
                    type="number" required
                    className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">TOTAL_AMOUNT</label>
                  <input 
                    type="number" required
                    className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">VENDOR</label>
                <input 
                  required
                  className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                  onChange={e => setFormData({...formData, vendor: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-[10px] text-slate-500 hover:text-white">CANCEL</button>
                <button type="submit" className="flex-1 bg-blue-600 py-2 text-[10px] font-bold text-white hover:bg-blue-500">CONFIRM_GENERATE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 專案狀態控制按鈕區 */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-3 mt-10 border-t border-slate-800/50 pt-8 mb-6">
          {/* 儲存按鈕：設定為 FILLED */}
          <button
            onClick={() => handleUpdateStatus('FILLED')}
            disabled={pos.length === 0 || isUpdating}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-[.2em] transition-all border
              ${pos.length === 0 || isUpdating
                ? 'border-slate-800 text-slate-700 cursor-not-allowed' 
                : 'border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95'}`}
          >
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            SAVE_AS_FILLED
          </button>

          {/* 完成按鈕：設定為 COMPLETED */}
          <button
            onClick={() => handleUpdateStatus('COMPLETED')}
            disabled={pos.length === 0 || isUpdating}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-[.2em] transition-all
              ${pos.length === 0 || isUpdating
                ? 'bg-slate-800/50 text-slate-700 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95'}`}
          >
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            FINISH_PROJECT_FINAL
          </button>
        </div>
      )}
    </div>
  );
}