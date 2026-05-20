"use client";

import React, { useState, useEffect } from "react";
import api from '../lib/api'; 
import {
  AlertCircle,
  Loader2,
  TrendingUp,
  Briefcase,
  FileText,
  Receipt
} from "lucide-react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const monthlyData = [
  { name: "Jan", income: 4000 }, { name: "Feb", income: 3000 },
  { name: "Mar", income: 5000 }, { name: "Apr", income: 2780 },
  { name: "May", income: 1890 }, { name: "Jun", income: 2390 },
];

export default function DashboardPage() {
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [annualOrderTotal, setAnnualOrderTotal] = useState(0);
  const [annualInvoiceTotal, setAnnualInvoiceTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0); 
  const [annualCost, setAnnualCost] = useState(0);
  const [annualPurchaseInvoiceTotal, setAnnualPurchaseInvoiceTotal] = useState(0);
  const [uncollectedAmount, setUncollectedAmount] = useState(0);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [overdueRes, ordersRes, allInvoicesRes, purchaseRes, purchaseInvoiceRes] = 
          await Promise.all([
            api.get("/api/Invoice/overdue", config),
            api.get("/api/order", config),
            api.get("/api/Invoice", config),
            api.get("/api/PurchaseOrder", config),
            api.get("/api/purchaseInvoice", config),
          ]);

        const currentYear = 2026;

        setOverdueInvoices(overdueRes.data || []);

        const orderTotal = (ordersRes.data || []).reduce((sum: number, project: any) => {
          const orderAmount = project.order ? Number(project.order.amount) : 0;
          const dateSource = project.order?.createdAt || project.createdAt;
          return new Date(dateSource).getFullYear() === currentYear ? sum + orderAmount : sum;
        }, 0);
        setAnnualOrderTotal(orderTotal);

        const invoiceTotal = (allInvoicesRes.data || []).reduce((sum: number, inv: any) => {
          return new Date(inv.createdAt).getFullYear() === currentYear ? sum + (Number(inv.amount) || 0) : sum;
        }, 0);
        setAnnualInvoiceTotal(invoiceTotal);

        const paidTotal = (allInvoicesRes.data || []).reduce((sum: number, inv: any) => {
          const isCurrentYear = new Date(inv.createdAt).getFullYear() === currentYear;
          return (isCurrentYear && inv.status === "PAID") ? sum + (Number(inv.amount) || 0) : sum;
        }, 0);
        setTotalRevenue(paidTotal);

        const costTotal = (purchaseRes.data || []).reduce((sum: number, po: any) => {
          return new Date(po.createdAt).getFullYear() === currentYear ? sum + (Number(po.amount) || 0) : sum;
        }, 0);
        setAnnualCost(costTotal);

        const piTotal = (purchaseInvoiceRes.data || []).reduce((sum: number, inv: any) => {
          return new Date(inv.createdAt).getFullYear() === currentYear ? sum + (Number(inv.amount) || 0) : sum;
        }, 0);
        setAnnualPurchaseInvoiceTotal(piTotal);

        setUncollectedAmount(invoiceTotal - paidTotal);

      } catch (err) {
        console.error("❌ Dashboard 數據抓取失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
      {/* 頁首響應式排版 */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-900 pb-4 gap-2">
        <div>
          <h2 className="text-[10px] font-mono text-blue-500 tracking-[0.3em] uppercase mb-0.5">
            System_Core_Overview
          </h2>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
            Operational_Dashboard
          </h1>
        </div>
        <div className="font-mono text-[9px] md:text-[10px] text-slate-500">
          FRAME: <span className="text-slate-300 font-bold">2026_ANNUAL</span>
        </div>
      </header>

      {/* 數據卡片網格 (RWD: 手機1欄 -> 刷到桌機3欄) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="年度訂單總額" value={annualOrderTotal} loading={loading} icon={TrendingUp} color="text-emerald-400" />
        <StatCard title="年度已開發票總額" value={annualInvoiceTotal} loading={loading} icon={FileText} color="text-blue-400" />
        <StatCard title="已入帳現金額" value={totalRevenue} loading={loading} icon={Briefcase} color="text-amber-400" />
        <StatCard title="項目採購成本" value={annualCost} loading={loading} icon={Receipt} color="text-rose-400" />
        <StatCard title="採購發票總額" value={annualPurchaseInvoiceTotal} loading={loading} icon={Receipt} color="text-purple-400" />
        <StatCard title="待收帳款差異" value={uncollectedAmount} loading={loading} icon={AlertCircle} color="text-orange-400" isWarning={uncollectedAmount > 0} />
      </div>

      {/* 圖表與時間軸區塊 (RWD: 手機垂直排，桌機 7:3 併排) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8">
        {/* 左側：數據趨勢圖 */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800/80 p-4 md:p-6 rounded-sm backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold tracking-widest text-slate-400">INCOME_ANALYTICS_STREAM</h3>
            <span className="text-[9px] text-slate-600 font-mono italic">● Connection_Active</span>
          </div>
          {/* 用 h-[280px] md:h-[380px] 讓手機版圖表矮一點更精緻 */}
          <div className="h-[280px] md:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", fontSize: "11px", color: "#f8fafc" }} />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右側：逾期帳款 */}
        <div className="lg:col-span-3 bg-slate-900/20 border border-slate-800/80 p-4 md:p-6 rounded-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
            <h3 className="text-xs font-bold tracking-widest text-orange-500 uppercase flex items-center gap-2">
              <AlertCircle size={14} className={overdueInvoices.length > 0 ? "animate-bounce" : ""} />
              Overdue_Invoices
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-sm">
              ERR: {overdueInvoices.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] lg:max-h-[380px] pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="animate-spin text-blue-500" size={18} />
                <span className="text-[9px] text-slate-600">FETCHING...</span>
              </div>
            ) : overdueInvoices.length > 0 ? (
              overdueInvoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-red-950/10 border border-red-900/30 rounded-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-slate-300 font-bold truncate max-w-[130px]">
                      {inv.order?.project?.client?.name || "未定義客戶"}
                    </span>
                    <span className="text-[10px] text-rose-500 font-mono">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Expired"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-slate-600 font-mono">
                      {inv.invoiceNo || `#${inv.id.slice(-6)}`}
                    </span>
                    <span className="text-xs text-white font-black font-mono">
                      ${Number(inv.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-800/60 text-slate-600 text-[10px] font-mono italic">
                SECURE: NO_OVERDUE_DETECTION
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, loading, icon: Icon, color, isWarning }: any) {
  return (
    <div className={`bg-slate-900/20 border p-5 md:p-6 rounded-sm relative group overflow-hidden transition-all ${
      isWarning && value > 0 ? 'border-orange-500/30 bg-orange-950/5' : 'border-slate-800/80'
    }`}>
      {/* 隱藏背景圖示在小螢幕上，避免擋到小手機的字 */}
      <div className={`hidden sm:block absolute -right-3 -bottom-3 opacity-[0.03] group-hover:scale-110 transition-transform ${color}`}>
        <Icon size={80} />
      </div>
      <p className="text-[9px] md:text-[10px] tracking-[0.15em] text-slate-500 mb-1 md:mb-2 uppercase font-medium">
        {title}
      </p>
      <div>
        {loading ? (
          <div className="h-7 w-28 bg-slate-800/40 animate-pulse rounded-sm" />
        ) : (
          <h3 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">
            ${Number(value || 0).toLocaleString()}
          </h3>
        )}
      </div>
    </div>
  );
}