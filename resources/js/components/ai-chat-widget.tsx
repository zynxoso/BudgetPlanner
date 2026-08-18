import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Trash2, Lightbulb } from 'lucide-react';
import { getErrorMessage, postJson } from '@/lib/api';

type AiRole = 'user' | 'assistant';

interface AiMessage {
    role: AiRole;
    content: string;
}

interface AiChatResponse {
    status: 'ok' | 'fallback' | 'unavailable';
    reply?: string;
    message?: string | null;
}

const QUICK_PROMPTS = [
    'Where can I cut expenses this month?',
    'What is a safe weekly spending limit?',
    'Summarize my biggest money drains.',
    'Suggest a small savings goal for next month.',
];

const CHAT_STORAGE_KEY = 'budget_planner_ai_chat_messages';
const CHAT_OPEN_KEY = 'budget_planner_ai_chat_open';

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return sessionStorage.getItem(CHAT_OPEN_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const [messages, setMessages] = useState<AiMessage[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [showPrompts, setShowPrompts] = useState(() => messages.length === 0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        try {
            sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch {}
    }, [messages]);

    useEffect(() => {
        try {
            sessionStorage.setItem(CHAT_OPEN_KEY, String(isOpen));
        } catch {}
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, loading]);

    const sendMessage = async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed || loading) {
            return;
        }

        setNotice(null);
        setLoading(true);

        const history = messages.slice(-6);
        const nextHistory = [...history, { role: 'user', content: trimmed }];

        setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
        setInput('');
        setShowPrompts(false);

        try {
            const response = await postJson<AiChatResponse>('/ai/chat', {
                message: trimmed,
                history: nextHistory,
            });

            if (response.reply) {
                const replyText: string = response.reply;
                setMessages((prev) => [...prev, { role: 'assistant', content: replyText }]);
            }

            if (response.status !== 'ok') {
                setNotice(response.message || 'AI assistant is currently offline.');
            }
        } catch (error) {
            setNotice(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setNotice(null);
        setShowPrompts(true);
        try {
            sessionStorage.removeItem(CHAT_STORAGE_KEY);
        } catch {}
    };

    return (
        <>
            {/* Floating Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[520px] max-h-[82vh] rounded-2xl border border-border bg-card/95 backdrop-blur-md flex flex-col overflow-hidden animate-scale-in text-card-foreground">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground leading-none">AI Budget Helper</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">Ask questions about your money</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-muted rounded-lg transition-colors btn-interactive"
                                    title="Clear Chat History"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors btn-interactive"
                                title="Close Chatbot"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 animate-fade-in-up">
                                <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground mb-1 animate-float">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-foreground">How can I help with your money today?</h4>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                                        Ask me about your spending, savings, loans, or monthly budget.
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2.5 animate-fade-in-up ${
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm text-xs mt-0.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line transition-all ${
                                        message.role === 'user'
                                            ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-br-none shadow-sm'
                                            : 'bg-muted/80 border border-border text-foreground rounded-bl-none'
                                    }`}
                                >
                                    {message.content}
                                </div>

                                {message.role === 'user' && (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-foreground text-xs mt-0.5">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-2.5 text-muted-foreground text-xs p-2 animate-fade-in-up">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
                                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                                </div>
                                <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-3 py-2 rounded-xl">
                                    <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-[typingWave_1.2s_infinite_ease-in-out]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-[typingWave_1.2s_infinite_ease-in-out_0.2s]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-[typingWave_1.2s_infinite_ease-in-out_0.4s]" />
                                    <span className="text-[11px] text-muted-foreground ml-1.5">Analyzing your accounts...</span>
                                </div>
                            </div>
                        )}

                        {notice && (
                            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                                {notice}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts Bar */}
                    {(messages.length === 0 || showPrompts) && (
                        <div className="border-t border-border bg-muted/20 p-2.5">
                            <div className="flex items-center justify-between px-1 mb-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3 text-foreground" />
                                    Quick Questions
                                </span>
                                {messages.length > 0 && (
                                    <button 
                                        onClick={() => setShowPrompts(false)}
                                        className="text-[10px] text-muted-foreground hover:text-foreground"
                                    >
                                        Hide
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                {[
                                    'Where am I spending too much?',
                                    'How much can I spend this week?',
                                    'What are my biggest expenses?',
                                    'How much should I save next month?',
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => sendMessage(prompt)}
                                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-left text-[11px] text-foreground transition-all hover:bg-muted hover:border-foreground shadow-2xs"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form Input Footer */}
                    <div className="border-t border-border bg-card p-3">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                sendMessage(input);
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Ask a question about your budget..."
                                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                            />
                            <button
                                type="submit"
                                disabled={loading || input.trim().length === 0}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 font-semibold shadow-sm transition-colors disabled:opacity-40"
                                title="Send Message"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Launcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 border border-zinc-700/40 dark:border-zinc-300 px-4 py-3 transition-colors duration-200 group"
                aria-label="Open AI Assistant"
            >
                <Sparkles className="h-4 w-4" />
                <span className="font-bold text-xs tracking-wide">AI Helper</span>
            </button>
        </>
    );
}
