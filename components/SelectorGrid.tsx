
import React from 'react';
import { SelectableItem, Language } from '../types';
import { UI_TEXT } from '../constants';

interface SelectorGridProps {
  items: SelectableItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  title: string;
  subtitle: string;
  language: Language;
  customInputId?: string;
  customInputValue?: string;
  onCustomInputChange?: (value: string) => void;
}

export const SelectorGrid: React.FC<SelectorGridProps> = ({ 
  items, 
  selectedIds, 
  onToggle, 
  title, 
  subtitle, 
  language,
  customInputId,
  customInputValue,
  onCustomInputChange
}) => {
  const langKey = language === Language.English ? 'en' : 'zh';
  const t = UI_TEXT;

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-text-main mb-3 tracking-tight">{title}</h2>
        <p className="text-base text-stone-500 font-medium">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`
                cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col group
                ${isSelected 
                  ? 'bg-primary/5 border-primary shadow-md scale-[1.02]' 
                  : 'bg-white border-transparent ring-1 ring-stone-200 hover:ring-stone-300 hover:shadow-soft hover:scale-[1.01]'}
              `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 animate-fade-in">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                  </div>
                </div>
              )}
              
              <h3 className={`text-lg font-bold mb-2 font-serif leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                {item.label[langKey]}
              </h3>
              <p className={`text-sm leading-relaxed mt-auto transition-colors ${isSelected ? 'text-primary/70' : 'text-stone-500'}`}>
                {item.description[langKey]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Custom Input Area */}
      {customInputId && selectedIds.includes(customInputId) && (
        <div className="mt-10 max-w-2xl mx-auto animate-fade-in">
          <label className="block text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">
            {t.customApproachLabel[langKey]}
          </label>
          <textarea
            value={customInputValue || ''}
            onChange={(e) => onCustomInputChange && onCustomInputChange(e.target.value)}
            placeholder={t.customApproachPlaceholder[langKey]}
            className="w-full p-6 text-lg bg-white border-2 border-transparent ring-1 ring-stone-200 focus:ring-4 focus:ring-accent/10 focus:border-accent rounded-2xl outline-none transition-all shadow-soft text-text-main placeholder-stone-300 h-40 font-serif"
          />
        </div>
      )}
    </div>
  );
};
