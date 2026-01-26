import { useState } from "react";
import { createPortal } from 'react-dom';
import { MessageCircle, X } from "lucide-react";
import { Chatbot } from "./Chatbot";

export const ChatbotDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 flex items-center justify-center transition-spring hover:scale-110 shadow-2xl glass-panel"
      >
        {isOpen ? (
          <X className="w-6 h-6 dark:text-white text-background" />
        ) : (
          <MessageCircle className="w-6 h-6 dark:text-white text-background" />
        )}
      </button>

      {isOpen && createPortal(
        <div className="fixed bottom-24 right-6 z-[110] w-[420px] h-[650px] max-h-[calc(100vh-8rem)] shadow-2xl rounded-3xl overflow-hidden glass-panel animate-scale-in pointer-events-auto">
          <Chatbot />
        </div>, document.body
      )}
    </>
  );
};
