"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, UserX, ShieldAlert, Loader2, Mail, Building2 } from 'lucide-react';
import axios from 'axios';

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

  // 1. 取得所有人員名單
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users'); // 換成你的 Express API 位址
      setUsers(res.data);
    } catch (error) {
      console.error("無法讀取用戶名單", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. 處理狀態更新 (核准或停權)
  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    setActionLoading(userId);
    try {
      await axios.patch('http://localhost:5000/api/auth/users/status', {
        userId,
        newStatus
      });
      // 更新成功後重新抓取資料
      await fetchUsers();
    } catch (error) {
      alert("更新失敗，請檢查權限或後端連線");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 標題區 */}
      <header>
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Personnel_Registry</h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">管理系統存取權限與人員狀態</p>
      </header>

      {/* 使用者列表表格 */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-sm overflow-hidden">
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
          <tbody className="divide-y divide-slate-800/50">
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
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Building2 size={12} /> {user.department?.name || '未分配'}
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
                      {/* 如果是 PENDING，顯示核准按鈕 */}
                      {user.status === 'PENDING' && (
                        <ActionButton 
                          onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                          icon={<UserCheck size={14} />}
                          label="核准"
                          color="green"
                          loading={actionLoading === user.id}
                        />
                      )}
                      
                      {/* 如果是 ACTIVE，顯示停權按鈕 */}
                      {user.status === 'ACTIVE' && (
                        <ActionButton 
                          onClick={() => handleStatusUpdate(user.id, 'SUSPENDED')}
                          icon={<UserX size={14} />}
                          label="停權"
                          color="red"
                          loading={actionLoading === user.id}
                        />
                      )}

                      {/* 如果是 SUSPENDED，顯示恢復按鈕 */}
                      {user.status === 'SUSPENDED' && (
                        <ActionButton 
                          onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                          icon={<ShieldAlert size={14} />}
                          label="恢復權限"
                          color="blue"
                          loading={actionLoading === user.id}
                        />
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 小型輔助組件 ---

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    SUSPENDED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tighter ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}

function ActionButton({ onClick, icon, label, color, loading }: any) {
  const colorStyles = {
    green: "hover:bg-emerald-500 hover:text-white border-emerald-800 text-emerald-500",
    red: "hover:bg-rose-500 hover:text-white border-rose-800 text-rose-500",
    blue: "hover:bg-blue-500 hover:text-white border-blue-800 text-blue-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[10px] font-bold uppercase transition-all disabled:opacity-50 ${colorStyles[color as keyof typeof colorStyles]}`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}