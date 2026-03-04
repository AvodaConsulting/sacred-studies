
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ApiKeyInputProps {
  onActivated: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onActivated }) => {
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    const key = inputKey.trim();
    if (!key) return;
    
    setIsValidating(true);
    setError('');
    
    try {
      // We perform a lightweight validity check by listing models or generating a tiny string.
      // Since @google/genai doesn't have a direct 'validate' method, we try to create a client
      // and perform a minimal operation.
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'ping',
      });
      
      // If no error thrown, key is valid
      onActivated(key);
    } catch (e: any) {
      console.error(e);
      let msg = "Invalid API Key or Network Error.";
      if (e.toString().includes("403") || e.toString().includes("API_KEY_INVALID")) {
        msg = "The API Key provided is invalid.";
      } else if (e.toString().includes("429")) {
        msg = "Quota exceeded for this API Key.";
      }
      setError(msg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-fade-in">
        <div className="bg-sage-600 p-12 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
            <span className="font-serif text-white font-bold text-4xl">S</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Sacred Studies AI</h1>
          <p className="text-sage-100 text-[10px] uppercase tracking-[0.3em] font-bold">BYOK Protocol Activation</p>
        </div>
        
        <div className="p-10 space-y-6">
          <p className="text-stone-500 text-sm leading-relaxed text-center">
            To maintain <strong>Professional Integrity</strong>, please provide your own Google Gemini API Key. 
            No keys are stored on our servers. Charges apply to your personal billing account.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Gemini API Key</label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AIzaSy..."
              className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-sm rounded-xl focus:ring-sage-600 focus:border-sage-600 block p-4 outline-none font-mono transition-all focus:shadow-inner"
            />
            {error && <p className="text-red-500 text-xs font-bold pl-1 animate-pulse">{error}</p>}
          </div>

          <button
            onClick={handleValidate}
            disabled={isValidating || !inputKey}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
              ${isValidating || !inputKey 
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-sage-600 to-sage-800 text-white hover:shadow-sage-600/30'}`
            }
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying Credentials...
              </>
            ) : (
              "Verify & Launch System"
            )}
          </button>
          
          <div className="pt-4 text-center border-t border-stone-100">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="text-[10px] text-stone-400 hover:text-sage-600 transition-colors uppercase tracking-[0.2em] font-bold"
             >
               Get a Gemini API Key
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};
