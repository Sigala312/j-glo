import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  const steps = [
    { id: 1, label: 'CLIENT_AUTH' },
    { id: 2, label: 'PROJECT_INIT' },
    { id: 3, label: 'COMPLETE' }
  ];

  return (
    <div className="flex items-center justify-between mb-12 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* 步驟圓圈與標籤 */}
          <div className="flex flex-col items-center relative">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] border transition-all duration-500 z-10 ${
                current >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-slate-950 border-slate-800 text-slate-700'
              } ${current === step.id ? 'scale-110 border-blue-400' : ''}`}
            >
              {current > step.id ? (
                <CheckCircle2 size={16} />
              ) : (
                <span className="font-mono">{step.id.toString().padStart(2, '0')}</span>
              )}
            </div>
            
            <span className={`text-[8px] mt-3 tracking-[0.3em] font-bold transition-colors duration-500 ${
              current >= step.id ? 'text-blue-500' : 'text-slate-800'
            }`}>
              {step.label}
            </span>
          </div>

          {/* 步驟之間的連接線 */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-[1px] bg-slate-800 mx-4 relative overflow-hidden">
              {/* 發光的進度條動畫 */}
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