
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Language, ActivityLog } from '../types';
import { UI_TEXT } from '../constants';
import { ChatSession } from './ChatSession';

interface ResultDisplayProps {
  content: string;
  isGenerating: boolean;
  language: Language;
  logs: ActivityLog[];
  sources?: { uri: string; title: string }[];
  onSave?: () => void;
  isSaved?: boolean;
  apiKey: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, isGenerating, language, logs, sources, onSave, isSaved, apiKey }) => {
  const [showChatSession, setShowChatSession] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const langKey = language === Language.English ? 'en' : 'zh';
  const t = UI_TEXT;

  useEffect(() => {
    if (isGenerating && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isGenerating]);

  const handleDownloadWord = () => {
    if (!contentRef.current) return;
    const html = `<html><head><meta charset='utf-8'><style>body{font-family:'Times New Roman',serif;padding:40px;line-height:1.6;}h1{text-align:center;color:#4A5D23;}h2{border-bottom:2px solid #4A5D23;color:#4A5D23;margin-top:40px;}h3{color:#4A5D23;margin-top:30px;}.bib-entry{padding-left:2em;text-indent:-2em;margin-bottom:1em;}p{margin-bottom:1.5em;text-align:justify;}</style></head><body>${contentRef.current.innerHTML}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SacredStudy_Manuscript_${new Date().getTime()}.doc`;
    link.click();
  };

  if (isGenerating) {
    return (
      <div className="bg-[#121212] rounded-2xl border border-white/10 shadow-3xl overflow-hidden font-mono text-[13px] max-w-4xl mx-auto my-12 animate-fade-in ring-1 ring-white/5">
        <div className="bg-white/5 p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
          </div>
          <div className="text-white/40 text-[9px] uppercase tracking-[0.4em] font-bold">
            Scholar Grounding Synthesis
          </div>
        </div>
        <div className="p-10 h-[500px] overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-white/10">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-5 animate-log-entry border-l-2 border-white/5 pl-5 ml-2">
              <span className="text-white/20 shrink-0 tabular-nums">
                {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className={`
                    text-[9px] font-black px-2 py-0.5 rounded tracking-tighter
                    ${log.status === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                    ${log.status === 'processing' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${log.status === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-white/90 font-medium">
                    {log.label[langKey]}
                  </span>
                </div>
                {log.detail && <p className="text-white/40 mt-2 text-xs font-light leading-relaxed">→ {log.detail}</p>}
              </div>
            </div>
          ))}
          <div ref={logsEndRef} className="flex items-center gap-3 text-sage-500 pt-4 ml-2">
            <span className="w-1.5 h-4 bg-sage-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Structuring Professional Protocol...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const isBibliographySection = (text: string) => {
    const lower = text.toLowerCase();
    return lower.includes("bibliography") || lower.includes("參考書目");
  };

  return (
    <>
      <div className="bg-paper shadow-3xl rounded-2xl overflow-hidden border border-stone-200 animate-fade-in max-w-5xl mx-auto ring-1 ring-black/5">
        <div className="bg-white/90 backdrop-blur-xl px-8 py-5 border-b border-stone-100 flex justify-between items-center no-print sticky top-20 z-30">
          <div className="flex items-center gap-4">
             <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-sage-500"></div>
               <div className="w-2 h-2 rounded-full bg-sage-200"></div>
             </div>
             <span className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 border-l border-stone-200 pl-4">Biblical Manuscript Research</span>
          </div>
          <div className="flex gap-3">
            {onSave && (
              <button 
                onClick={onSave} 
                disabled={isSaved}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all shadow-lg active:scale-95 ${
                  isSaved 
                    ? 'bg-green-500 text-white shadow-green-600/20' 
                    : 'bg-accent text-white shadow-accent/20 hover:bg-gold-600'
                }`}
              >
                 <span className="material-symbols-outlined text-lg">{isSaved ? 'check_circle' : 'library_add'}</span>
                 {isSaved ? t.saved[langKey] : t.saveToLibrary[langKey]}
              </button>
            )}
            <button onClick={() => setShowChatSession(true)} className="bg-sage-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 hover:bg-sage-700 transition-all shadow-lg shadow-sage-600/20 active:scale-95">
               <span className="material-symbols-outlined text-lg">chat_bubble</span>
               {language === Language.English ? "Consult Assistant" : "諮詢助理"}
            </button>
            <button onClick={handleDownloadWord} className="bg-white border border-stone-200 px-5 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all active:scale-95">
               <span className="material-symbols-outlined text-lg">description</span>
               {language === Language.English ? "Export Word" : "匯出文件"}
            </button>
          </div>
        </div>

        <div className="p-16 md:p-24 lg:p-32">
          <div ref={contentRef} className="prose prose-stone prose-lg md:prose-2xl max-w-none font-serif leading-relaxed print-only-content">
            <Markdown
              components={{
                h1: (p) => <h1 className="text-6xl font-black text-sage-800 border-b-4 border-sage-600/10 pb-12 mb-20 tracking-tighter text-center italic" {...p} />,
                h2: (p) => {
                  const isBib = isBibliographySection(String(p.children || ""));
                  return (
                    <h2 
                      className={`text-4xl font-bold text-sage-700 mt-24 mb-12 pb-4 border-b-2 tracking-tight ${isBib ? 'border-gold-500' : 'border-sage-200/50'}`} 
                      {...p} 
                    />
                  );
                },
                h3: (p) => <h3 className="text-2xl font-bold text-sage-600 mt-14 mb-6 tracking-tight border-l-4 border-sage-100 pl-6" {...p} />,
                h4: (p) => <h4 className="text-xl font-bold text-sage-500 mt-10 mb-4 italic" {...p} />,
                blockquote: (p) => (
                  <blockquote className="border-l-8 border-gold-500 bg-stone-50/70 py-10 px-14 italic text-stone-800 rounded-r-3xl my-16 shadow-inner font-serif text-3xl leading-relaxed" {...p} />
                ),
                p: (p) => {
                  const text = String(p.children || "");
                  const parts = content.split(/#+ (?:Selected Bibliography|參考書目)/i);
                  const inBib = parts.length > 1 && content.indexOf(text) > content.toLowerCase().indexOf("bibliography");
                  
                  if (inBib && text.length > 30) {
                     return <p className="mb-4 text-xl text-charcoal pl-8 -indent-8 leading-normal font-sans tracking-tight" {...p} />;
                  }

                  // Dropcap only for the very first paragraph of the document
                  const isFirstPara = content.indexOf(text) < 500;
                  return (
                    <p 
                      className={`mb-12 text-charcoal text-justify leading-[1.8] opacity-95 ${isFirstPara ? 'first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:mt-1 first-letter:text-sage-700' : ''}`} 
                      {...p} 
                    />
                  );
                },
                ul: (p) => <ul className="list-disc pl-10 space-y-4 mb-12 marker:text-gold-500" {...p} />,
                ol: (p) => <ol className="list-decimal pl-10 space-y-4 mb-12 marker:text-sage-600 marker:font-bold" {...p} />,
                li: (p) => <li className="text-xl leading-relaxed text-charcoal" {...p} />,
                strong: (p) => <strong className="font-bold text-sage-900 border-b border-gold-500/10" {...p} />,
                em: (p) => <em className="italic text-sage-800" {...p} />
              }}
            >
              {content}
            </Markdown>

            {/* Grounding Sources (Verified Hyperlinks) */}
            {sources && sources.length > 0 && (
              <div className="mt-32 pt-16 border-t-4 border-stone-100 no-print">
                <div className="flex items-center gap-6 mb-12">
                   <h4 className="text-[12px] font-black text-sage-600 uppercase tracking-[0.4em] whitespace-nowrap">
                    Digital Access Grounding
                  </h4>
                  <div className="h-px bg-stone-200 w-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group p-6 bg-white border border-stone-200 rounded-2xl hover:border-sage-400 hover:shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[10px] text-gold-600 font-black uppercase tracking-widest mb-2">Primary Access</div>
                        <div className="text-lg font-bold text-sage-800 group-hover:text-sage-600 leading-tight mb-2 line-clamp-2">{source.title}</div>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono truncate">{source.uri}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatSession 
        contextContent={content} 
        language={language} 
        isVisible={showChatSession}
        onClose={() => setShowChatSession(false)} 
        apiKey={apiKey}
      />
    </>
  );
};
