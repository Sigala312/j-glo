// CustomerCard.tsx
import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerCard({ customer, onClick }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, borderColor: '#3b82f6', backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
      onClick={onClick} // 點擊整張卡片觸發
      className="group relative bg-slate-900/40 border border-slate-800 p-6 mb-3 flex items-center justify-between backdrop-blur-sm transition-all cursor-pointer"
    >
      {/* 左側裝飾線條 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-6">
        {/* 頭像/圖示區 */}
        <div className="w-12 h-12 bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition-colors">
          <User className="text-blue-500" size={20} />
        </div>

        {/* 資訊區 */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-blue-500/60 tracking-widest">
              ID_{customer.id.substring(0, 8).toUpperCase()}
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold tracking-tighter rounded">
              ACTIVE_NODE
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
            {customer.name}
          </h3>
        </div>
      </div>

      {/* 右側箭頭指示 */}
      <div className="flex items-center gap-4 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1">
        <span className="text-[10px] font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">VIEW_PROJECTS</span>
        <ChevronRight size={20} />
      </div>
    </motion.div>
  );
}