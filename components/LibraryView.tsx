
import React from 'react';
import { LibraryItem, Language } from '../types';
import { UI_TEXT } from '../constants';

interface LibraryViewProps {
  library: LibraryItem[];
  language: Language;
  onOpenItem: (item: LibraryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ library, language, onOpenItem, onDeleteItem }) => {
  const t = UI_TEXT;
  const langKey = language === Language.English ? 'en' : 'zh';

  if (library.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-stone-300">library_books</span>
        </div>
        <h3 className="text-xl font-bold text-stone-600 mb-2">{t.emptyLibrary[langKey]}</h3>
        <p className="text-stone-400 max-w-xs">{language === Language.English ? "Start a new analysis to populate your personal archives." : "開始新的分析以充實您的個人檔案。"}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {library.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((item) => (
          <div key={item.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-soft hover:shadow-md transition-all flex flex-col group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-widest">
                  {item.config.studyType}
                </span>
                <span className="text-[10px] text-stone-400 tabular-nums">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-serif text-xl font-bold text-text-main mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {item.title || item.config.passage || "Untitled Analysis"}
              </h4>
              <p className="text-sm text-stone-500 line-clamp-3 mb-4 leading-relaxed italic">
                {item.config.topic || item.config.passage}
              </p>
            </div>
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-between gap-3">
              <button 
                onClick={() => onOpenItem(item)}
                className="flex-1 bg-white border border-stone-200 py-2 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-100 hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                {t.open[langKey]}
              </button>
              <button 
                onClick={() => onDeleteItem(item.id)}
                className="p-2 bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                title={t.delete[langKey]}
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
