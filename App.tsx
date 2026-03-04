
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepWizard } from './components/StepWizard';
import { ConfigurationForm } from './components/ConfigurationForm';
import { SelectorGrid } from './components/SelectorGrid';
import { ResultDisplay } from './components/ResultDisplay';
import { ApiKeyInput } from './components/ApiKeyInput';
import { LibraryView } from './components/LibraryView';
import { StudyConfig, KnowledgeLevel, StudyType, Language, ActivityLog, ViewType, LibraryItem } from './types';
import { APPROACHES, TRADITIONS, UI_TEXT, KNOWLEDGE_LEVEL_LABELS, STUDY_TYPE_LABELS } from './constants';
import { generateStudyGuide } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<Language>(Language.English);
  const [currentView, setCurrentView] = useState<ViewType>('new');
  
  const [config, setConfig] = useState<StudyConfig>({
    passage: '',
    topic: '',
    knowledgeLevel: KnowledgeLevel.Intermediate,
    studyType: StudyType.Comprehensive,
    duration: 60,
    approaches: [],
    customApproach: '',
    traditions: [],
    language: Language.English,
    autoResearch: true,
    includeBackground: false
  });
  
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isDirty, setIsDirty] = useState(true);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [currentLibraryItem, setCurrentLibraryItem] = useState<LibraryItem | null>(null);

  // Load library from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sacred_studies_library');
    if (saved) {
      try {
        setLibrary(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse library", e);
      }
    }
  }, []);

  // Save library to local storage
  useEffect(() => {
    localStorage.setItem('sacred_studies_library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    setConfig(prev => ({ ...prev, language }));
  }, [language]);

  const handleConfigChange = (updates: Partial<StudyConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setCurrentLibraryItem(null);
  };

  const handleBack = () => {
    if (step === 4 && config.autoResearch) {
      setStep(1); // Jump back to start if we skipped steps
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = async () => {
    // Auto-Pilot Logic: Skip selection steps if autoResearch is ON
    if (step === 1 && config.autoResearch) {
      setStep(4);
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsGenerating(true);
      setLogs([]);
      try {
        const result = await generateStudyGuide(config, (log) => {
          setLogs(prev => [...prev, log]);
        }, apiKey); // Pass apiKey here
        setGeneratedContent(result.text);
        setSources(result.sources || []);
        setIsDirty(false);
        setCurrentLibraryItem(null);
      } catch (error: any) {
        console.error("Generation Error:", error);
        const errorMsg = error?.message || "";
        if (errorMsg.includes("429") || errorMsg.includes("Resource has been exhausted")) {
          setGeneratedContent("Quota Exhausted: Your API Key has reached its rate limit.");
        } else if (errorMsg.includes("403") || errorMsg.includes("API_KEY_INVALID")) {
          setGeneratedContent("Authorization Error: The provided API key is invalid.");
        } else {
          setGeneratedContent(`Operational Fault: ${errorMsg || "Generation pipeline interrupted."}`);
        }
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedContent) return;
    
    const newItem: LibraryItem = {
      id: crypto.randomUUID(),
      title: config.topic || config.passage,
      content: generatedContent,
      sources: sources,
      config: { ...config },
      timestamp: new Date()
    };
    
    setLibrary(prev => [...prev, newItem]);
    setCurrentLibraryItem(newItem);
  };

  const handleOpenLibraryItem = (item: LibraryItem) => {
    setCurrentLibraryItem(item);
    setGeneratedContent(item.content);
    setSources(item.sources);
    setConfig(item.config);
    setStep(4);
    setCurrentView('new');
    setIsDirty(false);
  };

  const handleDeleteLibraryItem = (id: string) => {
    setLibrary(prev => prev.filter(item => item.id !== id));
    if (currentLibraryItem?.id === id) {
      setCurrentLibraryItem(null);
    }
  };

  const t = UI_TEXT;
  const langKey = language === Language.English ? 'en' : 'zh';

  if (!apiKey) {
    return <ApiKeyInput onActivated={(key) => setApiKey(key)} />;
  }

  const getSelectedLabels = (items: any[], selectedIds: string[]) => {
    if (selectedIds.length === 0 && config.autoResearch) return [t.autoSelected[langKey]]; // "Auto-Selected"
    if (selectedIds.length === 0) return ["None Selected"];

    return selectedIds.map(id => {
      const item = items.find(i => i.id === id);
      if (id === 'custom' && config.customApproach) return config.customApproach;
      return item ? item.label[langKey] : id;
    }).filter(Boolean);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Aside - Navigation */}
      <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white md:flex">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <span className="text-xl font-bold">S</span>
              </div>
              <h1 className="text-xl font-bold leading-normal tracking-tight text-text-main">Sacred Studies</h1>
            </div>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                <span className="material-symbols-outlined" style={{fontSize: '24px'}}>dashboard</span>
                <span className="text-sm font-semibold">{t.dashboard[langKey]}</span>
              </button>
              <button 
                onClick={() => setCurrentView('new')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === 'new' ? 'bg-primary/10 text-primary' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                <span className="material-symbols-outlined" style={{fontSize: '24px'}}>edit_document</span>
                <span className="text-sm font-semibold">{t.generatePaper[langKey]}</span>
              </button>
              <button 
                onClick={() => setCurrentView('library')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === 'library' ? 'bg-primary/10 text-primary' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                <span className="material-symbols-outlined" style={{fontSize: '24px'}}>library_books</span>
                <span className="text-sm font-semibold">{t.myLibrary[langKey]}</span>
              </button>
              <button 
                onClick={() => setCurrentView('settings')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === 'settings' ? 'bg-primary/10 text-primary' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                <span className="material-symbols-outlined" style={{fontSize: '24px'}}>settings</span>
                <span className="text-sm font-semibold">{t.settings[langKey]}</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f8f7f4] relative">
        <Header language={language} onToggleLanguage={() => setLanguage(l => l === Language.English ? Language.TraditionalChinese : Language.English)} />
        
        <div className="w-full max-w-4xl mx-auto px-6 pb-32">
          {currentView === 'new' ? (
            <>
              <div className="no-print pt-4">
                <StepWizard currentStep={step} totalSteps={4} onStepClick={setStep} language={language} />
              </div>

              <div className="mt-4">
                {step === 1 && <ConfigurationForm config={config} onChange={handleConfigChange} language={language} apiKey={apiKey} />}
                {step === 2 && (
                  <SelectorGrid
                    title={t.selectApproachesTitle[langKey]}
                    subtitle={t.selectApproachesSub[langKey]}
                    items={APPROACHES}
                    selectedIds={config.approaches}
                    onToggle={(id) => handleConfigChange({ approaches: config.approaches.includes(id) ? config.approaches.filter(a => a !== id) : [...config.approaches, id] })}
                    language={language}
                    customInputId="custom"
                    customInputValue={config.customApproach}
                    onCustomInputChange={(val) => handleConfigChange({ customApproach: val })}
                  />
                )}
                {step === 3 && (
                  <SelectorGrid
                    title={t.selectTraditionsTitle[langKey]}
                    subtitle={t.selectTraditionsSub[langKey]}
                    items={TRADITIONS}
                    selectedIds={config.traditions}
                    onToggle={(id) => handleConfigChange({ traditions: config.traditions.includes(id) ? config.traditions.filter(t => t !== id) : [...config.traditions, id] })}
                    language={language}
                  />
                )}
                {step === 4 && (
                  <div className="space-y-12 animate-fade-in">
                    <div className="bg-white p-10 rounded-3xl border border-stone-200 shadow-soft max-w-4xl mx-auto no-print">
                      <h2 className="font-serif text-3xl font-bold text-primary mb-8 text-center border-b border-stone-100 pb-6 tracking-tight">{t.reviewConfig[langKey]}</h2>
                      
                      <div className="space-y-8">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base">
                          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                            <dt className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t.passageLabel[langKey]}</dt>
                            <dd className="font-serif text-2xl font-bold text-text-main">{config.passage || "-"}</dd>
                          </div>
                          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                            <dt className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t.topicLabel[langKey]}</dt>
                            <dd className="font-serif text-2xl font-bold text-text-main">{config.topic || "-"}</dd>
                          </div>
                        </dl>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="border border-stone-100 p-5 rounded-xl bg-white">
                            <dt className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">{t.knowledgeLabel[langKey]}</dt>
                            <dd className="font-bold text-primary">{KNOWLEDGE_LEVEL_LABELS[config.knowledgeLevel][langKey]}</dd>
                          </div>
                          <div className="border border-stone-100 p-5 rounded-xl bg-white">
                            <dt className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">{t.typeLabel[langKey]}</dt>
                            <dd className="font-bold text-primary">{STUDY_TYPE_LABELS[config.studyType][langKey]}</dd>
                          </div>
                          <div className="border border-stone-100 p-5 rounded-xl bg-white">
                            <dt className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">{t.durationLabel[langKey]}</dt>
                            <dd className="font-bold text-primary">{config.duration} {t.minutes[langKey]}</dd>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <dt className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t.stepApproaches[langKey]}</span>
                            </dt>
                            <dd className="flex flex-wrap gap-2">
                              {getSelectedLabels(APPROACHES, config.approaches).map((label, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-primary/20 text-primary rounded-full text-xs font-bold shadow-sm">
                                  {label}
                                </span>
                              ))}
                            </dd>
                          </div>

                          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <dt className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t.stepTraditions[langKey]}</span>
                            </dt>
                            <dd className="flex flex-wrap gap-2">
                              {getSelectedLabels(TRADITIONS, config.traditions).map((label, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-primary/20 text-primary rounded-full text-xs font-bold shadow-sm">
                                  {label}
                                </span>
                              ))}
                            </dd>
                          </div>
                          
                          {/* Librarian Agent Status Indicator - Always Active Now */}
                           <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 flex items-center justify-between shadow-md">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <span className="text-white text-xs font-bold tracking-wider uppercase">Librarian Agent Active</span>
                              </div>
                              <span className="material-symbols-outlined text-stone-400 text-sm">search_check</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    <ResultDisplay 
                      content={generatedContent} 
                      isGenerating={isGenerating} 
                      language={language} 
                      logs={logs} 
                      sources={sources} 
                      onSave={handleSaveToLibrary}
                      isSaved={!!currentLibraryItem}
                      apiKey={apiKey}
                    />
                  </div>
                )}
              </div>
            </>
          ) : currentView === 'library' ? (
            <div className="mt-12">
              <div className="mb-12 border-b border-stone-200 pb-8">
                <h2 className="font-serif text-4xl font-bold text-text-main mb-2 tracking-tight">{t.myLibrary[langKey]}</h2>
                <p className="text-stone-500 font-medium">{language === Language.English ? "Browse and consult your saved theological manuscripts." : "瀏覽並諮詢您儲存的神學手稿。"}</p>
              </div>
              <LibraryView 
                library={library} 
                language={language} 
                onOpenItem={handleOpenLibraryItem} 
                onDeleteItem={handleDeleteLibraryItem}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-stone-400">
              <span className="material-symbols-outlined text-6xl mb-4">construction</span>
              <p className="text-xl font-bold uppercase tracking-widest">{language === Language.English ? "Feature Under Construction" : "功能開發中"}</p>
            </div>
          )}
        </div>

        {/* Updated Footer Navigation with translated button text */}
        <footer className="bg-white border-t border-stone-200 fixed bottom-0 left-0 md:left-64 right-0 z-40 py-6 no-print shadow-[0_-4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/90">
          <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
            {currentView === 'new' ? (
              <>
                <button 
                  onClick={handleBack} 
                  disabled={step === 1 || isGenerating} 
                  className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:text-primary transition-all disabled:opacity-0 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  {t.back[langKey]}
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleNext}
                    disabled={!config.passage || isGenerating || (!isDirty && generatedContent !== '')}
                    className={`px-10 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3 ${
                      !config.passage || isGenerating || (!isDirty && generatedContent !== '')
                        ? 'bg-stone-300 shadow-none grayscale'
                        : 'bg-text-main hover:bg-black shadow-text-main/20'
                    }`}
                  >
                    {isGenerating ? t.synthesizing[langKey] : (
                      <span className="flex items-center gap-2">
                        {step === 4 ? t.generate[langKey] : 
                         (step === 1 && config.autoResearch) ? t.nextReview[langKey] :
                         step === 1 ? t.nextApproaches[langKey] : 
                         step === 2 ? t.nextTraditions[langKey] : 
                         t.nextReview[langKey]}
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button 
                  onClick={() => setCurrentView('new')}
                  className="bg-primary text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-3"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  {t.newAnalysis[langKey]}
                </button>
              </div>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
