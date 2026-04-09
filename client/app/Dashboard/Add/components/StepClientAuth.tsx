import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function StepClientAuth({ formData, setFormData, customers, onNext, loading }: any) {
  return (
    <motion.div 
      key="step1" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="bg-slate-900/40 border border-slate-800 p-10 backdrop-blur-md"
    >
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
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
        onClick={onNext} 
        disabled={loading || (!formData.clientId && !formData.clientName)}
        className="mt-10 w-full bg-blue-600 hover:bg-blue-500 py-4 flex items-center justify-center gap-2 transition-all text-xs font-bold tracking-[0.2em] text-white disabled:bg-slate-800"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'CONFIRM_AND_CONTINUE'} <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}