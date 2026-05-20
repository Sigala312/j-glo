import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  const steps = [
    { id: 1, label: 'CLIENT_AUTH', short: 'AUTH' },
    { id: 2, label: 'PROJECT_INIT', short: 'INIT' },
    { id: 3, label: 'COMPLETE', short: 'DONE' }
  ];

  return (
    <div className="flex items-center justify-between mb-8 md:mb-12 px-2 sm:px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* 步驟節點 */}
          <div className="flex flex-col items-center relative">
            <div 
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] border transition-all duration-500 z-10 ${
                current >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-slate-950 border-slate-800 text-slate-700'
              } ${current === step.id ? 'scale-105 border-blue-400' : ''}`}
            >
              {current > step.id ? (
                <CheckCircle2 size={15} />
              ) : (
                <span className="font-mono">{step.id.toString().padStart(2, '0')}</span>
              )}
            </div>
            
            {/* 響應式標籤：桌面版顯示全銜，手機版顯示縮寫 */}
            <span className={`text-[8px] mt-2.5 tracking-[0.2em] font-bold transition-colors duration-500 ${
              current >= step.id ? 'text-blue-500' : 'text-slate-800'
            }`}>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="inline sm:hidden">{step.short}</span>
            </span>
          </div>

          {/* 連接線 */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-[1px] bg-slate-800 mx-2 sm:mx-4 relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-blue-500 transition-transform duration-700 ease-in-out origin-left"
                style={{ transform: `scaleX(${current > step.id ? 1 : 0})` }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}