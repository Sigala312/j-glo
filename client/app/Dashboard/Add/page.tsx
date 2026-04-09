"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import StepIndicator from './components/StepIndicator';
import StepClientAuth from './components/StepClientAuth';
import StepProjectInit from './components/StepProjectInit';
import StepSuccess from './components/StepSuccess';

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
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/customer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(response.data);
      } catch (err) { console.error(err); }
    };
    fetchCustomers();
  }, []);

  // 邏輯: 處理客戶提交 (Step 1)
  const handleClientSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let finalClientId = formData.clientId;
      let finalClientName = "";

      if (!finalClientId) {
        const res = await axios.post('http://localhost:5000/api/customer', 
          { name: formData.clientName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalClientId = res.data.id;
        finalClientName = res.data.name;
      } else {
        finalClientName = customers.find(c => c.id === finalClientId)?.name || "UNK";
      }

      // 生成代碼
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
      await axios.post('http://localhost:5000/api/projects', 
        { name: formData.projectName, projectNo: formData.projectNo, clientId: formData.clientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(3);
    } catch (err) { alert("專案初始化失敗"); } 
    finally { setLoading(false); }
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