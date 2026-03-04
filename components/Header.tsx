
import React from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onToggleLanguage, onLogout }) => {
  const langKey = language === Language.English ? 'en' : 'zh';
  const t = UI_TEXT;

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-background-light sticky top-0 z-10">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-text-main tracking-tight">{t.newAnalysis[langKey]}</h2>
        <p className="text-sm text-stone-500 font-medium">{t.subtitle[langKey]}</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleLanguage}
          className="flex items-center justify-center h-10 px-4 rounded-full border border-stone-300 bg-white text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <span className={language === Language.English ? "text-primary font-bold" : "text-stone-400"}>EN</span>
          <span className="mx-2 text-stone-200">|</span>
          <span className={language === Language.TraditionalChinese ? "text-primary font-bold" : "text-stone-400"}>繁中</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center justify-center h-10 w-10 rounded-full border border-stone-300 bg-white text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
          title="Clear API Key"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </header>
  );
};
