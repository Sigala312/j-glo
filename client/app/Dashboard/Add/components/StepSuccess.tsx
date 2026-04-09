import { motion } from 'framer-motion';

export default function StepSuccess({ formData, customers, onReset }: any) {
  const displayClientName = formData.clientId 
    ? customers.find((c: any) => c.id === formData.clientId)?.name 
    : formData.clientName;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="bg-slate-900/40 border border-slate-800 p-10 backdrop-blur-md text-center"
    >
      {/* 勾勾動畫 */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              d="M20 6L9 17l-5-5"
            />
          </svg>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold tracking-[0.4em] text-white mb-2 uppercase">Success</h2>
      
      <div className="bg-black/40 border border-slate-800 p-6 text-left space-y-4 mb-10 mt-8">
        <InfoRow label="CLIENT" value={displayClientName} />
        <InfoRow label="PROJECT" value={formData.projectName} />
        <InfoRow label="NODE_ID" value={formData.projectNo} highlight />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => window.location.href = '/Dashboard'} className="border border-slate-800 py-4 text-[10px] text-slate-400">DASHBOARD</button>
        <button onClick={onReset} className="bg-blue-600 py-4 text-[10px] text-white">NEW_PROJECT</button>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
      <span className="text-[10px] text-slate-500 tracking-widest">{label}</span>
      <span className={`text-sm ${highlight ? 'text-blue-400 font-mono' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}