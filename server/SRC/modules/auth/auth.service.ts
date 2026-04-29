import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  static async verifyGoogleAndLogin(accessToken: string) {
  try {
    // 1. 直接拿 access_token 向 Google 換取使用者資訊 (這步代替了 verifyIdToken)
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("Google Data:", googleResponse.data); // 👈 加入這行

    const { email, name, picture, sub: googleId } = googleResponse.data;

    if (!email) throw new Error("無法從 Google 取得 Email");

    // 2. 查找或建立使用者 (Prisma 邏輯)
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email,
      name: name,
      image: picture,   // 👈 Model 裡叫 image，Google 回傳叫 picture
      role: 'USER',     // 預設角色
      // 如果你有加 googleId 欄位：
      googleId: googleId
        },
      });
    }

    // 3. 簽發你自己的系統 JWT (給前端存在 localStorage)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return { token, user };
  } catch (error) {
    console.error("Google Verify Error:", error);
    throw new Error("身分驗證失敗");
  }
}

static async verifyMicrosoftAndLogin(accessToken: string) {
    try {
      // 向 Microsoft Graph API 索取資料
      const msResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const { mail, displayName, userPrincipalName } = msResponse.data;
      const email = mail || userPrincipalName; // 防止 mail 欄位為空

      if (!email) throw new Error("無法從 Microsoft 取得 Email");

      return await this.upsertUserAndSignToken({ 
        email, 
        name: displayName, 
        image: null 
      });
    } catch (error) {
      console.error("Microsoft Verify Error:", error);
      throw new Error("Microsoft 身分驗證失敗");
    }
  }

  private static async upsertUserAndSignToken(userData: { 
    email: string, 
    name: string, 
    image: string | null 
  }) {
    // 使用 upsert：如果 Email 存在就更新（或不動作），不存在就建立
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        image: userData.image,
      },
      create: {
        email: userData.email,
        name: userData.name,
        image: userData.image,
        role: 'USER', // 預設角色
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user };
  }
}
