import nodemailer from "nodemailer";

export class MailService {
  private static transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER, // 你的 Gmail 帳號
      pass: process.env.MAIL_PASS, // 你的 Google 應用程式密碼
    },
  });

  static async sendApprovalEmail(toEmail: string, userName: string) {
    const mailOptions = {
      from: `"J-GLOBAL 系統中心" <${process.env.MAIL_USER}>`,
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
}