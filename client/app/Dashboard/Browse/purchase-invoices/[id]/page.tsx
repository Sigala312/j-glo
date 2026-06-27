"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  Receipt, Plus, ArrowLeft, Loader2, 
  AlertCircle, DollarSign, Edit3, Trash2
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
  const [poDetail, setPoDetail] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 彈窗控制狀態
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // 表單資料狀態
  const [formData, setFormData] = useState({ amount: 0 });
  const [editingInvoice, setEditingInvoice] = useState<any>(null); // 紀錄當前正在編輯哪一筆發票

  useEffect(() => {
    if (targetPoId) {
      fetchInvoices();
    }
  }, [targetPoId]);

  // 1. 抓取列表 (查)
  const fetchInvoices = async () => {
    if (!targetPoId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/purchaseOrder/${targetPoId}`);
      setPoDetail(res.data);
      setInvoices(res.data.purchaseInvoices || []);
    } catch (err) {
      console.error("抓取失敗", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. 建立新發票 (增)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return alert("請輸入有效的請款金額");
    
    setIsSubmitting(true);
    try {
      const nextIndex = invoices.length + 1;
      const autoInvoiceNo = `${poDetail?.poNumber || 'INV'}-${nextIndex}`;

      await api.post(`/api/purchaseInvoice`, {
        amount: Number(formData.amount),
        purchaseOrderId: targetPoId,
        invoiceNo: autoInvoiceNo,
        status: 'PENDING'
      });

      setShowAddModal(false);
      setFormData({ amount: 0 });
      await fetchInvoices();
    } catch (err) {
      alert("建立發票失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. 開啟編輯彈窗並預填資料
  const openEditModal = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({ amount: invoice.amount });
    setShowEditModal(true);
  };

  // 4. 更新發票金額 (改/更新)
  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return alert("請輸入有效的請款金額");
    if (!editingInvoice) return;

    setIsSubmitting(true);
    try {
      // 🚀 串接後端更新 API：/api/purchaseInvoice/:id
      await api.put(`/api/purchaseInvoice/${editingInvoice.id}`, {
        amount: Number(formData.amount),
        // 如果後端需要帶入其他不變的欄位，可在這補齊
      });

      setShowEditModal(false);
      setEditingInvoice(null);
      setFormData({ amount: 0 });
      await fetchInvoices(); // 重新整理列表
    } catch (err) {
      console.error("更新失敗", err);
      alert("更新發票失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. 刪除發票 (刪)
  const handleDeleteInvoice = async (invoiceId: string, invoiceNo: string) => {
    if (!confirm(`⚠️ 確定要刪除發票 [${invoiceNo}] 嗎？此操作無法還原。`)) return;

    try {
      await api.delete(`/api/purchaseInvoice/${invoiceId}`);
      await fetchInvoices();
    } catch (err) {
      console.error("刪除失敗", err);
      alert("刪除發票失敗");
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
            onClick={() => {
              setFormData({ amount: 0 });
              setShowAddModal(true);
            }}
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
                    <th className="px-6 py-4 text-right w-32">操作</th>
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
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {/* 🚀 編輯按鈕 */}
                        <button 
                          onClick={() => openEditModal(inv)}
                          className="text-slate-600 hover:text-blue-400 p-1 rounded-sm hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="修改發票金額"
                        >
                          <Edit3 size={15} />
                        </button>
                        
                        {/* 🚀 刪除按鈕 */}
                        <button 
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNo)}
                          className="text-slate-600 hover:text-red-400 p-1 rounded-sm hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="刪除此發票紀錄"
                        >
                          <Trash2 size={15} />
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

      {/* --- 彈窗模組 A：新增發票 --- */}
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  請款金額
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="number" required autoFocus min="0.01" step="any" disabled={isSubmitting}
                    className="w-full bg-slate-900 border border-slate-800 p-4 pl-10 text-2xl text-emerald-400 font-mono outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ amount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-[12px] font-bold text-slate-500 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold py-3 tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "確認並生成"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 🚀 彈窗模組 B：更新（編輯）發票 --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f1115] border border-yellow-500/30 w-full max-w-md p-8 shadow-[0_0_100px_rgba(234,179,8,0.15)]">
            <h2 className="text-xl font-black text-white mb-2 italic border-l-4 border-yellow-500 pl-4 uppercase tracking-tighter">
              變更發票內容
            </h2>
            <p className="text-[11px] text-slate-500 mb-6 font-mono">
              正在修改發票：<span className="text-yellow-400">{editingInvoice?.invoiceNo}</span>
            </p>

            <form onSubmit={handleUpdateInvoice} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  修正後金額
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="number" required autoFocus min="0.01" step="any" disabled={isSubmitting}
                    className="w-full bg-slate-900 border border-slate-800 p-4 pl-10 text-2xl text-yellow-400 font-mono outline-none focus:border-yellow-500 transition-all disabled:opacity-50"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ amount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" disabled={isSubmitting}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingInvoice(null);
                  }}
                  className="flex-1 py-3 text-[12px] font-bold text-slate-500 hover:text-white transition-colors"
                >
                  取消變更
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black text-[12px] font-black py-3 tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "同步更新資料"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}