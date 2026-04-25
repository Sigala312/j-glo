"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Search, Plus, Loader2, Users } from "lucide-react";

import api from '../../lib/api';

import CustomerCard from "./components/CustomerCard"; // 剛才做的子元件

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // 1. 抓取客戶資料

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // 🚀 使用中央 api 實例，自動注入 Token
        const response = await api.get("/api/customer");

        setCustomers(response.data);
      } catch (err) {
        console.error("讀取客戶失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // 2. 搜尋過濾邏輯

  const filteredCustomers = customers.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      {/* 頁面標題區 */}

      <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <Users size={18} />

            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">
              Database_Access
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight">
            客戶管理控制台
          </h1>
        </div>

        {/* <button
          onClick={() => router.push("/projects/add")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-xs font-bold tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} /> NEW_ENTITY
        </button> */}
      </div>

      {/* 搜尋列 */}

      <div className="relative mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          size={18}
        />

        <input
          type="text"
          placeholder="SEARCH_BY_CLIENT_NAME..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/40 border border-slate-800 p-4 pl-12 outline-none focus:border-blue-500 text-sm text-white placeholder:text-slate-700 tracking-widest font-mono"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono">
          RESULT_COUNT: {filteredCustomers.length}
        </div>
      </div>

      {/* 客戶列表區 */}

<div className="space-y-4">
  {loading ? (
    <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-[10px] tracking-[0.3em]">SYNCHRONIZING_DATA...</span>
    </div>
  ) : filteredCustomers.length > 0 ? (
    filteredCustomers.map((customer: any) => (
      <CustomerCard 
        key={customer.id} 
        customer={customer} 
        // 修改這裡：點擊後導向 browse 頁面
        onClick={() => router.push(`/Dashboard/Browse/customer/${customer.id}`)}
      />
    ))
  ) : (
    <div className="text-center py-20 border border-dashed border-slate-800 text-slate-500">
      <p className="text-xs tracking-widest uppercase">未找到匹配的客戶節點</p>
    </div>
  )}
</div>
    </div>
  );
}
