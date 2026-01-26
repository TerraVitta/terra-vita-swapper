import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import "./Chatbot.css";

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const GEMINI_API_KEY = "AIzaSyDbME4-8Tjj3tODyQPbdCKDCGr00s6zsIM";

interface ChatbotProps {
  onClose?: () => void;
}

export const Chatbot = ({ onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(0);
  const startHeight = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (userMessage: string): Promise<string | null> => {
    try {
      const systemPrompt = `You are ShopBuddy, a helpful eco-friendly shopping assistant. Keep responses to 2-3 sentences max. Help users find sustainable products and answer about eco-shopping.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', response.status, errorData);
        return null;
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      
      return null;
    } catch (error) {
      console.error('Gemini API request failed:', error);
      return null;
    }
  };

  const getRandomFallback = (): string => {
    const fallbacks = [
      "I'm here to help you find sustainable products! What category interests you? 🌱",
      "Tell me what you're looking for and I'll help you find eco-friendly options! 💚",
      "Great question! Our sustainable products range from clothing to home goods. What would you like to explore?",
      "I love your interest in eco-friendly shopping! Which product category interests you most?",
      "Welcome to EcoMart! I'm here to help you shop sustainably. What can I assist you with today?",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startWidth.current = width;
    startHeight.current = height;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const deltaX = e.clientX - startX.current;
      const deltaY = e.clientY - startY.current;
      
      const newWidth = Math.max(40, startWidth.current + (deltaX / window.innerWidth) * 100);
      const newHeight = Math.max(30, startHeight.current + (deltaY / window.innerHeight) * 100);
      
      setWidth(Math.min(100, newWidth));
      setHeight(Math.min(100, newHeight));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [width, height]);

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || loading) return;
    
    const userMsg: Message = {
      text: messageText,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      console.debug('Chatbot: Calling Gemini API directly with message:', messageText);
      
      let reply = await callGeminiAPI(messageText);
      
      if (!reply) {
        reply = getRandomFallback();
        console.log('Using fallback response');
      }

      setMessages(prev => [...prev, {
        text: reply!,
        sender: 'bot'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        text: getRandomFallback(),
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  if (isMinimized) {
    return (
      <div className="terminal-minimized">
        <button 
          onClick={() => setIsMinimized(false)}
          className="terminal-minimize-button"
        >
          Terra Vitta AI
        </button>
      </div>
    );
  }

  const containerStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${width}vw`,
    height: `${height}vh`,
    zIndex: 9999,
  };

  return (
    <div 
      ref={containerRef}
      className="terminal-container glass"
      style={containerStyle}
    >
      {/* Toolbar */}
      <div className="terminal_toolbar">
        <div className="butt">
          <button className="btn btn-red" onClick={onClose} title="Close"></button>
          <button className="btn btn-yellow" onClick={() => setIsMinimized(true)} title="Minimize"></button>
          <button className="btn btn-green" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Windowed" : "Fullscreen"}></button>
        </div>
        <p className="user">Terra Vitta AI</p>
        <div className="add_tab">+</div>
      </div>

      {/* Body with Messages */}
      <div className="terminal_body">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="terminal_promt">
              <span className="terminal_user">shopbuddy@ecomart:</span>
              <span className="terminal_location">~</span>
              <span className="terminal_bling">$ ask me anything about sustainable products</span>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="message-line">
                {msg.sender === 'user' ? (
                  <>
                    <span className="terminal_user">you@ecomart:</span>
                    <span className="terminal_bling"> {msg.text}</span>
                  </>
                ) : (
                  <>
                    <span className="terminal_user">shopbuddy@ecomart:</span>
                    <span className="terminal_location"> {msg.text}</span>
                  </>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="terminal_promt">
              <span className="terminal_user">shopbuddy@ecomart:</span>
              <span className="terminal_cursor"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Footer */}
      <div className="terminal_input_footer">
        <form onSubmit={handleSubmit} className="input-form">
          <span className="terminal_user">you@ecomart:</span>
          <span className="terminal_location">~</span>
          <span className="terminal_bling">$</span>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=" Type your question..."
            disabled={loading}
            className="terminal-input"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="sm"
            className="terminal-send-btn"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Resize Handle */}
      {!isFullscreen && (
        <div 
          className="resize-handle"
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
      )}
    </div>
  );
};

