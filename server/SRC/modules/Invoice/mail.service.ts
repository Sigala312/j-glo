import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // 你的 Gmail 帳號
    pass: process.env.EMAIL_PASS  // 你的 Gmail 應用程式密碼
  }
});

export const sendOverdueAlert = async (adminEmail: string, overdueCount: number, details: string) => {
  const mailOptions = {
    from: `"System Monitor" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `⚠️ 系統警告：已有 ${overdueCount} 筆發票逾期未繳`,
    html: `
      <div style="font-family: sans-serif; border: 1px solid #e2e8f0; padding: 20px;">
        <h2 style="color: #e11d48;">逾期款項催收通知</h2>
        <p>管理員您好，系統偵測到以下廠商已超過繳款期限：</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b;">
          ${details}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">請登入控制面板查看詳細資訊。</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};