import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// ✅ Replace placeholders with your real keys or env variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cfzcianftrkzxncgxjrx.supabase.co/";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmemNpYW5mdHJrenhuY2d4anJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDM2ODQsImV4cCI6MjA3NzIxOTY4NH0.Ce0PIoQER8VL2V6e6zbfugIQk_ibZ_6yJ0F361AbOjc";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyBqL4AYmf6fo5VEAjSMbc7D2E_EYsgvSXI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

function App() {
const [userMessage, setUserMessage] = useState("");
const [aiResponse, setAiResponse] = useState("");

const handleSend = async () => {
if (!userMessage.trim()) return;

const res = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: userMessage,
});

const reply = res.text;
setAiResponse(reply);

await supabase.from("chat_logs").insert([
{ user_input: userMessage, ai_response: reply },
]);
};

return (
<div style={{ fontFamily: "sans-serif", padding: "20px" }}>
<h1>💬 AI Chatbot</h1>
<textarea
value={userMessage}
onChange={(e) => setUserMessage(e.target.value)}
placeholder="Type your message..."
style={{ width: "100%", height: "100px", marginBottom: "10px" }}
/>
<br />
<button onClick={handleSend}>Send</button>
<p><strong>AI Response:</strong> {aiResponse}</p>
</div>
);
}

export default App


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
