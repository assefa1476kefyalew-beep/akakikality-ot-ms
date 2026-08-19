import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Minimize2, Maximize2, Trash2, RefreshCw, MessageSquare, ShieldCheck, CornerDownLeft, HelpCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    label: 'Ethiopian OT Rates (1156/2019)',
    prompt: 'What are the legal overtime multipliers under Ethiopian Labor Proclamation 1156/2019 for day, night, weekend, and public holidays?',
  },
  {
    label: 'Night Shift Rules (22:00 - 06:00)',
    prompt: 'Explain the 1.75x night overtime multiplier between 10:00 PM and 6:00 AM and how night shifts are scheduled.',
  },
  {
    label: '20-Hour Monthly Limit Policy',
    prompt: 'What happens when an employee exceeds the 20-hour monthly overtime threshold at Akaki Kality plant?',
  },
  {
    label: 'Payroll OT Calculation Formula',
    prompt: 'Show me the step-by-step mathematical formula for calculating gross overtime payment from base monthly salary.',
  },
  {
    label: 'የኢትዮጵያ የትርፍ ሰዓት ክፍያ ህግ (አማርኛ)',
    prompt: 'በኢትዮጵያ የስራ ህግ አዋጅ 1156/2019 መሰረት የቀን፣ የማታ፣ የእረፍት ቀን እና የበዓላት የትርፍ ሰዓት ክፍያ ተመን ስንት ነው?',
  },
  {
    label: 'Seera Kaffaltii Hojii Dabalataa (Afaan Oromoo)',
    prompt: 'Labsii Hojjetaa fi Hojjechiisaa Itoophiyaa 1156/2019 bu\'uureffachuun kaffaltiin hojii dabalataa akkamitti shallagama?',
  },
];

function getClientExpertReply(message: string, language: string = 'en'): string {
  const lowerMsg = message.toLowerCase();

  // Amharic
  if (
    language === 'am' ||
    lowerMsg.includes('ትርፍ') ||
    lowerMsg.includes('አዋጅ') ||
    lowerMsg.includes('ክፍያ') ||
    lowerMsg.includes('ማታ') ||
    lowerMsg.includes('ቀን') ||
    lowerMsg.includes('በዓል') ||
    lowerMsg.includes('ሰዓት') ||
    lowerMsg.includes('ህግ')
  ) {
    if (lowerMsg.includes('ተመን') || lowerMsg.includes('ክፍያ') || lowerMsg.includes('ህግ') || lowerMsg.includes('አዋጅ') || lowerMsg.includes('1156')) {
      return `### በኢትዮጵያ የስራ ህግ አዋጅ ቁጥር 1156/2019 መሰረት የትርፍ ሰዓት ተመኖች፡

1. **የቀን ትርፍ ሰዓት (ከጠዋቱ 12:00 እስከ ማታ 4:00)**: ከመደበኛው የሰዓት ክፍያ **1.50 እጥፍ (1.5x)**
2. **የማታ ትርፍ ሰዓት (ከማታ 4:00 እስከ ንጋቱ 12:00)**: ከመደበኛው የሰዓት ክፍያ **1.75 እጥፍ (1.75x)**
3. **የሳምንት እረፍት ቀን (እሁድ/የእረፍት ቀን)**: ከመደበኛው የሰዓት ክፍያ **2.00 እጥፍ (2.0x)**
4. **የህዝብ ብሔራዊና ሃይማኖታዊ በዓላት**: ከመደበኛው የሰዓት ክፍያ **2.50 እጥፍ (2.5x)**

**የአቃቂ ቃሊቲ ፋብሪካ ህግጋት፡**
- አንድ ሰራተኛ በወር ውስጥ ከ **20 ሰዓት** በላይ ትርፍ ሰዓት መስራት አይችልም (ያለ HR ፍቃድ)።
- መደበኛ የስራ ሰዓት በሳምንት 48 ሰዓት ነው።`;
    }

    return `### የአቃቂ ቃሊቲ AI የትርፍ ሰዓት ረዳት
- **የቀን ትርፍ ሰዓት**: 1.50x
- **የማታ ትርፍ ሰዓት (22:00 - 06:00)**: 1.75x
- **የእረፍት ቀን ትርፍ ሰዓት**: 2.00x
- **የበዓል ቀን ትርፍ ሰዓት**: 2.50x
- **ወርሃዊ ጣሪያ**: 20 ሰዓት በወር

ተጨማሪ ማብራሪያ ወይም የደመወዝ ስሌት ይፈልጋሉ?`;
  }

  // Afaan Oromoo
  if (
    language === 'om' ||
    lowerMsg.includes('hojii dabalataa') ||
    lowerMsg.includes('labsii') ||
    lowerMsg.includes('kaffaltii') ||
    lowerMsg.includes('halkan')
  ) {
    return `### Labsii Hojjetaa fi Hojjechiisaa Itoophiyaa Lakk. 1156/2019:
1. **Hojii Dabalataa Guyyaa (06:00 - 22:00)**: **1.50x**
2. **Hojii Dabalataa Halkan (22:00 - 06:00)**: **1.75x**
3. **Guyyaa Boqonnaa (Dilbata)**: **2.00x**
4. **Guyyoota Ayyaanaa**: **2.50x**
- Daangaan hojii dabalataa ji'atti sa'aatii 20 dha.`;
  }

  // English Rates
  if (
    lowerMsg.includes('rate') ||
    lowerMsg.includes('multiplier') ||
    lowerMsg.includes('proclamation') ||
    lowerMsg.includes('1156') ||
    lowerMsg.includes('labor') ||
    lowerMsg.includes('law')
  ) {
    return `### Ethiopian Labour Proclamation No. 1156/2019 Overtime Rates:

1. **Standard Day Overtime (06:00 - 22:00)**
   - **Multiplier**: **1.50x** regular hourly wage.
   - For daytime hours worked beyond standard scheduled hours.

2. **Night Shift Overtime (22:00 - 06:00)**
   - **Multiplier**: **1.75x** regular hourly wage.
   - For night operations performed between 10:00 PM and 6:00 AM.

3. **Weekly Rest Day Overtime (Sunday / Assigned Rest Day)**
   - **Multiplier**: **2.00x** regular hourly wage.
   - Applies to employees working during designated rest days.

4. **Public National & Religious Holidays**
   - **Multiplier**: **2.50x** regular hourly wage.
   - Mandatory statutory rate for recognized public holidays.

*Plant Policy: Strict 20-hour monthly overtime cap per employee.*`;
  }

  if (lowerMsg.includes('formula') || lowerMsg.includes('calculate') || lowerMsg.includes('payroll')) {
    return `### Overtime Payroll Calculation Formula:

1. **Base Hourly Rate**:
   $$\\text{Hourly Rate} = \\frac{\\text{Monthly Base Salary}}{208 \\text{ monthly hours}}$$

2. **Gross Overtime Pay**:
   $$\\text{OT Pay} = \\text{Hourly Rate} \\times \\text{OT Multiplier} \\times \\text{OT Hours}$$

**Example:**
- Base Salary: 14,560 ETB (Hourly rate = 70 ETB/hr)
- 10 hours Night OT (1.75x): $70 \\times 1.75 \\times 10 = \\mathbf{1,225\\text{ ETB}}$.`;
  }

  if (lowerMsg.includes('limit') || lowerMsg.includes('20') || lowerMsg.includes('threshold')) {
    return `### Akaki Kality 20-Hour Monthly Overtime Limit:
- **Maximum Limit**: Capped at **20 OT hours per month** for employee health and fatigue prevention.
- **Alert Flags**: System triggers amber warning indicators upon reaching 20 hours.
- **HR Override**: Higher hours require prior formal approval from the HR & Plant Operations Director.`;
  }

  return `### Akaki Kality Mesob Industrial AI Copilot

I can assist with:
- **Ethiopian Labor Proclamation 1156/2019 Rates**: Day (1.5x), Night (1.75x), Weekend (2.0x), Holiday (2.5x)
- **Akaki Kality Shift Rosters**: Shifts A (06-14h), B (14-22h), and C (22-06h)
- **Overtime Calculations**: Base hourly rates and gross pay breakdowns
- **Multilingual Support**: English, አማርኛ (Amharic), and Afaan Oromoo.`;
}

interface AIChatBotProps {
  darkMode?: boolean;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ darkMode }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('akc_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `**Hello!** I am the **Akaki Kality AI Shift & Overtime Copilot**.\n\nI can help you with:\n- **Ethiopian Labor Law Proclamation 1156/2019** overtime rates *(Day: 1.5x, Night: 1.75x, Weekend: 2.0x, Holiday: 2.5x)*\n- Factory shift rotation and 20-hour monthly overtime limits\n- Overtime salary calculation & payroll reports\n- Multi-language support in **English**, **አማርኛ**, and **Afaan Oromoo**.\n\nHow can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('akc_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Format history for server
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: historyPayload,
          language,
        }),
      });

      let replyContent = '';
      if (res.ok) {
        const data = await res.json();
        replyContent = data.reply || getClientExpertReply(messageContent, language);
      } else {
        replyContent = getClientExpertReply(messageContent, language);
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Network fallback triggered', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: getClientExpertReply(messageContent, language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `Conversation reset. How can I help you with overtime rates, plant shifts, or payroll calculations?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Closed Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center space-x-2.5 bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 px-4 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 border-2 border-white/60 dark:border-slate-800 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          title="Open AI Shift & Overtime Chatbot"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            <Sparkles className="w-3.5 h-3.5 text-white fill-white absolute -top-1.5 -right-1.5 animate-bounce" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black uppercase tracking-wider leading-none">
              AI Assistant
            </span>
            <span className="text-[10px] font-bold opacity-90 leading-tight">
              Labor Law & Shifts
            </span>
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        </button>
      )}

      {/* Open Chat Window */}
      {isOpen && (
        <div
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-[92vw] sm:w-[420px] md:w-[460px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-slate-950 text-amber-400 rounded-xl shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wide">
                    AKC-AMS AI Copilot
                  </h3>
                  <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 text-[9px] font-black rounded uppercase">
                    PROCLAMATION 1156/2019
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-900 leading-tight">
                  Overtime, Shift Policies & Calculations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-900 hover:text-slate-950 hover:bg-amber-400/80 rounded-lg transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-900 hover:text-slate-950 hover:bg-amber-400/80 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-900 hover:text-slate-950 hover:bg-amber-400/80 rounded-lg transition-colors cursor-pointer"
                title="Close Chatbot"
              >
                <X className="w-4 h-4 font-bold" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Questions Carousel */}
              <div className="bg-amber-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 px-3 py-2 flex-shrink-0 overflow-x-auto no-scrollbar">
                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 inline" />
                    <span>Suggestions:</span>
                  </span>
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(qp.prompt)}
                      disabled={isLoading}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/80 text-slate-700 dark:text-slate-200 hover:text-amber-900 dark:hover:text-amber-300 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                          {isUser ? 'You' : 'Akaki AI Assistant'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap font-bold">{msg.content}</p>
                        ) : (
                          <div className="prose prose-xs dark:prose-invert max-w-none text-xs space-y-2 [&_p]:my-1 [&_ul]:my-1.5 [&_li]:my-0.5 [&_h3]:text-xs [&_h3]:font-black [&_h3]:text-amber-600 dark:[&_h3]:text-amber-400 [&_h3]:my-1.5 [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                        Akaki AI Assistant
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span className="font-semibold text-[11px]">Thinking & formulating response...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about overtime rules, night shifts, multipliers..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 p-2.5 rounded-xl transition-all font-black shadow-md cursor-pointer flex-shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-2 px-1">
                  <span>Proclamation No. 1156/2019 compliant</span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 inline" />
                    <span>AI Assistant Active</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
