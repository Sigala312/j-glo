import nodemailer from "nodemailer";

export class MailService {
  private static transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // 你的 Gmail 帳號
      pass: process.env.EMAIL_PASS, // 你的 Google 應用程式密碼
    },
  });

  static async sendApprovalEmail(toEmail: string, userName: string) {
    const mailOptions = {
      from: `"J-GLOBAL 系統中心" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "【通知】您的帳號審核已通過 - J-GLOBAL",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>你好, ${userName}!</h2>
          <p>很高興通知您，您的帳號已經通過管理員審核。</p>
          <p>您現在可以登入系統存取完整功能與資料庫。</p>
          <hr />
          <p style="font-size: 12px; color: #777;">這是系統自動發送的郵件，請勿直接回覆。</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  static async sendAdminNotification(newUser: { name: string; email: string; provider: string }) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "admin@yourcompany.com"; // 指定要接收通知的信箱

    const mailOptions = {
      from: `"系統自動通知" <${process.env.EMAIL_USER}>`,
      to: adminEmail, // 🎯 目的地信箱
      subject: `🔔 新使用者註冊通知：${newUser.name} 待審核`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
          <h2 style="color: #333;">📢 系統有新的註冊申請！</h2>
          <p>各位管理員您好，有新使用者已送出註冊申請，目前處於 <b>PENDING (待審核)</b> 狀態：</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;"><b>使用者姓名:</b></td>
              <td style="padding: 8px 0; color: #333;">${newUser.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><b>註冊電子郵件:</b></td>
              <td style="padding: 8px 0; color: #333;">${newUser.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><b>登入方式:</b></td>
              <td style="padding: 8px 0; color: #333;"><span style="background: #eee; padding: 2px 6px; border-radius: 4px;">${newUser.provider}</span></td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 14px; color: #666;">請前往管理員後台人員審核頁面進行審核或停權操作。</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/Dashboard/Admin" 
             style="display: inline-block; background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
             前往管理員後台
          </a>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[Mail] 成功寄送新註冊通知給管理員: ${adminEmail}`);
    } catch (error) {
      console.error("[Mail Error] 寄送管理員通知信失敗:", error);
      // 💡 註：通常不因為發信失敗而阻斷使用者的登入註冊流程，所以只記錄 log 不拋出錯誤
    }
  }

  static async sendLoginNotification(user: { name: string | null; email: string | null; provider: string }) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) return; // 如果沒設定管理員信箱就不發送

  // 💡 格式化為台灣時間 (YYYY-MM-DD HH:mm:ss)
  const loginTime = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });

  const mailOptions = {
    from: `"系統安全通知" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🔑 使用者登入通知：${user.name || '未知用戶'} 已上線`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; border-radius: 8px;">
        <h2 style="color: #0070f3; margin-top: 0;">🔒 系統登入安全性通知</h2>
        <p>安全日誌回報：偵測到帳號已成功登入系統，詳細資訊如下：</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #666; width: 100px;"><b>登入者姓名:</b></td>
              <td style="padding: 6px 0; color: #111; font-weight: bold;">${user.name ?? "未提供姓名"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;"><b>電子郵件:</b></td>
              <td style="padding: 6px 0; color: #111;">${user.email ?? "未提供 Email"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;"><b>登入方式:</b></td>
              <td style="padding: 6px 0; color: #111;"><span style="background: #e2f0fd; color: #0070f3; padding: 2px 6px; border-radius: 4px; font-size: 13px;">${user.provider}</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;"><b>登入時間:</b></td>
              <td style="padding: 6px 0; color: #d32f2f; font-weight: bold;">${loginTime} (台灣時間)</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 13px; color: #666; margin-bottom: 0;">※ 本信件由系統安全模組自動發送，若非本人或已知團隊操作，請立即前往後台檢查該帳號狀態。</p>
      </div>
    `,
  };

  try {
    await this.transporter.sendMail(mailOptions);
    console.log(`[Mail] 成功寄送登入通知給管理員: ${adminEmail}`);
  } catch (error) {
    console.error("[Mail Error] 寄送管理員登入通知信失敗:", error);
  }
}
}