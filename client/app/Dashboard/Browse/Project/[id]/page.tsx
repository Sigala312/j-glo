"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Receipt, Loader2, CheckCircle2, Save, Upload, 
  FileSpreadsheet, Paperclip, MessageSquare, Eye 
} from 'lucide-react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface PORemark {
  id: string;
  content: string;
  category?: string;
}

interface PO {
  id: string;
  poNumber: string;
  item: string;
  amount: number;
  vendor: string;
  attachments?: Attachment[]; // 👈 支援附件顯示
  remarks?: PORemark[];
}

export default function PurchaseOrderSection({ projectId: propProjectId }: { projectId: string }) {
  const params = useParams();
  const router = useRouter();

  const projectId = propProjectId || (params.id as string);
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedPoForRemark, setSelectedPoForRemark] = useState<PO | null>(null);
const [remarkContent, setRemarkContent] = useState("");

  const [formData, setFormData] = useState({
    item: '',
    vendor: '',
    amount: 0
  });

  useEffect(() => {
    if (projectId) fetchPOs();
  }, [projectId]);

  const fetchPOs = async () => {
    try {
      const token = localStorage.getItem('token');
      // 注意：後端 API 的 include: { attachments: true } 必須開啟
      const res = await axios.get(`http://localhost:5000/api/purchaseOrder?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📍 API 回傳的 PO 原始資料:", res.data);
      
      setPos(res.data);
    } catch (err) {
      console.error("讀取採購單失敗", err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddRemark = async () => {
  if (!remarkContent.trim() || !selectedPoForRemark) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.post(`http://localhost:5000/api/Remark`, {
      purchaseOrderId: selectedPoForRemark.id,
      content: remarkContent,
      category: "GENERAL"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setRemarkContent("");
    fetchPOs(); // 重新整理列表，Icon 就會從 編輯 變成 眼睛
    // 如果你想保留 Modal，就不要關閉；或者關閉：setSelectedPoForRemark(null);
  } catch (err) {
    alert("備註儲存失敗");
  }
};

  // 🚀 上傳附件邏輯
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, poId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(poId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetId", poId);
    formData.append("targetType", "PURCHASE_ORDER");

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/attachments/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      fetchPOs(); // 重新抓取資料以顯示新附件
    } catch (err) {
      alert("檔案上傳失敗");
    } finally {
      setUploadingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return alert("CRITICAL_ERROR: Project_ID_Missing");
    try {
      const token = localStorage.getItem('token');
      const payload = {
        item: formData.item,
        amount: Number(formData.amount),
        vendor: formData.vendor,
        projectId: projectId
      };

      await axios.post(`http://localhost:5000/api/purchaseOrder`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddForm(false);
      setFormData({ item: '', vendor: '', amount: 0 });
      fetchPOs();
    } catch (err) {
      alert("新增失敗");
    }
  };

  const handleUpdateStatus = async (newStatus: "FILLED" | "COMPLETED") => {
    if (pos.length === 0) return alert("目前尚無採購單資料。");
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/projects/${projectId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`專案狀態已更新為：${newStatus === 'FILLED' ? '已填寫' : '已完成'}`);
      if (newStatus === 'COMPLETED') router.push('/Dashboard/Browse');
    } catch (err: any) {
      alert(err.response?.data?.error || "狀態更新失敗");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-6 border-t border-slate-800 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
          <Receipt size={14} /> Purchase_Orders
        </h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="text-blue-500 hover:text-white text-[10px] flex items-center gap-1 border border-blue-500/30 px-2 py-1 hover:bg-blue-600 transition-all"
        >
          <Plus size={12} /> ADD_PO
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Loader2 className="animate-spin text-slate-700 mx-auto" size={20} />
        ) : pos.length > 0 ? (
          pos.map(po => (
            <div key={po.id} className="bg-slate-900/60 border border-slate-800 p-4 group rounded-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-mono text-slate-500">{po.poNumber}</p>
                  <p className="text-sm text-white font-bold">{po.item}</p>
                  <p className="text-[10px] text-blue-400/70">{po.vendor}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <button 
      onClick={() => router.push(`/Dashboard/Browse/purchase-invoices/${po.id}`)}
      className="transition-colors p-1.5 rounded-sm hover:bg-slate-800 group/inv"
      title="管理發票"
    >
      <Receipt size={14} className="text-blue-400 group-hover/inv:text-white" />
    </button>
<div className="flex items-center gap-3">
      {/* 🚀 備註 Icon 邏輯 */}
      <button 
         onClick={() => setSelectedPoForRemark(po)}
        className="transition-colors p-1 rounded-sm hover:bg-slate-800"
      >
        {po.remarks && po.remarks.length > 0 ? (
          <div className="flex items-center gap-1 group/eye">
             <span className="text-[8px] text-emerald-500 font-mono opacity-0 group-hover/eye:opacity-100 transition-opacity">VIEW_NOTES</span>
             <Eye size={14} className="text-emerald-500" />
          </div>
        ) : (
          <MessageSquare size={14} className="text-slate-500 hover:text-blue-400" />
        )}
      </button>

      <p className="text-sm text-emerald-400 font-mono">${po.amount.toLocaleString()}</p>
    </div>                  
                  {/* 📎 上傳按鈕 */}
                  <label className="cursor-pointer bg-slate-800 p-1.5 hover:bg-blue-600 transition-colors rounded-sm">
                    {uploadingId === po.id ? (
                      <Loader2 size={12} className="animate-spin text-white" />
                    ) : (
                      <Upload size={12} className="text-slate-400 group-hover:text-white" />
                    )}
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, po.id)} disabled={!!uploadingId} />
                  </label>
                </div>
              </div>

              {/* 📂 顯示已上傳檔案 */}
              {po.attachments && po.attachments.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/50 flex flex-wrap gap-2">
                  {po.attachments.map(file => (
                    <a 
                      key={file.id}
                      href={`http://localhost:5000${file.fileUrl}`}
                      target="_blank"
                      className="flex items-center gap-1.5 bg-black/40 border border-slate-800 px-2 py-1 rounded-sm text-[10px] text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-all"
                    >
                      {file.fileType === 'EXCEL' ? <FileSpreadsheet size={12} className="text-emerald-500" /> : <Paperclip size={12} />}
                      {file.fileName}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-[10px] text-slate-600 text-center py-4 border border-dashed border-slate-800">NO_PO_RECORDED</p>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-blue-500/50 p-8 w-full max-w-md shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tighter italic uppercase">New_Purchase_Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">品名</label>
                <input 
                  required
                  className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                  onChange={e => setFormData({...formData, item: e.target.value})}
                />
              </div>
              
              {/* 💡 這裡將金額調回全寬 */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">金額</label>
                <input 
                  type="number" required
                  className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">供應商</label>
                <input 
                  required
                  className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none focus:border-blue-500"
                  onChange={e => setFormData({...formData, vendor: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-[10px] text-slate-500 hover:text-white">CANCEL</button>
                <button type="submit" className="flex-1 bg-blue-600 py-2 text-[10px] font-bold text-white hover:bg-blue-500">CONFIRM_GENERATE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 狀態按鈕區 */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-3 mt-10 border-t border-slate-800/50 pt-8 mb-6">
          <button
            onClick={() => handleUpdateStatus('FILLED')}
            disabled={pos.length === 0 || isUpdating}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-[.2em] transition-all border
              ${pos.length === 0 || isUpdating
                ? 'border-slate-800 text-slate-700 cursor-not-allowed' 
                : 'border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95'}`}
          >
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
         暫存資料
          </button>

          <button
            onClick={() => handleUpdateStatus('COMPLETED')}
            disabled={pos.length === 0 || isUpdating}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-[.2em] transition-all
              ${pos.length === 0 || isUpdating
                ? 'bg-slate-800/50 text-slate-700 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95'}`}
          >
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            完成
          </button>
        </div>
      )}


      {selectedPoForRemark && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4">
    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h4 className="text-xs font-bold text-white tracking-widest uppercase">
          REMARKS // {selectedPoForRemark.poNumber}
        </h4>
        <button onClick={() => setSelectedPoForRemark(null)} className="text-slate-500 hover:text-white">✕</button>
      </div>

      {/* 歷史備註清單 */}
      <div className="p-4 max-h-60 overflow-y-auto space-y-3 bg-black/20">
        {selectedPoForRemark.remarks && selectedPoForRemark.remarks.length > 0 ? (
          selectedPoForRemark.remarks.map((r) => (
            <div key={r.id} className="border-l-2 border-blue-600 bg-slate-800/40 p-3">
              <p className="text-sm text-slate-200 leading-relaxed">{r.content}</p>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-slate-600 italic text-center py-4">NO_HISTORY_REMARKS</p>
        )}
      </div>

      {/* 新增輸入框 */}
      <div className="p-4 border-t border-slate-800">
        <textarea
          className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-blue-500 h-24 resize-none"
          placeholder="輸入新的備註事項..."
          value={remarkContent}
          onChange={(e) => setRemarkContent(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button 
            onClick={handleAddRemark}
            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-2 rounded-sm"
          >
            SAVE_REMARK
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>

    
  
  );
}