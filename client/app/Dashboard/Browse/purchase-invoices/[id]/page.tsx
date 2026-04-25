"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  Receipt, Plus, ArrowLeft, Loader2, 
  AlertCircle, DollarSign, ChevronRight
} from 'lucide-react';

export default function PurchaseInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-mono">系統載入中...</div>}>
      <PurchaseInvoiceContent />
    </Suspense>
  );
}

function PurchaseInvoiceContent() {
  const router = useRouter();
  const params = useParams();
  const targetPoId = params.id;
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [poDetail, setPoDetail] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: 0,
  });

  useEffect(() => {
    if (targetPoId) {
      fetchInvoices();
    }
  }, [targetPoId]);

 // 1. 抓取採購單詳情與發票列表
  const fetchInvoices = async () => {
    if (!targetPoId) return;
    setLoading(true);
    try {
      // 🚀 簡化為 api.get，網址使用樣板字串
      const res = await api.get(`/api/purchaseOrder/${targetPoId}`);

      setPoDetail(res.data);
      setInvoices(res.data.purchaseInvoices || []);
    } catch (err) {
      console.error("抓取失敗", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. 建立新的採購發票
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 自動生成編號邏輯 (保持不變)
      const nextIndex = invoices.length + 1;
      const autoInvoiceNo = `${poDetail?.poNumber || 'INV'}-${nextIndex}`;

      // 🚀 簡化為 api.post，移除 headers 參數
      await api.post(`/api/purchaseInvoice`, {
        amount: Number(formData.amount),
        purchaseOrderId: targetPoId,
        invoiceNo: autoInvoiceNo,
        status: 'PENDING'
      });

      setShowAddModal(false);
      setFormData({ amount: 0 });
      fetchInvoices();
    } catch (err) {
      alert("建立發票失敗，請確認資料正確性");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-4 md:p-8 text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 標頭區 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => router.back()} className="p-1 hover:bg-slate-800 rounded-sm text-slate-500 hover:text-white transition-colors">
                <ArrowLeft size={16} />
              </button>
              <span className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase">Financial_Terminal</span>
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
              <Receipt className="text-blue-500" size={28} />
              採購發票管理
            </h1>
            {poDetail && (
              <p className="text-xs text-slate-500 mt-2 font-mono">
                當前採購單：<span className="text-blue-400">{poDetail.poNumber}</span> | 廠商：{poDetail.vendor}
              </p>
            )}
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-sm font-bold text-[13px] flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95"
          >
            <Plus size={16} /> 新增發票
          </button>
        </div>

        {/* 列表內容 */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="text-[10px] font-mono text-slate-600 tracking-widest">資料同步中...</span>
            </div>
          ) : invoices.length > 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">發票編號</th>
                    <th className="px-6 py-4 text-right">金額</th>
                    <th className="px-6 py-4">建立日期</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm text-white font-medium">
                        {inv.invoiceNo}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-mono font-bold">
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-[12px] text-slate-500 font-mono">
                        {new Date(inv.createdAt).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-600 group-hover:text-white transition-colors">
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 border border-dashed border-slate-800 flex flex-col items-center justify-center opacity-40">
              <AlertCircle size={40} className="mb-2 text-slate-600" />
              <p className="text-sm tracking-widest font-medium">尚無發票記錄</p>
            </div>
          )}
        </div>
      </div>

      {/* 新增發票彈窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f1115] border border-blue-500/30 w-full max-w-md p-8 shadow-[0_0_100px_rgba(37,99,235,0.15)]">
            <h2 className="text-xl font-black text-white mb-2 italic border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">
              快速登記發票
            </h2>
            <p className="text-[11px] text-slate-500 mb-6 font-mono">
              自動編號對應採購單：<span className="text-blue-400">{poDetail?.poNumber}</span>
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                  <span>請款金額</span>
                  <span className="text-blue-500">美元 (USD)</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="number" 
                    required
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-800 p-4 pl-10 text-2xl text-emerald-400 font-mono outline-none focus:border-blue-500 transition-all"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ amount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-[12px] font-bold text-slate-500 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold py-3 tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
                >
                  確認並生成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}