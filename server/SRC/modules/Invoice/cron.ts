import cron from 'node-cron';
import { InvoiceService } from './Invoice.service.js';
import { sendOverdueAlert } from './mail.service.js';

export const initCronJobs = () => {
  // 每天早上 09:00 執行 (秒 分 時 日 月 週)
  cron.schedule('0 0 9 * * *', async () => {
    console.log('--- 🚀 執行每日逾期發票檢查 ---');
    
    try {
      const overdueInvoices = await InvoiceService.findOverdue();
      
      if (overdueInvoices.length > 0) {
        // 整理發票清單文字
        const details = overdueInvoices.map(inv => 
          `<li>廠商：${inv.order?.project?.client?.name} | 金額：$${inv.amount} | 期限：${inv.dueDate?.toLocaleDateString() || '未設定期限'}</li>`
        ).join('');

        // 寄信給管理員 (可以寫死或從 .env 讀取)
        await sendOverdueAlert(process.env.ADMIN_EMAIL!, overdueInvoices.length, `<ul>${details}</ul>`);
        
        console.log(`✅ 已寄送 ${overdueInvoices.length} 筆逾期通知至管理員信箱`);
      } else {
        console.log('👌 今日無逾期發票');
      }
    } catch (error) {
      console.error('❌ 定時任務執行失敗:', error);
    }
  });
};