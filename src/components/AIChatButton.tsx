import { useState } from "react";
import { createPortal } from 'react-dom';
import { Chatbot } from "./Chatbot";
import { MessageSquare } from 'lucide-react';

export const AIChatButton = ({ floating = true }: { floating?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperClass = floating ? 'fixed bottom-6 right-6 z-50' : 'relative inline-block';

  return (
    <div className={wrapperClass}>
      <button
          className="ai-chat-float glass-panel rounded-3xl p-3 flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open AI Chat"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-primary/20">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="hidden md:block text-sm font-medium text-foreground/80">Ask AI</div>
        </button>
      {isOpen && createPortal(
        <Chatbot onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </div>
  );
};

export default AIChatButton;
