import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';
import useDashboardStore from '../../store/dashboardStore';

const AIChat = () => {
    const { user } = useDashboardStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: `System Online. Welcome back, ${user.name}. I am ready to assist with code, architecture, or career advice.`, sender: 'ai' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // In a real app, include Auth token header here
            // const config = { headers: { 'x-auth-token': token } }; 

            // Using mock endpoint for now (it doesn't actually require token in the mock file for simplicity, 
            // but in production it would)
            const res = await api.post('/ai/chat', { message: userMsg.text });

            const aiMsg = { id: Date.now() + 1, text: res.data.reply, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
        } catch {
            const errorMsg = { id: Date.now() + 1, text: "Connection interrupted. Server offline.", sender: 'ai', isError: true };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in relative">
            <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
                <Sparkles className="w-64 h-64 text-primary/10" />
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex gap-4 max-w-3xl",
                            msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                            msg.sender === 'user' ? "bg-surface border-border" : "bg-primary/20 border-primary text-primary"
                        )}>
                            {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        <div className={clsx(
                            "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                            msg.sender === 'user'
                                ? "bg-surfaceHighlight text-white rounded-tr-none"
                                : "bg-primary/10 text-gray-200 border border-primary/20 rounded-tl-none",
                            msg.isError && "bg-red-500/10 border-red-500/50 text-red-200"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-4 mr-auto max-w-3xl">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1 p-4 rounded-2xl bg-primary/10 border border-primary/20 rounded-tl-none h-12">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <Card className="p-2 flex items-center gap-2 border-primary/30 shadow-[0_0_15px_rgba(212,242,63,0.1)]">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask guidance from the system..."
                    className="border-none focus:ring-0 bg-transparent text-lg h-12"
                />
                <Button
                    onClick={sendMessage}
                    variant="primary"
                    className="rounded-xl h-12 w-16"
                    disabled={loading}
                >
                    <Send className="w-5 h-5" />
                </Button>
            </Card>
        </div>
    );
};

export default AIChat;
