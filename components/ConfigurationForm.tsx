
import React, { useState } from 'react';
import { StudyConfig, KnowledgeLevel, StudyType, Language } from '../types';
import { UI_TEXT, KNOWLEDGE_LEVEL_LABELS, STUDY_TYPE_LABELS } from '../constants';
import { generateTopic, fetchDailyLectionary } from '../services/geminiService';

interface ConfigurationFormProps {
  config: StudyConfig;
  onChange: (updates: Partial<StudyConfig>) => void;
  language: Language;
  apiKey: string;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ config, onChange, language, apiKey }) => {
  const t = UI_TEXT;
  const langKey = language === Language.English ? 'en' : 'zh';
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [fetchingType, setFetchingType] = useState<string | null>(null);
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);

  const handleAutoGenerateTopic = async () => {
    if (!config.passage) return;
    setIsGeneratingTopic(true);
    setTopicSuggestions([]);
    
    try {
      const topics = await generateTopic(config.passage, language, apiKey);
      if (Array.isArray(topics) && topics.length > 0) {
        setTopicSuggestions(topics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const handleFetchLectionary = async (type: 'RCL' | 'Torah' | 'Orthodox') => {
    setFetchingType(type);
    try {
      const readings = await fetchDailyLectionary(apiKey, language, type);
      if (readings) {
        onChange({ passage: readings });
      } else {
        alert(t.lectionaryError[langKey]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingType(null);
    }
  };

  const handleSelectTopic = (selectedTopic: string) => {
    onChange({ topic: selectedTopic });
    setTopicSuggestions([]);
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* Passage Input */}
      <div className="flex flex-col gap-3">
        <label className="text-lg font-bold text-[#2c2c2c] serif">
          {t.passageLabel[langKey]}
        </label>
        
        {/* Lectionary Quick Select Buttons - Explicitly Rendered */}
        <div className="flex flex-wrap gap-2 mb-1">
          <button
            onClick={() => handleFetchLectionary('RCL')}
            disabled={fetchingType !== null}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${fetchingType === 'RCL' ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-stone-600 hover:border-primary hover:text-primary'}
            `}
          >
            {fetchingType === 'RCL' && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
            {t.lectionaryRCL[langKey]}
          </button>

          <button
            onClick={() => handleFetchLectionary('Torah')}
            disabled={fetchingType !== null}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${fetchingType === 'Torah' ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-stone-600 hover:border-primary hover:text-primary'}
            `}
          >
            {fetchingType === 'Torah' && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
            {t.lectionaryTorah[langKey]}
          </button>

          <button
            onClick={() => handleFetchLectionary('Orthodox')}
            disabled={fetchingType !== null}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${fetchingType === 'Orthodox' ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-stone-600 hover:border-primary hover:text-primary'}
            `}
          >
            {fetchingType === 'Orthodox' && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
            {t.lectionaryOrthodox[langKey]}
          </button>
        </div>

        <div className="relative group">
          <input
            type="text"
            value={config.passage}
            onChange={(e) => onChange({ passage: e.target.value })}
            placeholder={t.passagePlaceholder[langKey]}
            className="w-full bg-white border-2 border-transparent focus:border-accent/50 ring-1 ring-stone-200 rounded-2xl px-6 py-5 text-xl font-serif text-[#2c2c2c] placeholder:text-stone-300 focus:outline-none focus:ring-4 focus:ring-accent/10 shadow-soft transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto-Research Contemporary Scholarship */}
        <div 
          onClick={() => onChange({ autoResearch: !config.autoResearch })}
          className={`relative overflow-hidden rounded-2xl border-2 p-5 flex items-center justify-between transition-all cursor-pointer group shadow-sm hover:shadow-md
            ${config.autoResearch 
              ? 'border-[#556b2f] bg-[#f2f4ef]' 
              : 'border-transparent bg-white ring-1 ring-stone-200 hover:ring-stone-300'
            }`}
        >
          <div className="flex items-center gap-4 z-10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.autoResearch} readOnly className="sr-only peer" />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#556b2f]/30 rounded-full peer peer-checked:bg-[#556b2f] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <div className="flex flex-col">
              <h3 className={`text-base font-bold transition-colors ${config.autoResearch ? 'text-[#1a1a1a]' : 'text-text-main'}`}>
                {t.autoResearchLabel[langKey]}
              </h3>
              <p className={`text-xs transition-colors line-clamp-2 ${config.autoResearch ? 'text-[#4a5a3a]' : 'text-stone-500'}`}>
                {t.autoResearchDesc[langKey]}
              </p>
            </div>
          </div>
        </div>

        {/* Include Historical Background */}
        <div 
          onClick={() => onChange({ includeBackground: !config.includeBackground })}
          className={`relative overflow-hidden rounded-2xl border-2 p-5 flex items-center justify-between transition-all cursor-pointer group shadow-sm hover:shadow-md
            ${config.includeBackground 
              ? 'border-[#b89c3a] bg-[#fcfbf5]' 
              : 'border-transparent bg-white ring-1 ring-stone-200 hover:ring-stone-300'
            }`}
        >
          <div className="flex items-center gap-4 z-10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.includeBackground} readOnly className="sr-only peer" />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#b89c3a]/30 rounded-full peer peer-checked:bg-[#b89c3a] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <div className="flex flex-col">
              <h3 className={`text-base font-bold transition-colors ${config.includeBackground ? 'text-[#1a1a1a]' : 'text-text-main'}`}>
                {t.includeBackgroundLabel[langKey]}
              </h3>
              <p className={`text-xs transition-colors line-clamp-2 ${config.includeBackground ? 'text-[#6b5a21]' : 'text-stone-500'}`}>
                {t.includeBackgroundDesc[langKey]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theological Topic (Optional) */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <label className="text-lg font-bold text-[#2c2c2c] serif">
            {t.topicLabel[langKey]}
          </label>
          <button
            onClick={handleAutoGenerateTopic}
            disabled={!config.passage || isGeneratingTopic}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors uppercase tracking-wider
              ${!config.passage || isGeneratingTopic ? 'text-stone-300 cursor-not-allowed' : 'text-stone-400 hover:text-accent'}`}
          >
            <span className={`material-symbols-outlined text-sm ${isGeneratingTopic ? 'animate-spin' : ''}`}>
              {isGeneratingTopic ? 'autorenew' : 'bolt'}
            </span>
            {t.generateIdeas[langKey]}
          </button>
        </div>
        <input
          type="text"
          value={config.topic}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder={t.topicPlaceholder[langKey]}
          className="w-full bg-white border-2 border-transparent focus:border-accent/50 ring-1 ring-stone-200 rounded-2xl px-6 py-5 text-lg font-serif text-[#2c2c2c] placeholder:text-stone-300 focus:outline-none focus:ring-4 focus:ring-accent/10 shadow-soft transition-all"
        />

        {/* Topic Suggestions Grid */}
        {topicSuggestions.length > 0 && (
          <div className="grid gap-3 pt-4 animate-fade-in">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
              {t.selectTheme[langKey]}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topicSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTopic(suggestion)}
                  className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <span className="font-serif text-base font-bold text-text-main group-hover:text-primary block leading-tight">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-[#4a4a4a] uppercase tracking-wider">
            {t.knowledgeLabel[langKey]}
          </label>
          <div className="relative">
            <select
              value={config.knowledgeLevel}
              onChange={(e) => onChange({ knowledgeLevel: e.target.value as KnowledgeLevel })}
              className="w-full appearance-none bg-white ring-1 ring-stone-200 rounded-xl px-5 py-4 text-base font-medium text-[#2c2c2c] focus:outline-none focus:ring-2 focus:ring-accent shadow-sm cursor-pointer border-none"
            >
              {Object.values(KnowledgeLevel).map((level) => (
                <option key={level} value={level}>
                  {KNOWLEDGE_LEVEL_LABELS[level][langKey]}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-[#4a4a4a] uppercase tracking-wider">
            {t.typeLabel[langKey]}
          </label>
          <div className="relative">
            <select
              value={config.studyType}
              onChange={(e) => onChange({ studyType: e.target.value as StudyType })}
              className="w-full appearance-none bg-white ring-1 ring-stone-200 rounded-xl px-5 py-4 text-base font-medium text-[#2c2c2c] focus:outline-none focus:ring-2 focus:ring-accent shadow-sm cursor-pointer border-none"
            >
              {Object.values(StudyType).map((type) => (
                <option key={type} value={type}>
                  {STUDY_TYPE_LABELS[type][langKey]}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Duration Slider per stitch code */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center">
          <label className="text-base font-bold text-[#4a4a4a] uppercase tracking-wider">{t.durationLabel[langKey]}</label>
          <span className="text-lg font-bold text-[#3f6212]">{config.duration} {t.minutes[langKey]}</span>
        </div>
        <div className="relative w-full h-12 flex items-center">
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={config.duration}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) })}
            className="w-full h-2 bg-[#e5e5e0] rounded-lg appearance-none cursor-pointer accent-[#3f6212]"
          />
        </div>
      </div>
    </div>
  );
};
