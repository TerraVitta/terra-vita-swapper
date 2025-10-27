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
import { useEffect, useState } from "react";
import TopRightControls from "./components/TopRightControls";

const queryClient = new QueryClient();

const App = () => {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // show startup loader for 3 seconds
    const t = setTimeout(() => setInitialLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* top-right controls (chatbot button + theme toggle) */}
          <TopRightControls />

          {initialLoading && (
            <div className="startup-loader fixed inset-0 flex items-center justify-center bg-background z-50">
              <div className="loader-wrapper">
                {/* Loader markup (from Uiverse) */}
                <div className="loader">
                  <div className="tars">
                    <div className="container 1">
                      <div className="shape">
                        <div className="f"></div>
                        <div className="b"></div>
                        <div className="l"></div>
                        <div className="r"></div>
                        <div className="t"></div>
                        <div className="bot"></div>
                      </div>
                    </div>
                    <div className="container 2">
                      <div className="shape">
                        <div className="f"></div>
                        <div className="b"></div>
                        <div className="l"></div>
                        <div className="r"></div>
                        <div className="t"></div>
                        <div className="bot"></div>
                      </div>
                    </div>
                    <div className="container 3">
                      <div className="shape">
                        <div className="f"></div>
                        <div className="b"></div>
                        <div className="l"></div>
                        <div className="r"></div>
                        <div className="t"></div>
                        <div className="bot"></div>
                      </div>
                    </div>
                    <div className="container 4">
                      <div className="shape">
                        <div className="f"></div>
                        <div className="b"></div>
                        <div className="l"></div>
                        <div className="r"></div>
                        <div className="t"></div>
                        <div className="bot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
};

export default App;
