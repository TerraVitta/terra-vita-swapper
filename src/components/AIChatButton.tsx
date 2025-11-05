import { useState, useRef, useEffect } from "react";
import { Chatbot } from "./Chatbot";
import { useMediaQuery } from "@/hooks/use-mobile";

export const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  useEffect(() => {
    // Initialize position based on screen size
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: isMobile ? window.innerWidth - rect.width - 16 : (window.innerWidth - rect.width) / 2,
        y: window.innerHeight - rect.height - 24
      });
    }
  }, [isMobile]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    
    const handleDrag = (e: MouseEvent) => {
      setPosition({
        x: Math.min(Math.max(0, e.clientX - startX), window.innerWidth - containerRef.current!.offsetWidth),
        y: Math.min(Math.max(0, e.clientY - startY), window.innerHeight - containerRef.current!.offsetHeight)
      });
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  return (
    <div
      ref={containerRef}
      className={`ai-chat-container ${isOpen ? 'expanded' : ''}`}
      style={{ 
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: isOpen ? '384px' : 'auto',
        height: isOpen ? '600px' : 'auto'
      }}
      onMouseDown={handleDragStart}
      role="region"
      aria-label="AI Chat"
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 text-primary"
          aria-expanded={isOpen}
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-medium">Ask Terra AI...</span>
        </button>
      ) : (
        <Chatbot onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// Prevent the component from unmounting during transitions
export default AIChatButton;
