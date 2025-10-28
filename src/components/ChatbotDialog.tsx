import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Chatbot } from "./Chatbot";

export const ChatbotDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="fixed top-20 right-4 z-40 w-96 h-[600px] max-h-[calc(100vh-6rem)] shadow-2xl rounded-2xl overflow-hidden">
          <Chatbot />
        </div>
      )}
    </>
  );
};
