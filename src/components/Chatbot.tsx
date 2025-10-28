import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export const Chatbot = () => {
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
    } catch (error) {
      console.error('Chat error:', error);
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

  return (
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
        <div className="btn-wrapper">
          <button 
            className="btn"
            onClick={handleSend}
            disabled={loading}
          >
            <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              ></path>
            </svg>
            <div className="txt-wrapper">
              <div className="txt-1">
                <span className="btn-letter">G</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">n</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">r</span>
                <span className="btn-letter">a</span>
                <span className="btn-letter">t</span>
                <span className="btn-letter">e</span>
              </div>
              <div className="txt-2">
                <span className="btn-letter">G</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">n</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">r</span>
                <span className="btn-letter">a</span>
                <span className="btn-letter">t</span>
                <span className="btn-letter">i</span>
                <span className="btn-letter">n</span>
                <span className="btn-letter">g</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
