import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from 'axios';
import bcrypt from "bcrypt";
import { Status } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export class AuthService {
  // ... verifyGoogle 和 verifyMicrosoft 也要改，下面以這兩個為例

  static async verifyGoogleAndLogin(accessToken: string, extraData?: { name: string, departmentId: string }) {
    try {
      const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const { email, name: googleName, picture, sub: googleId } = googleResponse.data;

      // 優先使用使用者在第一步填寫的姓名，沒有才用 Google 的
      return await this.upsertUserAndSignToken({
        email,
        name: extraData?.name || googleName, 
        image: picture,
        departmentId: extraData?.departmentId,
        provider: 'GOOGLE'
      });
    } catch (error) {
      console.error(error);
      throw new Error("Google 驗證失敗");
    }
  }

  static async verifyMicrosoftAndLogin(accessToken: string, extraData?: { name: string, departmentId: string }) {
  try {
    // 1. 向 Microsoft Graph API 請求使用者資訊
    const msResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { mail, displayName, userPrincipalName, id: msId } = msResponse.data;
    const email = mail || userPrincipalName;

    if (!email) throw new Error("無法從 Microsoft 取得 Email");

    // 2. 呼叫我們封裝好的通用 upsert 邏輯
    return await this.upsertUserAndSignToken({
      email,
      name: extraData?.name || displayName, // 優先使用第一步填寫的姓名
      image: null, // Microsoft Graph 取得頭像需要額外請求，暫設為 null
      departmentId: extraData?.departmentId,
      provider: 'MICROSOFT'
    });
  } catch (error) {
    console.error("Microsoft Verify Error:", error);
    throw new Error("Microsoft 身分驗證失敗");
  }
}

static async registerLocal(data: { email: string, password: string, name: string, departmentId: string }) {
    // 1. 檢查 Email 是否已被使用
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error("此 Email 已被註冊");

    // 2. 雜湊密碼
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. 建立使用者 (狀態同樣是 PENDING)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword, // Schema 記得要有這個欄位
        name: data.name,
        departmentId: data.departmentId,
        provider: 'LOCAL',
        role: 'USER',
        status: 'PENDING',
      },
    });

    // 4. 簽發 Token (你可以調用之前的 upsertUserAndSignToken 邏輯，或直接在這裡簽)
    return this.signToken(user); 
  }

  // 🚀 訪客登入
  static async loginLocal(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new Error("帳號或密碼錯誤");

    // 比對密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("帳號或密碼錯誤");

    return this.signToken(user);
  }

  // 抽離出統一的簽發 Token 邏輯
  private static signToken(user: any) {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    return { token, user };
  }

  // 修改核心的 upsert 邏輯
  private static async upsertUserAndSignToken(userData: { 
    email: string, 
    name: string, 
    image: string | null,
    departmentId?: string| undefined,
    provider: 'GOOGLE' | 'MICROSOFT' | 'LOCAL' // 👈 新增
  }) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        // 如果是老用戶登入，我們通常不隨便改他的部門，除非你想強制更新
        image: userData.image,
      },
      create: {
        email: userData.email,
        name: userData.name,
        image: userData.image,
departmentId: userData.departmentId ?? null,
        provider: userData.provider,
        role: 'USER',
        status: 'PENDING', // 🚀 重要：新帳號一律待審核
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, status: user.status }, // 把 status 也簽進去
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user };
  }

  
}


export class AdminService {
  // 取得所有人員列表 (包含部門資訊)
  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        provider: true,
        createdAt: true,
        department: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 修改使用者狀態 (審核通過、停權、恢復)
  static async updateUserStatus(userId: string, newStatus: Status) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    });
  }
}

// export class AuthService {
//   static async verifyGoogleAndLogin(accessToken: string) {
//   try {
//     // 1. 直接拿 access_token 向 Google 換取使用者資訊 (這步代替了 verifyIdToken)
//     const googleResponse = await axios.get(
//       `https://www.googleapis.com/oauth2/v3/userinfo`,
//       { headers: { Authorization: `Bearer ${accessToken}` } }
//     );

//     console.log("Google Data:", googleResponse.data); // 👈 加入這行

//     const { email, name, picture, sub: googleId } = googleResponse.data;

//     if (!email) throw new Error("無法從 Google 取得 Email");

//     // 2. 查找或建立使用者 (Prisma 邏輯)
//     let user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email: email,
//       name: name,
//       image: picture,   // 👈 Model 裡叫 image，Google 回傳叫 picture
//       role: 'USER',     // 預設角色
//       // 如果你有加 googleId 欄位：
//       googleId: googleId
//         },
//       });
//     }

//     // 3. 簽發你自己的系統 JWT (給前端存在 localStorage)
//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET!,
//       { expiresIn: '7d' }
//     );

//     return { token, user };
//   } catch (error) {
//     console.error("Google Verify Error:", error);
//     throw new Error("身分驗證失敗");
//   }
// }

// static async verifyMicrosoftAndLogin(accessToken: string) {
//     try {
//       // 向 Microsoft Graph API 索取資料
//       const msResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
//         headers: { Authorization: `Bearer ${accessToken}` }
//       });

//       const { mail, displayName, userPrincipalName } = msResponse.data;
//       const email = mail || userPrincipalName; // 防止 mail 欄位為空

//       if (!email) throw new Error("無法從 Microsoft 取得 Email");

//       return await this.upsertUserAndSignToken({ 
//         email, 
//         name: displayName, 
//         image: null 
//       });
//     } catch (error) {
//       console.error("Microsoft Verify Error:", error);
//       throw new Error("Microsoft 身分驗證失敗");
//     }
//   }

//   private static async upsertUserAndSignToken(userData: { 
//     email: string, 
//     name: string, 
//     image: string | null 
//   }) {
//     // 使用 upsert：如果 Email 存在就更新（或不動作），不存在就建立
//     const user = await prisma.user.upsert({
//       where: { email: userData.email },
//       update: {
//         name: userData.name,
//         image: userData.image,
//       },
//       create: {
//         email: userData.email,
//         name: userData.name,
//         image: userData.image,
//         role: 'USER', // 預設角色
//       },
//     });

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     return { token, user };
//   }
// }
