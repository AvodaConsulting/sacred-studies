
import React from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  language: Language;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep, totalSteps, onStepClick, language }) => {
  const t = UI_TEXT;
  const langKey = language === Language.English ? 'en' : 'zh';

  const steps = [
    { id: 1, label: t.stepConfigure[langKey] },
    { id: 2, label: t.stepApproaches[langKey] },
    { id: 3, label: t.stepTraditions[langKey] },
    { id: 4, label: t.stepGenerate[langKey] }
  ];

  return (
    <div className="relative flex justify-between items-center mb-16 mt-4 max-w-2xl mx-auto">
      {/* Background Line */}
      <div className="absolute top-5 left-0 w-full h-0.5 bg-stone-200 -z-10"></div>
      
      {steps.map((step) => {
        const isActive = step.id <= currentStep;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
            <button
              onClick={() => step.id < currentStep ? onStepClick(step.id) : null}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ring-4 ring-[#f8f7f4] transition-all duration-300 shadow-md
                ${isCurrent ? 'bg-accent text-white' : isActive ? 'bg-primary text-white cursor-pointer hover:bg-primary-dark' : 'bg-[#e5e5e0] text-stone-500 cursor-default'}
              `}
            >
              {step.id}
            </button>
            <span className={`text-xs font-bold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-[#5c5c5c]' : 'text-stone-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
