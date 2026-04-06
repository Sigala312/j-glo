import "./globals.css"; // 確保你的樣式檔案路徑正確
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: "Project Archive",
  description: "Tech Aesthetic Project Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-[#0a0a0a] text-white">
        <GoogleOAuthProvider clientId="303259997714-1fbt0jvi4ri2fnjhusaiur08d0upcnr0.apps.googleusercontent.com">
        {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}