import React from 'react';
import { motion } from 'framer-motion';
import { FilePlus2, Loader2 } from 'lucide-react';

export default function StepProjectInit({ formData, setFormData, onBack, onNext, loading }: any) {
  return (
    <motion.div 
      key="step2" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="bg-slate-900/40 border border-slate-800 p-10 backdrop-blur-md"
    >
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
        <button 
          onClick={onBack} 
          className="flex-1 border border-slate-800 py-4 text-xs font-bold tracking-[0.2em] text-slate-400"
        >
          BACK
        </button>
        <button 
          onClick={onNext} 
          disabled={loading || !formData.projectName}
          className="flex-[2] bg-blue-600 hover:bg-blue-500 py-4 text-xs font-bold tracking-[0.2em] text-white flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : 'INITIALIZE_DATA_NODE'}
        </button>
      </div>
    </motion.div>
  );
}