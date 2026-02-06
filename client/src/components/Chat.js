import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CodeBlock from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I am your AI Coding Interview Assistant. I can help you with:\n\n• DSA Explanations\n• Code Solutions\n• Debugging\n• Complexity Analysis\n• Mock Interviews\n\nWhat would you like to learn today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat/message', {
        message: input,
        conversationHistory: messages.slice(-6)
      });

      const botMessage = {
        role: 'assistant',
        content: response.data.response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startMockInterview = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/chat/mock-interview', {
        difficulty: 'medium',
        topic: 'general'
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🎯 **Mock Interview Mode**\n\n' + response.data.question
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>🧠 AI Coding Interview Assistant</h1>
        <button onClick={startMockInterview} className="mock-btn">
          🎯 Start Mock Interview
        </button>
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={'message ' + msg.role}>
            <div className="message-content">
              <ReactMarkdown
                components={{
                  code: CodeBlock
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about DSA, request code, or paste code for debugging..."
          rows="3"
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send 🚀
        </button>
      </div>
    </div>
  );
};

export default Chat;