
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  PartyPopper, 
  Info, 
  ChevronRight, 
  RotateCcw,
  Palette,
  Baby,
  Cuboid,
  Image as ImageIcon,
  Search,
  Wand2,
  Loader2,
  CheckCircle2,
  Edit3,
  Clock
} from 'lucide-react';
import { KitItem, KitItemType, UserInput, IllustrationStyle } from './types';
import { describeChild, describeTheme, generateKitImage, fileToBase64 } from './services/gemini';
import KitGallery from './components/KitGallery';

const INITIAL_KIT_ITEMS: KitItem[] = Object.values(KitItemType).map((type, index) => ({
  id: `item-${index}`,
  type,
  imageUrl: '',
  status: 'pending',
  description: ''
}));

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userInput, setUserInput] = useState<UserInput>({
    childPhoto: null,
    themePhoto: null,
    age: '',
    features: '',
    tone: 'Fofo',
    style: '2D'
  });
  const [kitItems, setKitItems] = useState<KitItem[]>(INITIAL_KIT_ITEMS);
  const [error, setError] = useState<string | null>(null);
  
  // State for AI Analysis display
  const [analysis, setAnalysis] = useState<{childDesc: string, themeDesc: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'child' | 'theme') => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setUserInput(prev => ({
        ...prev,
        [type === 'child' ? 'childPhoto' : 'themePhoto']: base64
      }));
    }
  };

  const generateSingleItem = async (item: KitItem, childDesc: string, themeDesc: string) => {
    setKitItems(prev => prev.map(it => 
      it.id === item.id ? { ...it, status: 'generating' } : it
    ));

    try {
      const imgUrl = await generateKitImage(
        item.type,
        childDesc,
        themeDesc,
        userInput.childPhoto!,
        userInput.age,
        userInput.tone,
        userInput.style
      );
      
      setKitItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, status: 'completed', imageUrl: imgUrl } : it
      ));
    } catch (err) {
      console.error(`Error generating ${item.type}:`, err);
      setKitItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, status: 'error' } : it
      ));
    }
  };

  const handleRetry = async (item: KitItem) => {
    if (!userInput.childPhoto || !analysis) return;
    await generateSingleItem(item, analysis.childDesc, analysis.themeDesc);
  };

  const startAnalysis = async () => {
    if (!userInput.childPhoto) {
      setError("A foto da criança é obrigatória!");
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);
    setError(null);
    setStep(3);
    setAnalysis(null);
    setIsConfirmed(false);

    try {
      const childDesc = await describeChild(userInput.childPhoto);
      const themeDesc = userInput.themePhoto 
        ? await describeTheme(userInput.themePhoto) 
        : "Cores suaves e elementos festivos genéricos.";
      
      setAnalysis({ childDesc, themeDesc });
      setIsAnalyzing(false);
    } catch (err) {
      setError("Ocorreu um erro ao analisar as imagens. Verifique sua conexão.");
      setIsAnalyzing(false);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const confirmAndGenerate = async () => {
    if (!analysis) return;
    setIsConfirmed(true);
  };

  const reset = () => {
    setStep(1);
    setLoading(false);
    setIsAnalyzing(false);
    setIsConfirmed(false);
    setUserInput({
      childPhoto: null,
      themePhoto: null,
      age: '',
      features: '',
      tone: 'Fofo',
      style: '2D'
    });
    setKitItems(INITIAL_KIT_ITEMS);
    setError(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 mb-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-xl">
            <PartyPopper className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Festa <span className="text-pink-500">Mágica</span>
          </h1>
        </div>
        {(step > 1 || isConfirmed) && (
          <button 
            onClick={reset}
            className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" /> Recomeçar
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 flex-grow w-full">
        {/* Progress bar */}
        <div className="mb-12 relative flex justify-between items-center max-w-md mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2 z-0 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                step >= s ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-white text-gray-400 border-2 border-gray-200'
              }`}
            >
              {s === 1 && <Camera className="w-5 h-5" />}
              {s === 2 && <Palette className="w-5 h-5" />}
              {s === 3 && <Sparkles className="w-5 h-5" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Identification */}
        {step === 1 && (
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border-b-8 border-pink-100">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <span className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">Passo 1</span>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Quem é a estrela da festa?</h2>
                <p className="text-gray-500 mt-2">Nossa IA manterá a semelhança facial em estilo ilustrado!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 ml-1">Foto da Criança (Obrigatória)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(e, 'child')}
                      className="hidden" 
                      id="child-upload" 
                    />
                    <label 
                      htmlFor="child-upload"
                      className={`flex flex-col items-center justify-center h-64 border-4 border-dashed rounded-[32px] cursor-pointer transition-all ${
                        userInput.childPhoto 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 bg-gray-50 hover:bg-pink-50 hover:border-pink-300'
                      }`}
                    >
                      {userInput.childPhoto ? (
                        <img 
                          src={`data:image/jpeg;base64,${userInput.childPhoto}`} 
                          alt="Criança" 
                          className="w-full h-full object-cover rounded-[28px]" 
                        />
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-pink-500" />
                          </div>
                          <span className="text-gray-400 font-medium">Carregar Foto</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                      <Baby className="w-4 h-4 text-pink-500" /> Idade da Criança
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: 2 anos" 
                      value={userInput.age}
                      onChange={(e) => setUserInput({...userInput, age: e.target.value})}
                      className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all font-medium text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                      <Sparkles className="w-4 h-4 text-pink-500" /> Detalhes Marcantes
                    </label>
                    <textarea 
                      placeholder="Ex: Cabelos cacheados, usa óculos, franjinha..."
                      rows={3}
                      value={userInput.features}
                      onChange={(e) => setUserInput({...userInput, features: e.target.value})}
                      className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all font-medium resize-none text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => userInput.childPhoto && setStep(2)}
                  disabled={!userInput.childPhoto}
                  className={`flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold shadow-xl transition-all ${
                    userInput.childPhoto 
                      ? 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95 shadow-pink-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Próximo Passo <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Theme & Style */}
        {step === 2 && (
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border-b-8 border-blue-100">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">Passo 2</span>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Qual o tema e estilo?</h2>
                <p className="text-gray-500 mt-2">Personalize a atmosfera da sua festa.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 ml-1">Referência de Tema (Opcional)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(e, 'theme')}
                      className="hidden" 
                      id="theme-upload" 
                    />
                    <label 
                      htmlFor="theme-upload"
                      className={`flex flex-col items-center justify-center h-64 border-4 border-dashed rounded-[32px] cursor-pointer transition-all ${
                        userInput.themePhoto 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {userInput.themePhoto ? (
                        <img 
                          src={`data:image/jpeg;base64,${userInput.themePhoto}`} 
                          alt="Tema" 
                          className="w-full h-full object-cover rounded-[28px]" 
                        />
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-blue-500" />
                          </div>
                          <span className="text-gray-400 font-medium">Carregar Referência</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 ml-1">Estilo da Ilustração</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setUserInput({...userInput, style: '2D'})}
                        className={`py-4 px-2 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                          userInput.style === '2D' 
                            ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-100' 
                            : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <ImageIcon className="w-5 h-5" />
                        Cartoon 2D
                      </button>
                      <button
                        onClick={() => setUserInput({...userInput, style: '3D'})}
                        className={`py-4 px-2 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                          userInput.style === '3D' 
                            ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-100' 
                            : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <Cuboid className="w-5 h-5" />
                        Estilo 3D Pixar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 ml-1">Tom do Visual</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Fofo', 'Aventureiro', 'Mágico', 'Divertido'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setUserInput({...userInput, tone: t})}
                          className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                            userInput.tone === t 
                              ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-100' 
                              : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-full font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Voltar
                </button>
                <button 
                  onClick={startAnalysis}
                  className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-lg font-bold shadow-xl shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
                >
                  Analisar Magia <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Result & Confirmation */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-gray-800">
                {isConfirmed ? "Seu Kit de Festa Mágica" : "Confirme os Detalhes"}
              </h2>
              <p className="text-gray-500 mt-3 text-lg">
                Estilo <span className="font-bold text-pink-500">{userInput.style}</span> • Tema <span className="font-bold text-blue-500">{userInput.tone}</span>
              </p>
              
              {/* AI ANALYSIS DISPLAY */}
              <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-[32px] p-6 shadow-inner border border-white/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Search className="w-20 h-20 text-indigo-500" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6 relative">
                    <div className="bg-indigo-500 p-2 rounded-lg">
                      <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Análise da IA</h3>
                    {isAnalyzing && (
                      <span className="flex items-center gap-2 text-xs font-bold text-indigo-500 animate-pulse ml-auto bg-indigo-100 px-3 py-1 rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin" /> ANALISANDO...
                      </span>
                    )}
                    {!isAnalyzing && !isConfirmed && (
                      <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                         Revisão Necessária
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left relative">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        <Baby className="w-3 h-3" /> A Criança
                      </span>
                      {analysis ? (
                        <div className="relative group/edit">
                          <textarea
                            disabled={isConfirmed}
                            value={analysis.childDesc}
                            onChange={(e) => setAnalysis({...analysis, childDesc: e.target.value})}
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-200 rounded-lg p-2 text-gray-700 leading-relaxed font-medium resize-none transition-all"
                            rows={3}
                          />
                          {!isConfirmed && <Edit3 className="w-4 h-4 absolute top-2 right-2 text-gray-300 pointer-events-none" />}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Atmosfera do Tema
                      </span>
                      {analysis ? (
                        <div className="relative group/edit">
                          <textarea
                            disabled={isConfirmed}
                            value={analysis.themeDesc}
                            onChange={(e) => setAnalysis({...analysis, themeDesc: e.target.value})}
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-pink-200 rounded-lg p-2 text-gray-700 leading-relaxed font-medium resize-none transition-all"
                            rows={3}
                          />
                          {!isConfirmed && <Edit3 className="w-4 h-4 absolute top-2 right-2 text-gray-300 pointer-events-none" />}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isConfirmed && analysis && !isAnalyzing && (
                    <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-500">
                      <p className="text-xs text-gray-400 mb-4 text-center">
                        <Info className="w-3 h-3 inline mr-1" /> Você pode editar as descrições acima para ajustar o resultado.
                      </p>
                      <button
                        onClick={confirmAndGenerate}
                        className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-full text-lg font-bold shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                      >
                        Confirmar e Ver Kit <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl max-w-md mx-auto flex items-center gap-3">
                  <Info className="w-5 h-5" />
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}
            </div>

            {isConfirmed && (
              <KitGallery 
                items={kitItems} 
                onRetry={handleRetry} 
                onGenerate={(item) => analysis && generateSingleItem(item, analysis.childDesc, analysis.themeDesc)} 
              />
            )}

            {isConfirmed && kitItems.every(item => item.status === 'completed') && (
              <div className="bg-white p-8 rounded-[40px] shadow-lg border-2 border-pink-50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-pink-100 p-3 rounded-2xl">
                    <PartyPopper className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Tudo Pronto!</h4>
                    <p className="text-sm text-gray-500">Salve suas imagens e crie uma festa inesquecível.</p>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="px-10 py-4 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  Criar Outro Kit
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 px-6 bg-white/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-gray-400 text-sm font-medium mb-4">© 2024 Festa Mágica - Tecnologia e Magia</p>
          <div className="text-center">
            <p className="text-gray-400 leading-relaxed font-normal" style={{ fontSize: '11px', maxWidth: '800px' }}>
              Segurança e Direitos Autorais: Nossa IA analisa temas de forma genérica para respeitar a propriedade intelectual. Gere cada item individualmente para criar seu kit personalizado.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
