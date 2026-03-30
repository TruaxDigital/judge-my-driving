import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Send, LifeBuoy, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import EscalateDialog from '@/components/support/EscalateDialog';

const AGENT_NAME = 'customer_support';

export default function Support() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const bottomRef = useRef(null);

  // Create conversation on mount
  useEffect(() => {
    base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: 'Support Chat' },
    }).then(conv => {
      setConversation(conv);
      setMessages(conv.messages || []);
    });
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  const isThinking = messages.length > 0 && messages[messages.length - 1]?.role === 'user';

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Support</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Ask anything — I'll answer or connect you with our team.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-2 text-muted-foreground"
          onClick={() => setEscalateOpen(true)}
        >
          <LifeBuoy className="w-4 h-4" />
          Contact Support
        </Button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {/* Welcome message */}
        {visibleMessages.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">👋 Hi{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! How can I help?</p>
            <p className="text-sm text-muted-foreground">I can answer questions about your stickers, plan, feedback, fleet dashboard, and more. If I can't resolve it, I'll connect you with our team.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'How do I get a replacement sticker?',
                'How does feedback work?',
                'What plan is right for me?',
                'How do I add more vehicles?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-muted hover:bg-muted/80 text-foreground rounded-lg px-3 py-1.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isThinking && (
          <div className="flex gap-2 items-center text-muted-foreground text-sm px-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] max-h-32"
            rows={1}
            placeholder="Ask a question…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!conversation || sending}
          />
          <Button
            size="icon"
            className="h-11 w-11 rounded-xl shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || !conversation || sending}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Need to speak with someone?{' '}
          <button className="underline hover:text-foreground" onClick={() => setEscalateOpen(true)}>
            Submit a support ticket
          </button>
        </p>
      </div>

      <EscalateDialog open={escalateOpen} onClose={() => setEscalateOpen(false)} user={user} />
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-border text-foreground'
      }`}>
        {isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>
              ),
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}