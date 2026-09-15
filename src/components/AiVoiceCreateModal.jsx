import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2, X, Volume2, Globe, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';

export default function AiVoiceCreateModal({ isOpen, onClose, onArticleCreated }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [tone, setTone] = useState('Editorial, analytical and deeply engaging');
  const [preferredLength, setPreferredLength] = useState('Comprehensive (900 - 1400 words)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const stepTimerRef = useRef(null);

  // Suggested prompts for inspiration
  const SUGGESTIONS = [
    'Research the latest breakthroughs in neuromorphic computing and write an in-depth essay.',
    'Explore the return of calm, quiet computing and digital minimalism in modern workplaces.',
    'Investigate how AI search engines are revolutionizing modern journalism and digital publishing.',
    'Analyze the art of editorial typography in the age of generative user interfaces.'
  ];

  const GENERATION_STEPS = [
    'Listening & processing voice instructions...',
    'Conducting real-time web research via Google Search...',
    'Synthesizing verified facts, insights & pull quotes...',
    'Discovering royalty-free imagery and contextual figures...',
    'Engineering SEO meta tags & AIO direct-answer summary...',
    'Saving article draft into database...'
  ];

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript + ' ';
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev ? `${prev} ${finalStr}`.trim() : finalStr.trim()));
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions or type your prompt below.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
      }
    };
  }, []);

  const toggleListening = () => {
    setError('');
    if (!speechSupported) {
      setError('Voice recognition is not supported on this browser. You can type your topic instructions directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleGenerate = async () => {
    const promptText = (transcript + ' ' + interimTranscript).trim();
    if (!promptText) {
      setError('Please speak or type a topic description for Gemini to research.');
      return;
    }

    // Stop listening
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setIsGenerating(true);
    setError('');
    setGeneratingStep(0);

    // Simulate animated generation pipeline progress
    stepTimerRef.current = setInterval(() => {
      setGeneratingStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const response = await api.generateArticleWithAi({
        topic: promptText,
        voiceTranscript: promptText,
        tone,
        preferredLength
      });

      if (stepTimerRef.current) clearInterval(stepTimerRef.current);

      if (response && response.article) {
        if (onArticleCreated) {
          onArticleCreated(response.article);
        }
        handleClose();
      } else {
        throw new Error('No article returned from AI service.');
      }
    } catch (err) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      console.error('AI generation error:', err);
      setError(err.message || 'Failed to generate article with Gemini. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
    }
    setIsListening(false);
    setIsGenerating(false);
    setTranscript('');
    setInterimTranscript('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-xs text-black dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E5E5E5] dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
                Gemini AI Voice Researcher
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-full">
                  Gemini + Search
                </span>
              </h2>
              <p className="text-xs text-[#666666] dark:text-neutral-400">
                Speak your idea, Gemini will research online, curate images, and draft the article.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isGenerating}
            className="p-1.5 text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors rounded-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Generation Loading State */}
          {isGenerating ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-black/10 dark:border-white/10 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg relative">
                  <Sparkles className="w-8 h-8 text-amber-300 dark:text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">
                  Gemini is Researching & Writing Your Article
                </h3>
                <p className="text-xs text-[#666666] dark:text-neutral-400 transition-all duration-300">
                  {GENERATION_STEPS[generatingStep] || 'Finalizing draft...'}
                </p>
              </div>

              {/* Progress steps indicator */}
              <div className="w-full max-w-sm space-y-2 pt-2 text-left">
                {GENERATION_STEPS.map((step, idx) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                      idx === generatingStep
                        ? 'text-black dark:text-white font-semibold'
                        : idx < generatingStep
                        ? 'text-neutral-400 dark:text-neutral-500 line-through'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  >
                    {idx < generatingStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                    ) : idx === generatingStep ? (
                      <Loader2 className="w-3.5 h-3.5 text-black dark:text-white animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 shrink-0" />
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Voice Interactive Pod */}
              <div className="p-6 bg-neutral-50 dark:bg-neutral-950/60 border border-[#E5E5E5] dark:border-neutral-800 flex flex-col items-center justify-center text-center space-y-4 rounded-xs">
                <div className="relative">
                  {isListening && (
                    <div className="absolute -inset-3 rounded-full bg-red-500/20 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                      isListening
                        ? 'bg-red-600 text-white scale-105 ring-4 ring-red-300 dark:ring-red-900'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
                    }`}
                    title={isListening ? 'Click to stop speaking' : 'Click to start speaking'}
                  >
                    {isListening ? (
                      <MicOff className="w-7 h-7 animate-pulse" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {isListening ? 'Listening to your voice...' : 'Click the microphone to speak'}
                  </p>
                  <p className="text-xs text-[#666666] dark:text-neutral-400">
                    {isListening
                      ? 'Speak clearly about the topic, research questions, or perspective you want explored.'
                      : 'Or type your topic description directly in the field below.'}
                  </p>
                </div>

                {/* Animated sound wave bars when active */}
                {isListening && (
                  <div className="flex items-center gap-1 h-6">
                    {[16, 24, 12, 28, 20, 32, 14, 26, 18, 22].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-600 rounded-full animate-pulse"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.6s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Transcript & Prompt Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Voice Transcript & Research Prompt
                  </label>
                  {(transcript || interimTranscript) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTranscript('');
                        setInterimTranscript('');
                      }}
                      className="text-[11px] text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="E.g., Research the current state of optical neural networks, explore how light is replacing silicon for AI training, contrast speed and energy consumption, and write a thorough editorial essay with analogies and real-world milestones."
                    className="w-full p-3 text-sm bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-sans leading-relaxed resize-y rounded-xs"
                  />
                  {isListening && interimTranscript && (
                    <div className="absolute bottom-2 right-2 text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-mono">
                      Live Transcribing...
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Inspiration Pills */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Quick Topic Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTranscript(s)}
                      className="text-xs text-left px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xs transition-colors cursor-pointer"
                    >
                      + {s.slice(0, 48)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Editorial Options: Tone & Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E5E5] dark:border-neutral-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black dark:text-white">Editorial Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden cursor-pointer rounded-xs"
                  >
                    <option value="Editorial, analytical and deeply engaging">Editorial & Analytical</option>
                    <option value="Philosophical, thoughtful and calm">Philosophical & Reflective</option>
                    <option value="Technical deep dive with code and architectural specs">Technical Deep Dive</option>
                    <option value="Investigative journalism with interviews & data">Investigative Journalism</option>
                    <option value="Conversational, accessible and vivid">Conversational & Clear</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black dark:text-white">Target Depth</label>
                  <select
                    value={preferredLength}
                    onChange={(e) => setPreferredLength(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden cursor-pointer rounded-xs"
                  >
                    <option value="Comprehensive (1000 - 1500 words)">Comprehensive (1,000 - 1,500 words)</option>
                    <option value="Standard Editorial (800 - 1000 words)">Standard (800 - 1,000 words)</option>
                    <option value="Executive Brief (500 - 700 words)">Executive Brief (500 - 700 words)</option>
                  </select>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 rounded-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isGenerating && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-950/80">
            <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-neutral-400">
              <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Includes Google Search grounding & online imagery</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!(transcript || interimTranscript).trim()}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-none rounded-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-amber-500" />
                <span>Research & Create Draft</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
