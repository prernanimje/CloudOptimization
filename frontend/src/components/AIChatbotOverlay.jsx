import React, { useState, useRef } from 'react';
import { Send, X, Bot, User, Paperclip, FileText, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateGeminiResponse } from '../services/gemini';
import { uploadAPI } from '../api';
import './AIChatbotOverlay.css';

const AIChatbotOverlay = ({ isOpen, onClose, selectedInstance }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your Real-Time Cloud Optimization AI. How can I assist you with your cloud infrastructure today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState(null);
    const [rawFile, setRawFile] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRawFile(file);
        setAttachmentName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            setAttachment(event.target.result);
        };
        reader.readAsText(file);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !attachment) || isTyping) return;

        // Add user message
        const userMessage = input.trim();
        const newMessages = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        // Fetch AI response
        let responseText = '';
        let uploadInfo = '';

        if (rawFile) {
            try {
                const uploadResult = await uploadAPI.uploadCSV(rawFile);
                uploadInfo = `\n\n✅ **System Note:** Successfully processed and stored "${attachmentName}" in the database. Updated ${uploadResult.instances_updated} and created ${uploadResult.instances_created} instances.`;
            } catch (err) {
                uploadInfo = `\n\n⚠️ **System Note:** Failed to store the file in the database. ${err.message}`;
            }
        }

        let geminiResponse = '';
        try {
            geminiResponse = await generateGeminiResponse(userMessage, selectedInstance, attachment);
        } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('429') || errMsg.includes('Quota exceeded')) {
                geminiResponse = "⚠️ **Free Tier Limit Reached**\n\nGoogle Gemini's free API quota has been completely exhausted. Please wait a few seconds before sending another message, or upgrade your API key.";
            } else {
                geminiResponse = "⚠️ **AI Connection Error**\n\nFailed to reach the AI service. Please try again or check your network.";
            }
            console.warn("Chatbot graceful catch:", err);
        }

        responseText = geminiResponse + uploadInfo;

        setRawFile(null);
        setAttachment(null);
        setAttachmentName(null);
        if (fileInputRef.current) fileInputRef.current.value = null;

        setIsTyping(false);
        setMessages((prev) => [...prev, { role: 'assistant', text: responseText }]);
    };

    return (
        <>
            {/* Invisible backdrop to catch clicks outside the chatbot */}
            <div
                className="fixed inset-0 z-[90]"
                onClick={onClose}
            ></div>

            <div
                className="chatbot-container shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="chatbot-header">
                    <div className="flex items-center gap-2">
                        <Bot size={24} className="text-white/80" />
                        <h3 className="font-semibold text-lg text-white">AI Optimizer Assistant</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="chatbot-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="chatbot-messages-area hide-scrollbar">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            <div className={`chatbot-avatar ${msg.role === 'user' ? 'user-avatar' : 'assistant-avatar'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div
                                className={`chatbot-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}
                            >
                                {msg.role === 'user' ? (
                                    msg.text
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            ul: ({ node, ...props }) => <ul className="chatbot-markdown-ul" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="chatbot-markdown-ol" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="chatbot-markdown-strong" {...props} />,
                                            h1: ({ node, ...props }) => <h1 className="chatbot-markdown-h1" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="chatbot-markdown-h2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="chatbot-markdown-h3" {...props} />,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="chatbot-avatar assistant-avatar">
                                <Bot size={16} />
                            </div>
                            <div className="assistant-bubble typing-indicator">
                                <span></span>
                                <span className="delay-1"></span>
                                <span className="delay-2"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="chatbot-input-area">
                    {attachmentName && (
                        <div className="chatbot-attachment-badge">
                            <FileText size={14} className="text-purple-500" />
                            <span className="truncate flex-1">Attached: {attachmentName}</span>
                            <button
                                onClick={() => { setAttachment(null); setAttachmentName(null); if (fileInputRef.current) fileInputRef.current.value = null; }}
                                className="hover:opacity-70"
                                type="button"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="file"
                            accept=".csv,.txt,.json,.log"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="chatbot-attachment-btn"
                            title="Attach CSV/Text File"
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask NeuroNest..."
                            className="chatbot-input-field"
                        />
                        <button
                            type="submit"
                            disabled={(!input.trim() && !attachment) || isTyping}
                            className="chatbot-send-btn"
                        >
                            <Send size={18} className="ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AIChatbotOverlay;
