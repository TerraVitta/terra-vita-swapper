import { useState } from "react";
import { Send } from "lucide-react";

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

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false
    };
    
    setMessages([...messages, newMessage]);
    setInput("");
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "I'm here to help you shop sustainably! This is a demo response.",
        isBot: true
      }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-black/50 rounded-2xl p-5 shadow-[0_0_25px_rgba(179,200,144,0.3)] backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-[70%] ${
              message.isBot
                ? "bg-white/10 self-start"
                : "bg-primary/20 self-end ml-auto"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-primary/50 shadow-[0_0_20px_rgba(179,200,144,0.3)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-all hover:scale-110"
        >
          <Send className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
};
