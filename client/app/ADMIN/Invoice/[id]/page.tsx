"use client";

import React, { useState, useEffect, use } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Receipt,
  ShoppingCart,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Loader2,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🚀 1. 先用 React.use 把 params 解開
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: "", dueDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/Invoice",
        {
          orderId: project.order.id, // 關鍵：發票要掛在訂單下
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // 成功後重新抓取資料並關閉視窗
      await fetchProjectDetails();
      setIsModalOpen(false);
      setFormData({ amount: "", dueDate: "" });
    } catch (err) {
      alert("新增發票失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理發票狀態更新為已付款
const handleMarkAsPaid = async (InvoiceId: string) => {
  if (!confirm("確定此發票已入帳嗎？")) return;

  try {
    const token = localStorage.getItem('token');
    await axios.patch(`http://localhost:5000/api/Invoice/${InvoiceId}/pay`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 成功後重新抓取專案詳情以更新列表
    await fetchProjectDetails();
  } catch (err) {
    console.error("Update failed:", err);
    alert("狀態更新失敗");
  }
};

  // 取得單一專案詳細資料
  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      // 🚀 2. 使用解開後的 id
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 font-mono text-xs">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
        INITIALIZING_SYSTEM_DATA...
      </div>
    );
  }

  if (!project) return <div className="text-white">PROJECT_NOT_FOUND</div>;

  const isFinalized = !!project.order; // 判斷是否已核定金額

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 頂部導覽與基本資訊 */}
      <header className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={14} /> 訂單
        </button>

        <div className="flex justify-between items-end border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {project.projectNo}
              </span>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                {project.name}
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-mono">
              客戶: {project.client?.name || "UNKNOWN"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[12px] text-slate-400 tracking-[0.2em] mb-1">
              訂單金額
            </p>
            <p
              className={`text-2xl font-mono font-bold ${isFinalized ? "text-emerald-400" : "text-slate-700"}`}
            >
              {isFinalized
                ? `$${project.order.amount.toLocaleString()}`
                : "UNAUTHORIZED"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- 左側：採購單管理 (永遠開放) --- */}
        <section className="bg-slate-900/20 border border-slate-800 p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-blue-400">
              <ShoppingCart size={18} />
              <h3 className="font-bold tracking-widest text-sm uppercase">
                Cost_Analysis (採購單)
              </h3>
            </div>
            {/* <button className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-sm transition-all">
              ADD_NEW_PO
            </button> */}
          </div>

          <div className="min-h-[200px] space-y-2">
            {project.purchaseOrders && project.purchaseOrders.length > 0 ? (
              project.purchaseOrders.map((po: any) => (
                <div
                  key={po.id}
                  className="flex justify-between items-center bg-slate-950/50 p-3 border border-slate-800/50 rounded-sm hover:border-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-xs text-slate-300 font-bold">
                      {po.item || "未命名採購"}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs font-mono text-blue-400">
                    ${po.amount?.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-10 flex flex-col items-center border border-dashed border-slate-800 text-slate-600">
                <p className="text-xs font-mono italic">
                  NO_PURCHASE_RECORDS_FOUND
                </p>
              </div>
            )}
          </div>
        </section>

        {/* --- 右側：發票請款管理 (條件開放) --- */}
        <section
  className={`relative p-6 rounded-sm space-y-4 border transition-all duration-500 ${
    isFinalized
      ? "bg-slate-900/20 border-slate-800 opacity-100"
      : "bg-black/40 border-slate-900 opacity-50 select-none grayscale"
  }`}
>
  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
    <div className="flex items-center gap-2 text-emerald-400">
      <Receipt size={18} />
      <h3 className="font-bold tracking-widest text-sm uppercase">
        Revenue_Tracking (發票)
      </h3>
    </div>
    {isFinalized && (
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-[14px] bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-3 py-1 rounded-sm transition-all border border-emerald-500/20"
      >
        +新增發票
      </button>
    )}
  </div>

  {isFinalized ? (
    <div className="min-h-[200px] space-y-3">
      {project.order?.invoices && project.order.invoices.length > 0 ? (
        project.order.invoices.map((inv: any) => (
          <div
            key={inv.id}
            className="group bg-slate-950/40 border border-slate-800 p-4 rounded-sm flex items-center justify-between hover:border-emerald-500/30 transition-all"
          >
            <div className="grid grid-cols-4 flex-1 gap-4 items-center">
              {/* 金額與編號 */}
              <div>
                <p className="text-[10px] text-slate-500 font-mono">金額</p>
                <p className="text-sm font-bold text-emerald-400">
                  ${inv.amount?.toLocaleString()}
                </p>
              </div>

              {/* 繳款期限 */}
              <div>
                <p className="text-[10px] text-slate-500 font-mono">繳款期限</p>
                <p className="text-xs text-slate-300">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '---'}
                </p>
              </div>

              {/* 入帳時間 */}
              <div>
                <p className="text-[10px] text-slate-500 font-mono">入帳時間</p>
                <p className="text-xs text-slate-400 font-mono">
                  {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : 'PENDING'}
                </p>
              </div>

              {/* 狀態標籤 */}
              <div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-tighter ${
                  inv.status === 'PAID' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {inv.status}
                </span>
              </div>
            </div>

            {/* 確認付款按鈕 */}
            <div className="ml-4">
              {inv.status !== 'PAID' ? (
                <button
                  onClick={() => handleMarkAsPaid(inv.id)}
                  className="bg-slate-800 hover:bg-emerald-600 text-white text-[10px] font-bold py-1 px-3 rounded-sm transition-colors uppercase tracking-widest"
                >
                  Confirm_Payment
                </button>
              ) : (
                <div className="text-emerald-500 opacity-50">
                   <CheckCircle2 size={16} />
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-800/50">
          <p className="text-xs text-slate-500 font-mono">
            NO_INVOICE_RECORDS_FOUND
          </p>
        </div>
      )}
    </div>
  ) : (
    /* 鎖定狀態 */
    <div className="min-h-[200px] flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
        <AlertCircle className="text-amber-500/50" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400">ACCESS_RESTRICTED</p>
        <p className="text-[10px] text-slate-600 max-w-[200px]">
          Please finalize the total order amount in the Control Center to enable billing features.
        </p>
      </div>
      <Link
        href="/ADMIN/Order"
        className="text-[10px] text-blue-500 underline underline-offset-4 hover:text-blue-400"
      >
        GO_TO_FINALIZE
      </Link>
    </div>
  )}
</section>
      </div>

      {/* 底部狀態欄 */}
      <footer className="pt-8 border-t border-slate-900 flex justify-between text-[10px] text-slate-600 font-mono">
        <div className="flex gap-6">
          <span>STATUS: {isFinalized ? "AUTHORIZED" : "PENDING_APPROVAL"}</span>
          <span>ENCRYPTION: AES_256_ACTIVE</span>
        </div>
        <span>LAST_SYNC: {new Date().toLocaleTimeString()}</span>
      </footer>

      {/* 發票彈出視窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-6 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold tracking-widest flex items-center gap-2">
                <Receipt size={18} className="text-emerald-400" />
                NEW_INVOICE_PROTOCOL
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* 金額欄位 */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">
                  金額
                </label>
                <div className="relative">
                  <DollarSign
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 pl-8 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 期限欄位 */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">
                  繳款期限
                </label>
                <input
                  required
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors border border-slate-800 hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "EXECUTE_ISSUE"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
