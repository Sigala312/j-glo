"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import StepIndicator from './components/StepIndicator';
import StepClientAuth from './components/StepClientAuth';
import StepProjectInit from './components/StepProjectInit';
import StepSuccess from './components/StepSuccess';


function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT 解析失敗:", error);
    return null;
  }
}

export default function AddProjectPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    projectName: '',
    projectNo: '',
  });

  // API: 取得客戶列表
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // 🚀 1. 改用 api.get，自動帶 Token，網址簡化
        const response = await api.get('/api/customer');
        setCustomers(response.data);
      } catch (err) { console.error(err); }
    };
    fetchCustomers();
  }, []);

  // 邏輯: 處理客戶提交 (Step 1)
  const handleClientSubmit = async () => {
    setLoading(true);
    try {
      let finalClientId = formData.clientId;
      let finalClientName = "";

      if (!finalClientId) {
        // 🚀 2. 改用 api.post，不需要手動 localStorage.getItem
        const res = await api.post('/api/customer', { name: formData.clientName });
        finalClientId = res.data.id;
        finalClientName = res.data.name;
      } else {
        finalClientName = customers.find(c => c.id === finalClientId)?.name || "UNK";
      }

      // 生成代碼 (保持不變)
      const prefix = finalClientName.substring(0, 3).toUpperCase();
      const projectNo = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

      setFormData(prev => ({ ...prev, clientId: finalClientId, projectNo }));
      setStep(2);
    } catch (err) { alert("客戶處理失敗"); } 
    finally { setLoading(false); }
  };

  // 邏輯: 處理專案提交 (Step 2)
 const handleProjectSubmit = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      alert("安全性驗證失敗：找不到登入 token 快取，請重新登入。");
      setLoading(false);
      return;
    }

    // 1. 解碼 Token
    const payload = decodeJwt(token);
    console.log("當前登入 Token 的完整 Payload:", payload);

    // 💡 2. 雙重保險：不管後端是用 userId 還是 id，哪一個有值就拿哪一個！
    const currentUserId = payload?.userId || payload?.id;

    if (!currentUserId) {
      alert("安全性驗證失敗：解碼後的 Token 內找不到有效的使用者 ID。");
      setLoading(false);
      return;
    }

    // 3. 送往後端 (後端此時是完美的：creator: { connect: { id: data.creatorId } })
    await api.post('/api/projects', { 
      name: formData.projectName, 
      projectNo: formData.projectNo, 
      clientId: formData.clientId,
      creatorId: currentUserId // 🔥 這次不管是誰登入，都保證會是一串真實的 ID！
    });
    
    setStep(3);
  } catch (err: any) { 
    console.error("專案送出徹底失敗:", err);
    alert(`資料節點寫入失敗: ${err.message || '未知錯誤'}`); 
  } finally { 
    setLoading(false); 
  }
};

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepClientAuth 
            formData={formData} 
            setFormData={setFormData} 
            customers={customers} 
            onNext={handleClientSubmit} 
            loading={loading} 
          />
        )}
        {step === 2 && (
          <StepProjectInit 
            formData={formData} 
            setFormData={setFormData} 
            onBack={() => setStep(1)} 
            onNext={handleProjectSubmit} 
            loading={loading} 
          />
        )}
        {step === 3 && (
          <StepSuccess 
            formData={formData} 
            customers={customers} 
            onReset={() => {
              setFormData({ clientId: '', clientName: '', projectName: '', projectNo: '' });
              setStep(1);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}