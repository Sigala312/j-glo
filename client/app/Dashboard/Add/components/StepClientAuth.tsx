import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function StepClientAuth({ formData, setFormData, customers, onNext, loading }: any) {
  return (
    <motion.div 
      key="step1" 
      initial={{ opacity: 0, x: 15 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -15 }} 
      className="bg-slate-900/40 border border-slate-800 p-5 sm:p-10 backdrop-blur-md rounded-sm"
    >
      <div className="flex items-center gap-3 mb-6 sm:mb-8 text-blue-500">
        <Building2 size={18} />
        <h2 className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-white">Step_01: 客戶身分識別</h2>
      </div>
      
      <div className="space-y-5 sm:space-y-6">
        <div>
          <label className="text-[9px] sm:text-[10px] text-slate-500 mb-2 block tracking-widest">SELECT_EXISTING_CLIENT</label>
          <div className="relative">
            <select 
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value, clientName: ''})}
              className="w-full bg-black/50 border border-slate-800 p-3.5 sm:p-4 outline-none focus:border-blue-500 text-xs sm:text-sm text-slate-300 rounded-sm appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-950">-- 選擇既有客戶 --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id} className="bg-slate-950">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative py-2 sm:py-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800/60"></span></div>
          <div className="relative flex justify-center text-[9px] uppercase">
            <span className="bg-[#0a0a0a] px-3 text-slate-600 tracking-widest font-mono">OR</span>
          </div>
        </div>

        <div>
          <label className="text-[9px] sm:text-[10px] text-slate-500 mb-2 block tracking-widest">NEW_CLIENT_NAME</label>
          <input 
            type="text" 
            disabled={!!formData.clientId}
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            placeholder="輸入新客戶公司全銜"
            className="w-full bg-black/50 border border-slate-800 p-3.5 sm:p-4 outline-none focus:border-blue-500 text-xs sm:text-sm text-white disabled:opacity-20 rounded-sm transition-opacity" 
          />
        </div>
      </div>

      <button 
        onClick={onNext} 
        disabled={loading || (!formData.clientId && !formData.clientName)}
        className="mt-8 sm:mt-10 w-full bg-blue-600 hover:bg-blue-500 disabled:hover:bg-slate-800 py-3.5 sm:py-4 flex items-center justify-center gap-2 transition-all text-xs font-bold tracking-[0.2em] text-white disabled:bg-slate-800/60 disabled:text-slate-500 rounded-sm"
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : 'CONFIRM_AND_CONTINUE'} 
        <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}