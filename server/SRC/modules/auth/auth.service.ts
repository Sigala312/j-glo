import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  static async verifyGoogleAndLogin(idToken: string) {
    // 1. 向 Google 驗證這個 Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Google 驗證失敗");

    const { email, name, picture } = payload;

    // 2. 查找或建立使用者 (Upsert 邏輯)
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "",
          image: picture || "",
          role: "USER", // 預設為一般員工
        },
      });
    }

    // 3. 簽發你專案專用的 JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return { user, token };
  }
}
