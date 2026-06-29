import React, { useState, useRef, useEffect } from 'react';
import { useMedia } from '../context/MediaContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'error';
  content: string;
}

const SangitkarChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const { serviceItems, mediaItems } = useMedia();

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const buildSystemPrompt = () => {
    const servicesList = serviceItems
      .map((s) => `- ${s.name}${s.gujarati ? ` (${s.gujarati})` : ''}: ${s.desc}`)
      .join('\n');

    const galleryList = mediaItems
      .slice(0, 20)
      .map((m) => `- ${m.title}${m.gujaratiTitle ? ` (${m.gujaratiTitle})` : ''} [${m.type}]${m.description ? `: ${m.description}` : ''}`)
      .join('\n');

    return `You are 'Sangitkar AI', a warm, devotional, and highly knowledgeable musical assistant representing Dhrumil Shah (Jain Sangitkar), based in Ahmedabad, India. Help visitors understand Jain hymns/stavans, recommend specific devotional Indian ragas for pujas, draft family spiritual invites, answer questions about Dhrumil Shah's actual services and media gallery (using the live data below), and translate/explain traditional meanings in a mix of elegant English, Gujarati, and Hindi. Tone must remain humble, serene, and traditional. Begin with 'Jai Jinendra' or 'Pranam' when appropriate.

Use the following live website data to answer accurately. Do not invent services, prices, or media that are not listed here — if asked about something not listed, politely say it isn't currently offered/listed and suggest contacting Dhrumil Shah directly.

=== IDENTITY & ABOUT ===
Dhrumil Shah is a professional Jain Sangitkar specializing in devotional music, spiritual events, and traditional Jain musical performances. He brings deep devotion and melodic expertise to elevate spiritual gatherings.
Common questions: "Who is Dhrumil Shah?", "What is Jain Sangitkar?", "Tell me about the artist."

=== SPECIALIZATION ===
Dhrumil Shah specializes in traditional and contemporary Jain Stavans, corporate or private spiritual gatherings, and custom musical performances tailored to the specific rituals of Jainism, blending classical melody with profound devotion.
Common questions: "What is your musical expertise?", "What instruments or music styles do you use?", "Do you perform traditional Jain stavans?"

=== SERVICES OFFERED (General Overview) ===
He offers professional musical services for various Jain religious and social events, including Bhakti Sandhya, Snatra Puja musical accompaniments, Diksha Mahotsav events, Paryushan Pravachan musical support, and general Jain devotional singing (Bhajan Sandhya).
Common questions: "What services do you provide?", "What kind of events do you perform at?", "Can I book you for a religious function?"

=== CURRENT RELIGIOUS MUSICAL SERVICES (live from website) ===
${servicesList || 'No services currently listed.'}

=== CURRENT MEDIA GALLERY HIGHLIGHTS (live from website) ===
${galleryList || 'No media items currently listed.'}

=== BOOKING & CONTACT INFO ===
- Website: https://dhrumil-sangitkar.vercel.app/
- Phone: 7383950244 / 8320412371
- Address: 4/12, Priyanka Flat, Vasna, Ahmedabad, India
- Email: dhrumilsangitkar@gmail.com
- WhatsApp booking: encourage visitors to use the "Send Booking Details via WhatsApp" form on the website's Contact section for formal bookings.
- For a custom quote: ask the visitor to share their event date, type, location, and specific musical requirements.
Common questions: "How can I book an event?", "How do I contact Dhrumil Shah?", "Where can I get a quote?"

=== BEHAVIOR RULES ===
- If asked something completely unrelated to Dhrumil Shah, Jain music, or spiritual events, politely say: "I can only assist with questions about Dhrumil Shah and his devotional music services. Jai Jinendra!"
- Always guide booking-related questions to the Contact/Inquiry Form on the website or the phone numbers above.
- Never invent prices, availability, or services not listed here.
- Use "Jai Jinendra" as a greeting and "Pranam" for respectful closings when appropriate.`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const system = buildSystemPrompt();

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system,
          messages: [
            ...messages.filter((m) => m.role !== 'error').map((m) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content,
            })),
            { role: 'user', content: text },
          ],
        }),
      });
      const data = await resp.json();
      const aiText = data.content?.[0]?.text || 'Pranam! I could not process that. Please try again.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', content: aiText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'error',
          content: 'Pranam! I experienced a temporary network delay. Let\'s try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-royal-950 border-2 border-gold-500 text-royal-950 shadow-2xl shadow-gold-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-all duration-300 animate-pulse-ring overflow-hidden"
        title="Sangitkar AI Assistant"
      >
        {open ? <i className="fas fa-times text-gold-400 text-xl" /> : <img src="/jain-om-symbol.png" alt="Jain Om" className="w-12 h-12 object-contain" />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-royal-900 border border-gold-500/30 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-700 to-gold-500 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-royal-950/30 flex items-center justify-center text-royal-950 font-cinzel font-bold text-xs border border-royal-950/20">
            ds
          </div>
          <div>
            <h4 className="text-royal-950 font-bold text-sm font-cinzel">Sangitkar AI</h4>
            <p className="text-royal-950/70 text-[10px]">Devotional Music Assistant</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Welcome */}
        {messages.length === 0 && (
          <div className="px-4 py-3 bg-royal-950/30 border-b border-gold-500/10">
            <p className="text-[11px] text-slate-400">
              🙏 Jai Jinendra! Ask me about Jain stavans, raga recommendations for your puja, or get help drafting a spiritual invite.
            </p>
          </div>
        )}

        {/* Messages */}
        <div ref={historyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-modal-scrollbar min-h-0" style={{ maxHeight: '45vh' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-full bg-royal-800 border border-gold-500/40 flex items-center justify-center text-[10px] text-gold-400 shrink-0">
                  ds
                </div>
              )}
              <div
                className={`max-w-[85%] text-xs px-3 py-2.5 rounded-2xl leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold-500 text-royal-950 rounded-tr-none font-medium'
                    : msg.role === 'error'
                    ? 'bg-royal-900 border border-gold-500/10 text-rose-400 rounded-tl-none'
                    : 'bg-royal-900 border border-gold-500/10 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-royal-800 border border-gold-500/40 flex items-center justify-center text-[10px] text-gold-400 shrink-0">ds</div>
              <div className="bg-royal-900 border border-gold-500/10 text-gold-500 px-3 py-2.5 rounded-2xl rounded-tl-none text-xs">
                <i className="fas fa-circle-notch animate-spin mr-2" />Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gold-500/10 bg-royal-950/50">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Ask about Jain music..."
              className="flex-1 bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 text-xs focus:border-gold-500 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-gold-500 hover:bg-gold-400 text-royal-950 rounded-lg flex items-center justify-center transition disabled:opacity-50 shrink-0"
            >
              <i className="fas fa-paper-plane text-xs" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SangitkarChatbot;