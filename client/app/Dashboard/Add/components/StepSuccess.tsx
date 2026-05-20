import { motion } from 'framer-motion';

export default function StepSuccess({ formData, customers, onReset }: any) {
  const displayClientName = formData.clientId 
    ? customers.find((c: any) => c.id === formData.clientId)?.name 
    : formData.clientName;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="bg-slate-900/40 border border-slate-800 p-6 sm:p-10 backdrop-blur-md text-center rounded-sm"
    >
      {/* 簽章成功動畫 */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]"
        >
          <svg width="32" height="32" sm-width="40" sm-height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              d="M20 6L9 17l-5-5"
            />
          </svg>
        </motion.div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold tracking-[0.4em] text-white mb-2 uppercase font-mono">Success</h2>
      
      {/* 報表清單區塊 */}
      <div className="bg-black/50 border border-slate-800/80 p-4 sm:p-6 text-left space-y-3.5 sm:space-y-4 mb-8 sm:mb-10 mt-6 rounded-sm">
        <InfoRow label="CLIENT" value={displayClientName || 'UNKNOWN'} />
        <InfoRow label="PROJECT" value={formData.projectName || 'UNNAMED'} />
        <InfoRow label="NODE_ID" value={formData.projectNo} highlight />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button 
          onClick={() => window.location.href = '/Dashboard'} 
          className="border border-slate-800 py-3.5 text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/20 transition-colors rounded-sm tracking-wider"
        >
          DASHBOARD
        </button>
        <button 
          onClick={onReset} 
          className="bg-blue-600 hover:bg-blue-500 py-3.5 text-[10px] text-white font-bold transition-colors rounded-sm tracking-wider"
        >
          NEW_PROJECT
        </button>
      </div>
    </motion.div>
  );
}

// 🔧 防禦性防溢出元件 (RWD Line)
function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800/40 pb-2.5 sm:pb-3 gap-1 sm:gap-4 min-w-0">
      <span className="text-[9px] sm:text-[10px] text-slate-600 tracking-widest font-mono shrink-0 uppercase">{label}</span>
      <span className={`text-xs sm:text-sm font-medium truncate max-w-full ${
        highlight ? 'text-blue-400 font-mono tracking-wide' : 'text-slate-300'
      }`}>
        {value}
      </span>
    </div>
  );
}