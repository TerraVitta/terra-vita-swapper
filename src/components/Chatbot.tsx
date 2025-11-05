import { useState, useRef } from "react";
import { Send, Loader2, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  products?: any[];
}

export const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm ShopBuddy. Scan a receipt or ask me about sustainable products!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (userMessage?: string, matchedProducts?: any[]) => {
    const messageText = userMessage || input;
    if (!messageText.trim() || loading) return;
    
    const userMsg: Message = {
      id: messages.length + 1,
      text: messageText,
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
          body: JSON.stringify({ 
            message: messageText,
            matchedProducts: matchedProducts || undefined
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data?.success) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: data.reply,
          isBot: true,
          products: matchedProducts
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

  const handleScanReceipt = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setScanning(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Call OCR edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-receipt`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({ imageBase64: base64Image })
          }
        );

        const result = await response.json();
        
        if (result.success) {
          // Add user message about scanning
          const scanMsg: Message = {
            id: messages.length + 1,
            text: `I scanned this receipt - please help me find matching products`,
            isBot: false
          };
          setMessages(prev => [...prev, scanMsg]);

          // Send to chatbot with matched products
          if (result.matchedProducts && result.matchedProducts.length > 0) {
            await handleSend(
              `I scanned a receipt and found ${result.totalMatches} matching products. Can you show me what you found?`,
              result.matchedProducts
            );
          } else {
            setMessages(prev => [...prev, {
              id: prev.length + 2,
              text: "I couldn't find any matching products from your receipt in our store. Try asking me about specific items!",
              isBot: true
            }]);
          }
        } else {
          toast.error(result.error || 'Failed to scan receipt');
        }
        
        setScanning(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan receipt');
      setScanning(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-2xl p-5 border border-border/30 shadow-[0_0_25px_hsl(var(--primary)_/_0.3)]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                message.isBot
                  ? "bg-muted/50 text-foreground self-start"
                  : "bg-primary/20 text-foreground self-end ml-auto"
              }`}
            >
              {message.text}
            </div>
            
            {/* Show matched products if available */}
            {message.products && message.products.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.products.map((product: any) => (
                  <div 
                    key={product.id}
                    className="bg-muted/30 rounded-lg p-3 flex items-center gap-3"
                  >
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        AED {product.price} د.إ | Eco-Score: {product.sustainability_score}/100
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {(loading || scanning) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{scanning ? 'Scanning receipt...' : 'Thinking...'}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 bg-muted/20 rounded-xl p-3 border border-primary/50 shadow-[0_0_20px_hsl(var(--primary)_/_0.3)]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          onClick={handleScanReceipt}
          disabled={loading || scanning}
          variant="ghost"
          size="icon"
          className="shrink-0"
        >
          <Camera className="w-5 h-5" />
        </Button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && !scanning && handleSend()}
          placeholder="Ask about products or scan a receipt..."
          disabled={loading || scanning}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        
        <button
          onClick={() => handleSend()}
          disabled={loading || scanning}
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
};