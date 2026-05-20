"use client";

import React, { useState, useEffect, use } from "react";
import api from '../../../lib/api';
import {
  ArrowLeft,
  Receipt,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  Calendar,
  Layers
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: "", dueDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get(`/api/projects/${id}`, config);
      setProject(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.post("/api/Invoice", {
        orderId: project.order.id, 
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
      }, config);

      await fetchProjectDetails();
      setIsModalOpen(false);
      setFormData({ amount: "", dueDate: "" });
    } catch (err) {
      alert("新增發票失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (InvoiceId: string) => {
    if (!confirm("確定此發票已入帳嗎？")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.patch(`/api/Invoice/${InvoiceId}/pay`, {}, config);
      await fetchProjectDetails();
    } catch (err) {
      console.error("Update failed:", err);
      alert("狀態更新失敗");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 font-mono text-xs">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
        INITIALIZING_SYSTEM_DATA...
      </div>
    );
  }

  if (!project) return <div className="text-white p-4 font-mono text-xs">PROJECT_NOT_FOUND</div>;

  const isFinalized = !!project.order;

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn p-1 sm:p-0">
      {/* 頂部導覽與基本資訊 */}
      <header className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors w-fit group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> 返回訂單中心
        </button>

        {/* 標題欄：RWD 改為手機堆疊、電腦並排 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-900 pb-6 gap-4">
          <div className="space-y-2 w-full sm:w-auto min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm border border-blue-500/10 shrink-0">
                {project.projectNo}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic truncate w-full sm:w-auto">
                {project.name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              客戶: <span className="text-slate-200">{project.client?.name || "UNKNOWN"}</span>
            </p>
          </div>

          {/* 右側金額區：手機端寬度拉滿並靠左 */}
          <div className="text-left sm:text-right bg-slate-900/10 sm:bg-transparent p-3 sm:p-0 rounded-sm w-full sm:w-auto border border-slate-800/40 sm:border-none">
            <p className="text-[10px] sm:text-[12px] text-slate-500 tracking-[0.2em] uppercase mb-0.5">
              TOTAL_ORDER_AMOUNT (總金額)
            </p>
            <p className={`text-xl sm:text-2xl font-mono font-bold ${isFinalized ? "text-emerald-400" : "text-slate-700"}`}>
              {isFinalized ? `$${project.order.amount.toLocaleString()}` : "UNAUTHORIZED"}
            </p>
          </div>
        </div>
      </header>

      {/* 核心雙欄：小螢幕會自動單欄排列 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* --- 左側：採購單管理 --- */}
        <section className="bg-slate-900/20 border border-slate-800 p-4 sm:p-6 rounded-sm space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-blue-400">
              <ShoppingCart size={16} />
              <h3 className="font-bold tracking-widest text-xs sm:text-sm uppercase font-mono">
                Cost_Analysis (採購單)
              </h3>
            </div>
          </div>

          <div className="min-h-[200px] space-y-2">
            {project.purchaseOrders && project.purchaseOrders.length > 0 ? (
              project.purchaseOrders.map((po: any) => (
                <div
                  key={po.id}
                  className="flex justify-between items-center bg-slate-950/40 p-3 border border-slate-800/50 rounded-sm hover:border-slate-700 transition-colors gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 font-bold truncate">
                      {po.item || "未命名採購"}
                    </p>
                    <p className="text-[9px] text-slate-600 font-mono mt-0.5">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs font-mono font-bold text-blue-400 shrink-0">
                    ${po.amount?.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center border border-dashed border-slate-800/60 text-slate-600 rounded-sm">
                <p className="text-xs font-mono italic">NO_PURCHASE_RECORDS_FOUND</p>
              </div>
            )}
          </div>
        </section>

        {/* --- 右側：發票請款管理 --- */}
        <section
          className={`relative p-4 sm:p-6 rounded-sm space-y-4 border transition-all duration-500 backdrop-blur-md ${
            isFinalized
              ? "bg-slate-900/20 border-slate-800 opacity-100"
              : "bg-black/40 border-slate-950 opacity-40 select-none grayscale"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Receipt size={16} />
              <h3 className="font-bold tracking-widest text-xs sm:text-sm uppercase font-mono">
                Revenue_Tracking (發票)
              </h3>
            </div>
            {isFinalized && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded-sm transition-all border border-emerald-500/20 uppercase"
              >
                + 新增發票
              </button>
            )}
          </div>

          {isFinalized ? (
            <div className="min-h-[200px] space-y-3">
              {project.order?.invoices && project.order.invoices.length > 0 ? (
                project.order.invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="bg-slate-950/40 border border-slate-800 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/20 transition-all"
                  >
                    {/* 資訊網格：電腦版橫排(grid-cols-4)、手機版改為雙排(grid-cols-2) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-3 sm:gap-4">
                      <div>
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">金額</p>
                        <p className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                          ${inv.amount?.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">繳款期限</p>
                        <p className="text-xs text-slate-300 font-mono">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '---'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">入帳時間</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : 'PENDING'}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center md:items-start">
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider md:hidden mb-1">狀態</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-tight w-fit ${
                          inv.status === 'PAID' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>

                    {/* 按鈕動作區：手機端自動拉滿滿版 */}
                    <div className="shrink-0 md:ml-2 pt-2 md:pt-0 border-t border-slate-800/40 md:border-none flex justify-end">
                      {inv.status !== 'PAID' ? (
                        <button
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="w-full md:w-auto bg-slate-900 hover:bg-emerald-600 border border-slate-800 text-slate-200 hover:text-white text-[10px] font-bold py-2 px-3.5 rounded-sm transition-colors uppercase tracking-widest text-center"
                        >
                          Confirm_Payment
                        </button>
                      ) : (
                        <div className="text-emerald-500 opacity-40 p-1">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-800/50 rounded-sm">
                  <p className="text-xs text-slate-500 font-mono italic">NO_INVOICE_RECORDS_FOUND</p>
                </div>
              )}
            </div>
          ) : (
            /* 鎖定密鑰圖標狀態 */
            <div className="min-h-[220px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-11 h-11 rounded-full bg-slate-950 flex items-center justify-center border border-slate-900 shadow-inner animate-pulse">
                <AlertCircle className="text-amber-500/40" size={20} />
              </div>
              <div className="space-y-1 px-4">
                <p className="text-xs font-mono font-bold text-slate-400 tracking-wider">ACCESS_RESTRICTED</p>
                <p className="text-[10px] sm:text-xs text-slate-600 max-w-[260px] leading-relaxed">
                  Please finalize the total order amount in the Control Center to enable billing features.
                </p>
              </div>
              <Link
                href="/ADMIN/Order"
                className="text-[10px] font-mono font-bold text-blue-400 underline underline-offset-4 hover:text-blue-300 transition-colors uppercase tracking-wider"
              >
                &lt; GO_TO_FINALIZE &gt;
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* 底部狀態欄 */}
      <footer className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] text-slate-600 font-mono gap-2">
        <div className="flex gap-4 sm:gap-6">
          <span>STATUS: <span className={isFinalized ? "text-emerald-500" : "text-amber-500"}>{isFinalized ? "AUTHORIZED" : "PENDING_APPROVAL"}</span></span>
          <span>ENCRYPTION: AES_256_ACTIVE</span>
        </div>
        <span>LAST_SYNC: {new Date().toLocaleTimeString()}</span>
      </footer>

      {/* 發票彈出視窗：優化移動端視窗邊距與點擊 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-5 sm:p-6 rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800/60 pb-3">
              <h3 className="text-white font-bold tracking-widest text-sm flex items-center gap-2 font-mono">
                <Receipt size={16} className="text-emerald-400" />
                NEW_INVOICE_PROTOCOL
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 text-sm font-mono transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">金額 (AMOUNT)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type="number"
                    step="any"
                    className="w-full bg-slate-950 border border-slate-800 pl-8 pr-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none transition-colors font-mono rounded-sm"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">繳款期限 (DUE_DATE)</label>
                <input
                  required
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none transition-colors font-mono rounded-sm color-scheme-dark"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors border border-slate-800 hover:bg-slate-800 rounded-sm font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm font-mono shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : "EXECUTE_ISSUE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}