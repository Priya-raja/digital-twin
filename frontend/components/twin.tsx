'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function Twin() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    session_id: sessionId || undefined,
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();

            if (!sessionId) {
                setSessionId(data.session_id);
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            // Refocus the input after message is sent
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Check if avatar exists
    const [hasAvatar, setHasAvatar] = useState(false);
    useEffect(() => {
        // Check if avatar.png exists
        fetch('/avatar.png', { method: 'HEAD' })
            .then(res => setHasAvatar(res.ok))
            .catch(() => setHasAvatar(false));
    }, []);

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 rounded-lg shadow-2xl border-2 border-purple-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white p-6 rounded-t-lg border-b-4 border-yellow-400 shadow-xl">
                <h2 className="text-2xl font-bold flex items-center gap-2 drop-shadow-lg animate-pulse">
                    <Bot className="w-7 h-7" />
                    <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                        Priya's Digital Twin
                    </span>
                </h2>
                <p className="text-sm text-purple-100 mt-2 font-medium">✨ Your AI companion</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-purple-900">
                {messages.length === 0 && (
                    <div className="text-center mt-12">
                        {hasAvatar ? (
                            <img 
                                src="/avatar.png" 
                                alt="Digital Twin Avatar" 
                                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-400 shadow-lg shadow-purple-500/50 animate-pulse"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-yellow-400 shadow-lg shadow-purple-500/50">
                                <Bot className="w-12 h-12 text-white" />
                            </div>
                        )}
                        <p className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Hello! Get to know Priya
                        </p>
                        <p className="text-sm mt-3 text-purple-300 font-medium">💬 Ask me anything about RAG, Agentic AI and AI/ML Deployments !</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0">
                                {hasAvatar ? (
                                    <img 
                                        src="/avatar.png" 
                                        alt="Digital Twin Avatar" 
                                        className="w-8 h-8 rounded-full border-2 border-purple-400 shadow-lg shadow-purple-400/50"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-yellow-300">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className={`max-w-[70%] rounded-lg p-4 shadow-lg ${
                                message.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-2 border-cyan-300 shadow-cyan-500/50'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-purple-400 shadow-purple-500/50'
                            }`}
                        >
                            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                            <p
                                className={`text-xs mt-2 ${
                                    message.role === 'user' ? 'text-cyan-100' : 'text-purple-100'
                                }`}
                            >
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        </div>

                        {message.role === 'user' && (
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-cyan-300">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0">
                            {hasAvatar ? (
                                <img 
                                    src="/avatar.png" 
                                    alt="Digital Twin Avatar" 
                                    className="w-8 h-8 rounded-full border-2 border-purple-400 shadow-lg shadow-purple-400/50"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-yellow-300">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-3 border-2 border-purple-400 shadow-lg shadow-purple-500/50">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t-4 border-purple-500 p-4 bg-gradient-to-r from-slate-900 to-purple-900 rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="✨ Type your message..."
                        className="flex-1 px-4 py-3 bg-slate-800 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-purple-300 font-medium hover:border-pink-400 transition-colors shadow-lg"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-pink-500/50 font-bold border-2 border-yellow-300"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}