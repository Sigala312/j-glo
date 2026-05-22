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
}