import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Mic, Send, X, Minimize2, Maximize2, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  products?: any[];
}

export const FloatingAIControl = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ message: input })
        }
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: data.message,
        isBot: true,
        products: data.products
      }]);
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(`receipts/${Date.now()}-${file.name}`, file);

      if (error) throw error;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ 
            filePath: data.path
          })
        }
      );

      if (!response.ok) throw new Error('Receipt scanning failed');
      
      const result = await response.json();
      
      handleSend("I've scanned this receipt. Here are some eco-friendly alternatives:", result.matchedProducts);
    } catch (error) {
      toast.error("Failed to process the receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="floating-ai-control"
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      animate={isExpanded ? { width: "400px", height: "600px" } : { width: "320px", height: "60px" }}
      style={{ x: position.x, y: position.y }}
      onDragEnd={(_, info) => {
        setPosition(prev => ({
          x: prev.x + info.offset.x,
          y: prev.y + info.offset.y
        }));
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto mb-4 space-y-4 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2lg ${
                      msg.isBot
                        ? "bg-glass-background"
                        : "bg-emerald text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {msg.products && (
                      <div className="mt-2 space-y-2">
                        {msg.products.map((product: any, index: number) => (
                          <div key={index} className="text-xs glass p-2 rounded-lg">
                            {product.name} - ${product.price}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Camera className="w-5 h-5" />
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <input
                type="text"
                className="glass-input flex-1 text-sm"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="glass-input flex-1 text-sm"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};