// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // 🚀 引入 Hook
import axios from "axios";
import {
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
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
  { name: "Jan", income: 4000 },
  { name: "Feb", income: 3000 },
  { name: "Mar", income: 5000 },
  { name: "Apr", income: 2780 },
  { name: "May", income: 1890 },
  { name: "Jun", income: 2390 },
];

export default function DashboardPage() {
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [annualOrderTotal, setAnnualOrderTotal] = useState(0);
  const [annualInvoiceTotal, setAnnualInvoiceTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0); // 實質收入 (Paid Invoices)
  const [annualCost, setAnnualCost] = useState(0);
  const [annualPurchaseInvoiceTotal, setAnnualPurchaseInvoiceTotal] = useState(0);
const [uncollectedAmount, setUncollectedAmount] = useState(0);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 🚀 同步抓取：過期發票、所有專案(算訂單)、所有發票(算總開立額)
        const [overdueRes, ordersRes, allInvoicesRes, purchaseRes, purchaseInvoiceRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/Invoice/overdue", { headers }),
            axios.get("http://localhost:5000/api/order", { headers }),
            axios.get("http://localhost:5000/api/Invoice", { headers }), // 假設這是抓取所有發票的 API
            axios.get("http://localhost:5000/api/PurchaseOrder", { headers }),
            axios.get("http://localhost:5000/api/purchaseInvoice", { headers }),
          ]);

        const currentYear = 2026;

        // --- 1. 處理過期發票 ---
        setOverdueInvoices(overdueRes.data);

        // --- 2. 處理年度訂單總額 ---
        const orderTotal = ordersRes.data.reduce(
          (sum: number, project: any) => {
            const orderAmount = project.order
              ? Number(project.order.amount)
              : 0;
            const dateSource = project.order?.createdAt || project.createdAt;
            return new Date(dateSource).getFullYear() === currentYear
              ? sum + orderAmount
              : sum;
          },
          0,
        );
        setAnnualOrderTotal(orderTotal);

        // --- 3. 處理當年度開立發票金額 (不論是否繳費) 🚀 ---
        const invoiceTotal = allInvoicesRes.data.reduce(
          (sum: number, inv: any) => {
            const invDate = new Date(inv.createdAt);
            if (invDate.getFullYear() === currentYear) {
              return sum + (Number(inv.amount) || 0);
            }
            return sum;
          },
          0,
        );

        // 這裡我們需要一個新的 state 來存發票總額
        setAnnualInvoiceTotal(invoiceTotal);

        const paidTotal = allInvoicesRes.data.reduce(
          (sum: number, inv: any) => {
            const invDate = new Date(inv.createdAt);
            // 條件：年份正確 且 狀態為 PAID
            if (
              invDate.getFullYear() === currentYear &&
              inv.status === "PAID"
            ) {
              return sum + (Number(inv.amount) || 0);
            }
            return sum;
          },
          0,
        );

        setTotalRevenue(paidTotal);

        const costTotal = purchaseRes.data.reduce((sum: number, po: any) => {
          return new Date(po.createdAt).getFullYear() === currentYear
            ? sum + (Number(po.amount) || 0)
            : sum;
        }, 0);

        setAnnualCost(costTotal);

       setUncollectedAmount(invoiceTotal - paidTotal);

        const piTotal = purchaseInvoiceRes.data.reduce((sum: number, inv: any) => {
  return new Date(inv.createdAt).getFullYear() === currentYear
    ? sum + (Number(inv.amount) || 0)
    : sum;
}, 0);
setAnnualPurchaseInvoiceTotal(piTotal);
      } catch (err) {
        console.error("Dashboard 資料抓取失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h2 className="text-xs font-mono text-blue-500 tracking-[0.3em] uppercase">
          System_Overview
        </h2>
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          OPERATIONAL_DASHBOARD
        </h1>
      </header>

      {/* 頂部三個小區塊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="年度訂單總額"
          value={loading ? "---" : `$${annualOrderTotal.toLocaleString()}`}
          icon={TrendingUp}
          color="text-emerald-400"
          // percent="+12%"
        />
        <StatCard
          title="年度已開發票總額"
          value={loading ? "---" : `$${annualInvoiceTotal.toLocaleString()}`}
          icon={FileText} // 雖然是發票，但如果你想換圖示可以換成 FileText
          color="text-rose-400"
          // percent="+3.4%"
        />

        <StatCard
          title="已入帳現金"
          value={loading ? "---" : `$${totalRevenue.toLocaleString()}`}
          icon={Briefcase}
          color="text-amber-400"
          // percent="+5.2%"
        />
        <StatCard
          title="採購成本"
          value={loading ? "---" : `$${annualCost.toLocaleString()}`}
          icon={Users}
          color="text-rose-400"
          //  percent="+2.1%"
        />
        <StatCard
    title="採購發票總額"
    value={loading ? "---" : `$${annualPurchaseInvoiceTotal.toLocaleString()}`}
    icon={Receipt}
    color="text-rose-400"
  />
  <StatCard
    title="待收帳款差異"
    value={loading ? "---" : `$${uncollectedAmount.toLocaleString()}`}
    icon={AlertCircle}
    color="text-orange-400" 
  />
      </div>

      {/* 下面兩個大區塊 (7:3) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* 左側 7: 收入折線圖 */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-6 rounded-sm backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold tracking-widest text-slate-400">
              INCOME_ANALYTICS_V2
            </h3>
            <span className="text-[9px] text-slate-600 font-mono italic">
              Live Data Feed
            </span>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右側 3: 作業內容時間軸 */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase italic flex items-center gap-2">
              <AlertCircle size={14} className="animate-pulse" />
              Overdue_Payment_Alerts
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              COUNT: {overdueInvoices.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-slate-700" />
              </div>
            ) : overdueInvoices.length > 0 ? (
              overdueInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-300 font-bold truncate max-w-[120px]">
                      {inv.order?.project?.client?.name || "Unknown Client"}
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold italic">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-slate-500 font-mono">
                      {inv.invoiceNo || `#${inv.id.slice(-6)}`}
                    </span>
                    <span className="text-sm text-white font-black">
                      ${inv.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border border-dashed border-slate-800 text-slate-600 text-xs font-mono italic">
                NO_OVERDUE_PAYMENTS
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 內部子元件 ---

function StatCard({ title, value, icon: Icon, color, percent }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm relative group overflow-hidden">
      <div
        className={`absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}
      >
        <Icon size={80} />
      </div>
      <p className="text-[10px] tracking-[0.2em] text-slate-500 mb-2 uppercase">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-white">{value}</h3>
        {/* <span
          className={`text-[10px] font-mono ${percent.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}
        >
          {percent}
        </span> */}
      </div>
    </div>
  );
}

function TimelineItem({ time, action, desc }: any) {
  return (
    <div className="relative pl-6 border-l border-slate-800 py-1">
      <div className="absolute left-[-4.5px] top-2.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      <p className="text-[10px] font-mono text-slate-600 mb-1">{time}</p>
      <p className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
        {action}
      </p>
      <p className="text-[10px] text-slate-500 truncate">{desc}</p>
    </div>
  );
}
