import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose?: () => void;
};

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const Chatbot = ({ open, onClose }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I help you find sustainable products today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userInput }
      });

      if (error) throw error;

      if (data?.success) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: data.reply,
          isBot: true
        }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        isBot: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="chatbot-panel fixed top-16 right-4 z-50 w-80 max-w-sm">
      <div className="flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-2xl p-5 border border-border/30 shadow-[0_0_25px_hsl(var(--primary)_/_0.3)]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg max-w-[70%] ${
                message.isBot
                  ? "bg-muted/50 text-foreground self-start"
                  : "bg-primary/20 text-foreground self-end ml-auto"
              }`}
            >
              {message.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-muted/20 rounded-xl p-3 border border-primary/50 shadow-[0_0_20px_hsl(var(--primary)_/_0.3)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder="Ask about sustainable products..."
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-primary-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
