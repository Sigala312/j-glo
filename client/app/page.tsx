"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu } from 'lucide-react';

const TechHero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 追蹤鼠標位置，增加科技互動感
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center font-mono text-slate-400">
      
      {/* 背景格線 - 營造工程感 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 隨鼠標移動的冷色調光暈 */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
        }}
      />

      {/* 裝飾性角落數據 */}
      <div className="absolute top-8 left-8 text-[10px] tracking-[0.2em] uppercase opacity-50">
        <p>System: Active</p>
        <p>Node: 27.0.4.19</p>
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] tracking-[0.2em] uppercase opacity-50 text-right">
        <p>© 2026 Project_Archive</p>
        <p>Loc: {mousePos.x} / {mousePos.y}</p>
      </div>

      {/* 主要內容區 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 flex flex-col items-center"
      >
        <div className="mb-4 flex items-center gap-2 text-blue-500">
          <Cpu size={16} className="animate-pulse" />
          <span className="text-xs tracking-[0.4em] uppercase font-bold">Data Repository</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-12 relative">
          J-GLOBAL<span className="text-blue-600">.</span>
        </h1>

        {/* 雙按鈕組合 */}
        <div className="flex flex-col md:flex-row gap-6">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#f8fafc", color: "#0a0a0a" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-3 border border-slate-700 text-slate-200 tracking-[0.2em] uppercase text-sm transition-colors duration-300 backdrop-blur-sm"
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-3 bg-blue-600 text-white tracking-[0.2em] uppercase text-sm font-bold transition-all duration-300"
          >
            Register
          </motion.button>
        </div>
      </motion.div>

      {/* 底部掃描線特效 */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan" />

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TechHero;