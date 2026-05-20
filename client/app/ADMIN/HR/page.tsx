"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, UserX, ShieldAlert, Loader2, Mail, Building2, Layers } from 'lucide-react';
import api from "../../lib/api"; 

interface User {
  id: string;
  name: string;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  department?: { name: string };
  provider: string;
}

export default function HRManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get('/api/auth/users', config); 
      setUsers(res.data || []);
    } catch (error: any) {
      console.error("無法讀取用戶名單", error);
      if (error.response?.status === 403) {
        alert("權限不足：您不具備存取人事資料庫的權限");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.patch('/api/auth/users/status', { userId, newStatus }, config);
      await fetchUsers();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "更新失敗，請檢查權限或後端連線";
      alert(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* 標題區 */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-900 pb-4 gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase">
            Personnel_Registry
          </h1>
          <p className="text-slate-500 text-[10px] md:text-xs mt-1 uppercase tracking-widest">
            管理系統存取權限與人員狀態
          </p>
        </div>
        <div className="font-mono text-[9px] md:text-[10px] text-slate-500">
          REGISTRY_COUNT: <span className="text-blue-500 font-bold">{loading ? "..." : users.length}</span>
        </div>
      </header>

      {/* 核心內容區 (含骨架屏切換) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900/20 border border-slate-800/50 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* 💻 桌面端專用視窗 (md 斷點以上顯示表格) */}
          <div className="hidden md:block bg-slate-900/20 border border-slate-800/80 rounded-sm overflow-hidden backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4 font-medium">Identity / Email</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium">Current Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                <AnimatePresence mode="popLayout">
                  {users.map((user) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={user.id} 
                      className="hover:bg-blue-600/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{user.name}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Building2 size={12} className="text-slate-600" /> {user.department?.name || '未分配'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase">
                        {user.provider}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <ActionController user={user} actionLoading={actionLoading} onUpdate={handleStatusUpdate} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* 📱 手機/平板端專用清單 (md 斷點以下自動切換為卡片) */}
          <div className="block md:hidden space-y-4">
            <AnimatePresence mode="popLayout">
              {users.map((user) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={user.id}
                  className="bg-slate-900/20 border border-slate-800 p-4 rounded-sm space-y-3"
                >
                  {/* 上排：名字與狀態 */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{user.name}</h3>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail size={10} /> {user.email}
                      </p>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>

                  {/* 中排：部門與來源技術資訊 */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Building2 size={11} className="text-slate-600" />
                      <span>{user.department?.name || '未分配'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 font-mono text-[9px] justify-end uppercase">
                      <Layers size={10} />
                      <span>{user.provider}</span>
                    </div>
                  </div>

                  {/* 下排：操作按鈕區 (拉滿版方便手勢點擊) */}
                  <div className="pt-1 flex justify-end">
                    <ActionController user={user} actionLoading={actionLoading} onUpdate={handleStatusUpdate} isFullWidth />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

// --- RWD 最佳化抽離組件 ---

// 按鈕邏輯分配器
function ActionController({ user, actionLoading, onUpdate, isFullWidth }: { user: User, actionLoading: string | null, onUpdate: any, isFullWidth?: boolean }) {
  return (
    <div className={`flex ${isFullWidth ? 'w-full' : ''} gap-2`}>
      {user.status === 'PENDING' && (
        <ActionButton 
          onClick={() => onUpdate(user.id, 'ACTIVE')}
          icon={<UserCheck size={14} />}
          label="核准存取"
          color="green"
          loading={actionLoading === user.id}
          isFullWidth={isFullWidth}
        />
      )}
      
      {user.status === 'ACTIVE' && (
        <ActionButton 
          onClick={() => onUpdate(user.id, 'SUSPENDED')}
          icon={<UserX size={14} />}
          label="安全停權"
          color="red"
          loading={actionLoading === user.id}
          isFullWidth={isFullWidth}
        />
      )}

      {user.status === 'SUSPENDED' && (
        <ActionButton 
          onClick={() => onUpdate(user.id, 'ACTIVE')}
          icon={<ShieldAlert size={14} />}
          label="恢復權限"
          color="blue"
          loading={actionLoading === user.id}
          isFullWidth={isFullWidth}
        />
      )}
    </div>
  );
}

// 狀態標籤
function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SUSPENDED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase tracking-tight ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}

// 操作按鈕
function ActionButton({ onClick, icon, label, color, loading, isFullWidth }: any) {
  const colorStyles = {
    green: "hover:bg-emerald-600 hover:text-white border-emerald-800/60 text-emerald-400 bg-emerald-500/5",
    red: "hover:bg-rose-600 hover:text-white border-rose-800/60 text-rose-400 bg-rose-500/5",
    blue: "hover:bg-blue-600 hover:text-white border-blue-800/60 text-blue-400 bg-blue-500/5",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        flex items-center justify-center gap-1.5 px-3 py-2 border rounded-sm text-[10px] font-bold uppercase transition-all disabled:opacity-50
        ${colorStyles[color as keyof typeof colorStyles]}
        ${isFullWidth ? 'w-full py-2.5 text-xs' : ''}
      `}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}