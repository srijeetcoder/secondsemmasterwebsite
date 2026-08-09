'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const SYSTEM_PROMPT = `You are "Semester 2 Hub AI", an advanced, friendly AI Study Companion for MAKAUT engineering students in their second semester.
Your goal is to help students master the courses, answer questions, explain concepts, write code snippets, solve math problems, and prepare for exams and labs.
Here are the subjects you specialize in:
1. Mathematics-II (BSM 201):
   - Linear Algebra (matrices, determinants, rank, eigen values, Cayley-Hamilton theorem, system of equations).
   - ODEs (first order, higher order linear differential equations, Cauchy-Euler equations).
   - Complex Variables (limit, continuity, derivative, analytic functions, Cauchy-Riemann equations, line integrals).
2. Engineering Chemistry (BSCH 201 & BSCH 291):
   - Chemical bonding, thermodynamics, spectroscopic techniques (UV-Vis, NMR, IR).
   - Practical chemistry labs: Conductometric, pH Metric, Argentometric Mohr's method, and Acid Value of oil titrations.
3. Basic Electrical Engineering (ES-EE 201 & ES-EE 291):
   - AC/DC circuits, resonance, power factor, transformers, three-phase systems, induction and DC motors, power converters.
4. Programming for Problem Solving (ES-CS 201 & ES-CS 291 / Python):
   - Python syntax, loops, lists, sets, dictionaries, conditional flow, functions, file handling, basic sorting algorithms.

When responding:
- Ground your answers in engineering syllabus concepts.
- Use bold text for key terms.
- Use code blocks for Python code or chemical reactions.
- Be encouraging, concise, and structured (use bullet points where helpful).
- Answer questions in a clear, easy-to-digest format.`;

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [tempApiKeyInput, setTempApiKeyInput] = useState('');
  
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string; isError?: boolean }[]>([
    {
      sender: 'assistant',
      text: "Hi! I'm **Semester 2 Hub AI**, your MAKAUT study companion. 📚\n\nAsk me anything about Mathematics-II, Chemistry, Basic Electrical, or Python!"
    }
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_gemini_api_key') || '';
      setUserApiKey(stored);
      setTempApiKeyInput(stored);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, showSettings]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowSettings(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputVal('');
    sendMessage(promptText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = inputVal.trim();
      if (text) {
        setInputVal('');
        sendMessage(text);
      }
    }
  };

  const sendMessage = async (text: string) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text }] }];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      let response;
      if (userApiKey) {
        // Direct call using developer custom API key
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: updatedHistory,
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              }
            })
          }
        );
      } else {
        // Secure call using Next.js backend API proxy (utilizing Vercel env keys)
        response = await fetch(
          '/api/chat',
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: updatedHistory
            })
          }
        );
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Chat service error details:", errorBody);
        throw new Error(`HTTP error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that response. Please try again.";

      setMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
      setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      
      const isKeyInvalid = err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'));
      
      const errorText = isKeyInvalid
        ? "⚠️ **Invalid API Key Detected!**\nThe default API key is invalid or has expired. Please click the **gear settings icon** in the top bar to set your own Gemini API key for free study help."
        : "Failed to connect to the Gemini service. Please check your internet connection or verify your API key.";

      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: errorText, isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Split text by code blocks ```code```
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <pre key={index} className="bg-slate-950 border border-slate-800 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono text-slate-300">
            <code>{code}</code>
          </pre>
        );
      }
      
      const lines = part.split('\n');
      return (
        <React.Fragment key={index}>
          {lines.map((line, lineIndex) => {
            const inlineParts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
            const lineContent = inlineParts.map((subPart, subIndex) => {
              if (subPart.startsWith('`') && subPart.endsWith('`')) {
                return (
                  <code key={subIndex} className="bg-slate-900 px-1 py-0.5 rounded text-sky-400 font-mono text-[11px]">
                    {subPart.slice(1, -1)}
                  </code>
                );
              }
              if (subPart.startsWith('**') && subPart.endsWith('**')) {
                return (
                  <strong key={subIndex} className="font-bold text-white">
                    {subPart.slice(2, -2)}
                  </strong>
                );
              }
              return subPart;
            });

            return (
              <span key={lineIndex} className="block mb-1">
                {lineContent}
              </span>
            );
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher */}
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 z-[9999] hover:bg-sky-500 hover:text-slate-950 hover:border-sky-500 hover:shadow-sky-500/20"
        title="Study Assistant AI"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742h.01m3.99 0h.01m3.99 0h.01M9 21h6a2 2 0 002-2v-4a2 2 0 00-2-2h-3l-4 4v-4H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-[380px] h-[520px] rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden z-[9999] transition-all duration-300 transform ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100 visible' 
            : 'opacity-0 translate-y-4 scale-95 invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Study Assistant AI</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 1.5 Flash
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`text-slate-400 hover:text-sky-400 transition-colors p-1 rounded-lg ${
                showSettings ? 'text-sky-400 bg-slate-800/50' : ''
              }`}
              title="API Key Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onClick={toggleChat}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings View */}
        {showSettings ? (
          <div className="flex-1 p-5 bg-slate-950 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 mb-1">AI Settings</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Provide your own **Gemini API Key** to chat. Your key is stored strictly inside your browser's localStorage and is only sent directly to Google's API.
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gemini API Key</label>
              <input 
                type="password"
                value={tempApiKeyInput}
                onChange={(e) => setTempApiKeyInput(e.target.value)}
                placeholder={userApiKey ? "••••••••••••••••••••••••••••" : "Paste your AIzaSy... API key"}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                You can get a free API key from Google AI Studio. If left blank, it will fall back to the default project key.
              </p>
            </div>
            
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => {
                  const key = tempApiKeyInput.trim();
                  if (key) {
                    localStorage.setItem('user_gemini_api_key', key);
                    setUserApiKey(key);
                  } else {
                    localStorage.removeItem('user_gemini_api_key');
                    setUserApiKey('');
                  }
                  setShowSettings(false);
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition-colors"
              >
                Save Settings
              </button>
              <button 
                onClick={() => {
                  setTempApiKeyInput('');
                  localStorage.removeItem('user_gemini_api_key');
                  setUserApiKey('');
                  setShowSettings(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold px-3 py-2 rounded-lg text-xs transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Message Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col bg-slate-950">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'self-end' : 'self-start'
                  }`}
                >
                  <span className={`text-[10px] text-slate-500 mb-0.5 ${
                    msg.sender === 'user' ? 'self-end' : 'self-start'
                  }`}>
                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <div 
                    className={`p-3 rounded-2xl text-xs line-clamp-none ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-br-none'
                        : msg.isError
                        ? 'bg-rose-500/5 border border-rose-500/20 text-rose-300 rounded-bl-none'
                        : 'bg-sky-500/5 border border-sky-500/10 text-slate-300 rounded-bl-none'
                    }`}
                  >
                    {parseMarkdown(msg.text)}
                    {msg.isError && (
                      <button 
                        onClick={() => setShowSettings(true)}
                        className="mt-2 block bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 font-bold px-2 py-1 rounded text-[10px] transition-colors"
                      >
                        Set API Key
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col max-w-[85%] self-start">
                  <span className="text-[10px] text-slate-500 mb-0.5">Assistant</span>
                  <div className="p-3 rounded-2xl rounded-bl-none bg-sky-500/5 border border-sky-500/10 flex gap-1 items-center w-[70px] h-[36px] justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
              {/* Quick suggestions */}
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <button 
                  onClick={() => handleQuickPrompt("Cayley Hamilton theorem explanation")}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  Cayley Hamilton
                </button>
                <button 
                  onClick={() => handleQuickPrompt("What is Grotthuss proton hopping?")}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  Proton Hopping
                </button>
                <button 
                  onClick={() => handleQuickPrompt("Resonance in RLC circuit formula")}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  RLC Resonance
                </button>
                <button 
                  onClick={() => handleQuickPrompt("Python list vs tuple difference")}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  List vs Tuple
                </button>
              </div>

              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ask a question..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50 transition-colors"
                />
                <button 
                  onClick={() => {
                    const text = inputVal.trim();
                    if (text) {
                      setInputVal('');
                      sendMessage(text);
                    }
                  }}
                  disabled={isLoading || !inputVal.trim()}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:bg-sky-500 hover:text-slate-950 hover:border-sky-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
