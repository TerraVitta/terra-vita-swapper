import { useState, useRef, useEffect } from "react";
import { Chatbot } from "./Chatbot";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FloatingAIChat } from "./ui/glass";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

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
    <FloatingAIChat
      ref={containerRef}
      expanded={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      className={cn(
        "overflow-hidden transition-[width,height] duration-500",
        {
          "w-auto h-auto": !isOpen,
          "w-96 h-[600px]": isOpen
        }
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}
      onMouseDown={handleDragStart}
    >
      {!isOpen ? (
        <div className="flex items-center gap-3 text-primary">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient">
            Ask Terra AI...
          </span>
        </div>
      ) : (
        <Chatbot onClose={() => setIsOpen(false)} />
      )}
    </FloatingAIChat>
  );
};

// Prevent the component from unmounting during transitions
export default AIChatButton;
