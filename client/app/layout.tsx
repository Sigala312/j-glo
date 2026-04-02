import "./globals.css"; // 確保你的樣式檔案路徑正確

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
        {children}
      </body>
    </html>
  );
}