import React, { useState, useRef, useCallback } from 'react';
import { EditorState } from '../types';
import { editImageWithGemini } from '../services/geminiService';
import { UploadIcon, MagicWandIcon, XCircleIcon, DownloadIcon } from './Icons';
import LoadingOverlay from './LoadingOverlay';

const PRESET_PROMPTS = [
  "Turn this into a cyberpunk style illustration",
  "Add a beautiful sunset background",
  "Make it look like a Van Gogh painting",
  "Add a retro vintage filter",
  "Make the waves turbulent and the sea rough"
];

const Editor: React.FC = () => {
  const [state, setState] = useState<EditorState>(EditorState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file size (e.g., < 4MB for better API performance, though 2.5 flash can handle more)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large. Please upload an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setOriginalImage(e.target.result as string);
          setOriginalFile(file);
          setState(EditorState.READY);
          setGeneratedImage(null);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setGeneratedImage(null);
    setPrompt("");
    setState(EditorState.IDLE);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !originalFile || !prompt.trim()) return;

    setState(EditorState.GENERATING);
    setError(null);

    // Convert Blob to base64 for API if needed, or just use the DataURL we already have
    // The DataURL in `originalImage` is sufficient.
    
    const result = await editImageWithGemini({
      base64Image: originalImage,
      mimeType: originalFile.type,
      prompt: prompt,
    });

    if (result.success && result.imageUrl) {
      setGeneratedImage(result.imageUrl);
      setState(EditorState.COMPLETE);
    } else {
      setError(result.error || "Failed to generate image.");
      setState(EditorState.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nanocanvas-edited-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePresetClick = (preset: string) => {
    setPrompt(preset);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between animate-fadeIn">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-white"><XCircleIcon /></button>
        </div>
      )}

      {state === EditorState.IDLE ? (
        // Empty State / Upload Area
        <div 
          className="border-2 border-dashed border-slate-700 rounded-3xl h-[60vh] flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-6 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors mb-6 shadow-lg">
            <UploadIcon />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Upload an Image</h3>
          <p className="text-slate-400 mb-8 text-center max-w-md">Click to select a JPEG or PNG file to start editing with AI.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp"
          />
          <button className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-full transition-all shadow-lg shadow-brand-600/20">
            Select File
          </button>
        </div>
      ) : (
        // Editor Interface
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Canvas & Output */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Display Area */}
            <div className="relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden min-h-[400px] flex items-center justify-center group">
              
              <LoadingOverlay isVisible={state === EditorState.GENERATING} />

              {state === EditorState.COMPLETE && generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                   {/* Comparison View Logic could go here, for now just show result */}
                   <img src={generatedImage} alt="Generated result" className="max-w-full max-h-[70vh] object-contain shadow-2xl" />
                   <div className="absolute bottom-4 right-4 flex gap-2">
                     <button onClick={() => setGeneratedImage(null)} className="px-4 py-2 bg-slate-800/90 text-white text-sm rounded-lg hover:bg-slate-700 backdrop-blur-md transition-all">
                       View Original
                     </button>
                     <button onClick={handleDownload} className="px-4 py-2 bg-brand-600/90 text-white text-sm rounded-lg hover:bg-brand-500 backdrop-blur-md transition-all flex items-center gap-2">
                       <DownloadIcon className="w-4 h-4" /> Save
                     </button>
                   </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                   <img src={originalImage!} alt="Original" className="max-w-full max-h-[70vh] object-contain" />
                </div>
              )}
              
              {/* Top Right Controls */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={handleReset} 
                  className="p-2 bg-slate-800/80 text-slate-300 rounded-full hover:bg-red-500/80 hover:text-white transition-all backdrop-blur-md"
                  title="Close and Reset"
                >
                  <XCircleIcon />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Controls */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Describe the edit
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. Make the sky purple, Add a top hat..."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none transition-all"
                disabled={state === EditorState.GENERATING}
              />
              
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Try these</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetClick(p)}
                      className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors text-left truncate max-w-full"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || state === EditorState.GENERATING}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                ${!prompt.trim() || state === EditorState.GENERATING 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-600/25 scale-100 active:scale-95'}
              `}
            >
              {state === EditorState.GENERATING ? (
                <>Processing...</>
              ) : (
                <>
                  <MagicWandIcon />
                  Generate Edit
                </>
              )}
            </button>

            <div className="text-xs text-slate-500 text-center px-4">
              Powered by Gemini 2.5 Flash Image (Nano Banana). 
              <br/>
              Optimized for fast, text-guided image editing.
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;