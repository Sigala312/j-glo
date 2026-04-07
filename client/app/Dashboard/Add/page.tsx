"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, FilePlus2, ArrowRight, ChevronLeft, CheckCircle2, Database, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AddProjectPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  
  // 表單狀態
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '', // 用於新增客戶
    projectName: '',
    projectNo: '', // 自動生成
  });

  // 1. Fetch 既有客戶列表
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/customer',
          { 
          headers: { 
            Authorization: `Bearer ${token}` // 👈 關鍵：必須符合 Bearer 格式
          } 
        }
        );
        setCustomers(response.data);
      } catch (err) {
        console.error("無法取得客戶列表", err);
      }
    };
    fetchCustomers();
  }, []);

  // 2. 自動生成流水號邏輯 (當選定客戶或輸入名稱後觸發)
  const generateProjectCode = (name: string) => {
    const prefix = name.substring(0, 3).toUpperCase() || "GEN";
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // 模擬後五碼，正式環境應由後端回傳最後一號
    return `${prefix}-${randomNumber}`;
  };

  // 3. 處理客戶提交 (Step 1)
  const handleClientSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      let finalClientId = formData.clientId;
      let finalClientName = "";

      if (!finalClientId) {
        // 如果是新客戶，先 POST 到 API
        const res = await axios.post('http://localhost:5000/api/customer', { name: formData.clientName },
          { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
        );
        finalClientId = res.data.id;
        finalClientName = res.data.name;
      } else {
        finalClientName = customers.find(c => c.id === finalClientId)?.name || "UNK";
      }

      // 生成該客戶的專案代碼並跳下一步
      setFormData(prev => ({ 
        ...prev, 
        clientId: finalClientId, 
        projectNo: generateProjectCode(finalClientName) 
      }));
      setStep(2);
    } catch (err) {
      alert("客戶處理失敗，請檢查後端");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/projects', {
      name: formData.projectName,
      projectNo: formData.projectNo,
      clientId: formData.clientId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setStep(3); // 成功後跳到完成頁面
  } catch (err) {
    alert("專案初始化失敗");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto">
      {/* 進度條 (同前) */}
      <div className="flex items-center justify-between mb-12 px-4">
        <StepIndicator current={step} target={1} label="CLIENT_AUTH" />
        <div className="flex-1 h-[1px] bg-slate-800 mx-4" />
        <StepIndicator current={step} target={2} label="PROJECT_INIT" />
        <div className="flex-1 h-[1px] bg-slate-800 mx-4" />
        <StepIndicator current={step} target={3} label="COMPLETE" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-slate-900/40 border border-slate-800 p-10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-8 text-blue-500">
              <Building2 size={20} />
              <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-white">Step_01: 客戶身分識別</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-slate-500 mb-2 block tracking-widest">SELECT_EXISTING_CLIENT</label>
                <select 
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value, clientName: ''})}
                  className="w-full bg-black/40 border border-slate-800 p-4 outline-none focus:border-blue-500 text-sm text-slate-300"
                >
                  <option value="">-- 選擇既有客戶 --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#0a0a0a] px-4 text-slate-600 tracking-widest">OR</span></div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 mb-2 block tracking-widest">NEW_CLIENT_NAME</label>
                <input 
                  type="text" 
                  disabled={!!formData.clientId}
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="輸入新客戶公司全銜"
                  className="w-full bg-black/40 border border-slate-800 p-4 outline-none focus:border-blue-500 text-sm text-white disabled:opacity-30" 
                />
              </div>
            </div>

            <button 
              onClick={handleClientSubmit} 
              disabled={loading || (!formData.clientId && !formData.clientName)}
              className="mt-10 w-full bg-blue-600 hover:bg-blue-500 py-4 flex items-center justify-center gap-2 transition-all text-xs font-bold tracking-[0.2em] text-white disabled:bg-slate-800"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'CONFIRM_AND_CONTINUE'} <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-slate-900/40 border border-slate-800 p-10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-8 text-blue-500">
              <FilePlus2 size={20} />
              <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-white">Step_02: 專案節點初始化</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-slate-500 mb-2 block tracking-widest">AUTO_GENERATED_CODE</label>
                <div className="w-full bg-blue-900/10 border border-blue-900/30 p-4 text-blue-400 font-mono text-sm tracking-widest">
                  {formData.projectNo}
                </div>
                <p className="text-[8px] text-slate-600 mt-2">系統依據客戶代碼與序號自動生成，不可更改。</p>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-2 block tracking-widest">PROJECT_NAME</label>
                <input 
                  type="text" 
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  placeholder="請輸入專案名稱"
                  className="w-full bg-black/40 border border-slate-800 p-4 outline-none focus:border-blue-500 text-sm text-white" 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setStep(1)} className="flex-1 border border-slate-800 py-4 text-xs font-bold tracking-[0.2em]">BACK</button>
              <button onClick={handleProjectSubmit} 
              className="flex-[2] bg-blue-600 py-4 text-xs font-bold tracking-[0.2em] text-white">INITIALIZE_DATA_NODE</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
  <motion.div 
    key="step3" 
    initial={{ opacity: 0, scale: 0.95 }} 
    animate={{ opacity: 1, scale: 1 }} 
    className="bg-slate-900/40 border border-slate-800 p-10 backdrop-blur-md text-center"
  >
    {/* 1. 動態勾勾動畫 */}
    <div className="flex justify-center mb-8">
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]"
        >
          <motion.svg 
            width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              d="M20 6L9 17l-5-5"
            />
          </motion.svg>
        </motion.div>
      </div>
    </div>

    <h2 className="text-xl font-bold tracking-[0.4em] uppercase text-white mb-2">Initialize_Success</h2>
    <p className="text-[10px] text-slate-500 tracking-widest uppercase mb-10">專案節點已成功寫入系統數據庫</p>

    {/* 2. 摘要摘要卡片 */}
    <div className="bg-black/40 border border-slate-800 p-6 text-left space-y-4 mb-10">
      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
        <span className="text-[10px] text-slate-500 tracking-widest font-bold">CLIENT_NAME</span>
        <span className="text-sm text-slate-200">{formData.clientId ? customers.find(c => c.id === formData.clientId)?.name : formData.clientName}</span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
        <span className="text-[10px] text-slate-500 tracking-widest font-bold">PROJECT_NAME</span>
        <span className="text-sm text-slate-200">{formData.projectName}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-blue-500/70 tracking-widest font-bold">DATA_NODE_ID</span>
        <span className="text-sm font-mono text-blue-400 tracking-widest">{formData.projectNo}</span>
      </div>
    </div>

    {/* 3. 功能按鈕 */}
    <div className="grid grid-cols-2 gap-4">
      <button 
        onClick={() => window.location.href = '/Dashboard'} 
        className="border border-slate-800 py-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:bg-slate-800 transition-colors"
      >
        RETURN_TO_DASHBOARD
      </button>
      <button 
        onClick={() => {
          setFormData({ clientId: '', clientName: '', projectName: '', projectNo: '' });
          setStep(1);
        }} 
        className="bg-blue-600 py-4 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-blue-500 transition-all"
      >
        CREATE_NEW_PROJECT
      </button>
    </div>
  </motion.div>
)}
      </AnimatePresence>
    </div>
  );
}

// StepIndicator 元件保持不變...

// --- 輔助元件 ---
function StepIndicator({ current, target, label }: { current: number, target: number, label: string }) {
  const active = current >= target;
  const highlight = current === target;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] border transition-all duration-500 ${
        active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-800 text-slate-700'
      } ${highlight ? 'shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110' : ''}`}>
        {active && current > target ? <CheckCircle2 size={14} /> : target}
      </div>
      <span className={`text-[8px] mt-2 tracking-[0.3em] font-bold ${active ? 'text-blue-500' : 'text-slate-800'}`}>
        {label}
      </span>
    </div>
  );
}