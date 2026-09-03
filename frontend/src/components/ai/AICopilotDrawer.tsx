'use client';

import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { ChatMessage } from '../../types/ai';
import { Bot, Sparkles, Send, X, RotateCcw, User, Zap, ChevronRight, HelpCircle } from 'lucide-react';

export const AICopilotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '👋 Hi Samruddhi! I am your **FinTrack AI Financial Copilot**.\n\nAsk me anything about your monthly spending, category totals, budget caps, or safe daily limits!'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [followups, setFollowups] = useState<string[]>([
    "How's my financial health score?",
    "Where am I spending the most?",
    "What is my safe daily limit?"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      // Send chat history (up to last 6 messages)
      const res = await aiApi.askCopilot(question, updatedHistory.slice(-6));
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: res.answer
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setFollowups(res.suggested_followups);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered a network error analyzing your request. Please ensure the backend server is running.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 History reset! What financial question can I help you with today?'
      }
    ]);
    setFollowups([
      "How's my financial health score?",
      "Where did I spend most this month?",
      "Suggest category budget caps"
    ]);
  };

  // Helper to format basic markdown text formatting
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Check bullet point
      let trimmed = line.trim();
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
      if (isBullet) {
        trimmed = trimmed.substring(2);
      }

      // Replace bold text **bold**
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }}>
            {renderedParts}
          </li>
        );
      }

      return (
        <p key={idx} style={{ marginBottom: line.trim() === '' ? '0.5rem' : '0.25rem', minHeight: line.trim() === '' ? '0.5rem' : 'auto' }}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem 1.25rem',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Bot size={20} className="animate-pulse" />
        <span>💬 AI Copilot</span>
      </button>

      {/* Floating Glassmorphic Slide-Over Chat Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '5.25rem',
            right: '1.75rem',
            width: 'calc(100vw - 3.5rem)',
            maxWidth: '420px',
            height: '560px',
            maxHeight: 'calc(100vh - 7rem)',
            zIndex: 10000,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  AI Financial Copilot <Sparkles size={14} color="#818cf8" />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  24/7 Context-Aware Financial Assistant
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleClearHistory}
                title="Reset Conversation"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Thread Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.625rem',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8',
                      flexShrink: 0,
                      marginTop: '0.25rem'
                    }}
                  >
                    <Bot size={15} />
                  </div>
                )}

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: msg.role === 'user' ? '#ffffff' : '#e2e8f0',
                    backgroundColor:
                      msg.role === 'user'
                        ? '#4f46e5'
                        : 'rgba(30, 41, 59, 0.85)',
                    border:
                      msg.role === 'user'
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {renderFormattedContent(msg.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: '0.625rem', alignSelf: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8'
                  }}
                >
                  <Bot size={15} />
                </div>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Sparkles size={14} className="animate-spin" color="#818cf8" />
                  Analyzing financial records & drafting advice...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up Quick Chips */}
          {followups && followups.length > 0 && !isLoading && (
            <div
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '0.375rem',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}
            >
              {followups.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    color: '#a5b4fc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>{chip}</span>
                  <ChevronRight size={11} />
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Copilot e.g. How can I save ₹5000?"
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem 0.875rem',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '0.625rem 0.875rem',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AICopilotDrawer;
