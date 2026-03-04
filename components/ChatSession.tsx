
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import Markdown from 'react-markdown';
import { Language } from '../types';

interface ChatSessionProps {
  contextContent: string;
  language: Language;
  onClose: () => void;
  isVisible: boolean;
  apiKey: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatSession: React.FC<ChatSessionProps> = ({ contextContent, language, onClose, isVisible, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isChinese = language === Language.TraditionalChinese;

  useEffect(() => {
    // Initialize chat session whenever the context content changes (new report generated).
    const initChat = async () => {
      if (!apiKey) return;
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are a PhD-level Theological Research Assistant.
        Report Context: """${contextContent.substring(0, 10000)}"""
        
        FORMATTING RULES:
        1. NEVER wrap Greek, Hebrew, or non-English text in dollar signs ($). 
        2. Use standard Unicode characters for all scripts.
        3. Use Markdown italics for transliterations and bold for original scripts.
        
        Tasks:
        1. Answer follow-ups based on the generated report.
        2. Expand using your internal scholarly database for deep theology.
        3. Maintain a tone of professional excellence.
        Language: ${isChinese ? 'Traditional Chinese' : 'English'}
      `;

      try {
        const chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        chatRef.current = chat;
        const greeting = isChinese 
          ? "報告已生成。我是您的神學研究助理，針對上述內容或其原始語境，您有什麼需要更深入探討的嗎？"
          : "The analysis is complete. I am your theological research assistant. How can I further assist your inquiry into this text or its historical implications?";
        setMessages([{ role: 'model', text: greeting }]);
      } catch (error) {
        console.error("Chat init error:", error);
      }
    };
    initChat();
  }, [contextContent, isChinese, apiKey]);

  useEffect(() => {
    if (isVisible) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isVisible]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      let fullText = '';
      for await (const chunk of result) {
        fullText += (chunk as GenerateContentResponse).text || '';
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText };
          return newMsgs;
        });
      }
    } catch (error: any) {
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429")) {
        setMessages(prev => [...prev, { role: 'model', text: "Quota Exhausted: Your current protocol has reached its rate limit. Please wait a moment." }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Service Error: Connection interrupted. Please try re-activating your protocol." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportTranscript = () => {
    if (messages.length === 0) return;

    const dateStr = new Date().toLocaleDateString(isChinese ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const title = isChinese ? "附錄：研究諮詢對話錄" : "Appendix: Research Consultation Transcript";
    const scholarLabel = isChinese ? "學者 (用戶)" : "Scholar (User)";
    const assistantLabel = isChinese ? "研究助理 (AI)" : "Research Assistant";

    let htmlContent = `
      <html>
        <head>
          <meta charset='utf-8'>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; color: #000; }
            h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; margin-bottom: 30px; font-size: 24px; }
            .meta { font-size: 10pt; color: #666; margin-bottom: 40px; text-align: center; font-style: italic; }
            .entry { margin-bottom: 25px; page-break-inside: avoid; }
            .speaker { font-weight: bold; margin-bottom: 5px; font-size: 12pt; }
            .speaker.user { color: #3f6212; }
            .speaker.model { color: #000; }
            .content { text-align: justify; white-space: pre-wrap; font-size: 12pt; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">${dateStr}</div>
    `;

    messages.forEach(msg => {
      const label = msg.role === 'user' ? scholarLabel : assistantLabel;
      // Basic sanitization and formatting
      const safeText = msg.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      htmlContent += `
        <div class="entry">
          <div class="speaker ${msg.role}">${label}:</div>
          <div class="content">${safeText}</div>
        </div>
      `;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Consultation_Appendix_${new Date().getTime()}.doc`;
    link.click();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4"
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      <div className="bg-white w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="bg-sage-600 p-5 flex justify-between items-center shadow-lg z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
              <span className="text-xl">📜</span>
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white tracking-wide">Research Consultation</h3>
              <p className="text-sage-100 text-xs uppercase tracking-widest font-medium">Session: Scholarly AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportTranscript}
              className="p-2 hover:bg-white/10 rounded-full text-white transition-all flex items-center justify-center"
              title={isChinese ? "匯出對話為附錄 (Word)" : "Export Transcript as Appendix (Word)"}
            >
              <span className="material-symbols-outlined text-xl">save_alt</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-ivory space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-6 py-4 shadow-sm font-serif ${msg.role === 'user' ? 'bg-sage-600 text-white rounded-tr-none' : 'bg-white border border-stone-200 text-charcoal rounded-tl-none'}`}>
                <div className="prose prose-sm max-w-none leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-sage-400 italic text-sm animate-pulse px-2">Assistant is synthesizing response...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 bg-white border-t border-stone-200">
          <div className="relative flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isChinese ? "輸入問題... (Command+Enter 發送)" : "Inquire further... (Command+Enter to send)"}
              className="w-full p-4 pr-14 max-h-40 min-h-[60px] bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none resize-none transition-all font-serif"
              rows={1}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading} 
              className="absolute right-3 bottom-3 p-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:bg-stone-300 transition-all"
              title={isChinese ? "發送 (Cmd+Enter)" : "Send (Cmd+Enter)"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
