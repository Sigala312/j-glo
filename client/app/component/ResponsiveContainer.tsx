"use client";

import React from 'react';

interface ResponsiveContainerProps {
  title: string;              // 頁面的大標題
  subtitle?: string;          // 頁面的小副標題
  desktopView: React.ReactNode; // 💻 電腦版要放的內容
  mobileView: React.ReactNode;  // 📱 手機版要放的內容
}

export default function ResponsiveContainer({
  title,
  subtitle,
  desktopView,
  mobileView
}: ResponsiveContainerProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 text-mono">
      {/* 通用的頁面標題區，每個頁面進來都會自動生成一樣的帥氣風格 */}
      <header>
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">
            {subtitle}
          </p>
        )}
      </header>

      {/* 核心分流邏輯：只要套用這個模板，以後你都不用在各頁面寫 hidden 或 block 了 */}
      
      {/* 💻 電腦版：平板以上顯示，手機隱藏 */}
      <div className="hidden md:block">
        {desktopView}
      </div>

      {/* 📱 手機版：手機顯示，平板以上隱藏 */}
      <div className="block md:hidden">
        {mobileView}
      </div>
    </div>
  );
}