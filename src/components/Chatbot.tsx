import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose?: () => void;
};

const Chatbot = ({ open, onClose }: Props) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    // focus behavior could be added
  }, [open]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setGenerating(true);
    const prompt = text.trim();
    // Simulate a small generation delay
    setTimeout(() => {
      setMessages((m) => [...m, `You: ${prompt}`, `AI: Echo -> ${prompt}`]);
      setGenerating(false);
      setText("");
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="chatbot-panel fixed top-16 right-4 z-50 w-80 max-w-sm bg-card border rounded-lg shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <strong>AI Assistant</strong>
        <div className="flex items-center gap-2">
          <button onClick={() => { setMessages([]); }} className="text-sm text-muted-foreground">Clear</button>
          <button onClick={() => onClose?.()} className="text-sm">Close</button>
        </div>
      </div>

      <div className="chat-history mb-3 max-h-40 overflow-y-auto text-sm space-y-1">
        {messages.length === 0 ? (
          <div className="text-muted-foreground">No messages yet. Ask something!</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="p-1 rounded text-xs bg-muted/20">{m}</div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded px-2 py-1 bg-transparent border border-border text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a prompt..."
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn generate-btn px-3 py-1 rounded"
          aria-label="Generate"
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
