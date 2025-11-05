import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShieldCheck, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div 
    className="glass-card"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-4 p-2 rounded-full w-12 h-12 flex items-center justify-center bg-emerald/10">
      <Icon className="w-6 h-6 text-emerald" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { role, loading: roleLoading } = useUserRole(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionLoading && !roleLoading && user && role) {
      if (role === "admin") navigate("/admin");
      else if (role === "seller") navigate("/seller");
      else navigate("/buyer");
    }
  }, [user, role, sessionLoading, roleLoading, navigate]);

  if (sessionLoading || roleLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="glass-loader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="app-background" />
      
      {/* Hero Section */}
      <motion.section 
        className="relative pt-32 pb-16 px-6 container mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-verdigris via-emerald to-light-green bg-clip-text text-transparent"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Transform Your Shopping <br />Into Sustainable Impact
        </motion.h1>
        
        <motion.p 
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Join TerraVita, where every purchase contributes to a healthier planet. 
          Discover eco-friendly alternatives and make conscious choices that matter.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link to="/auth">
            <Button size="lg" className="glass-button">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="glass-button">
              Learn More
            </Button>
          </a>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TerraVita?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Leaf}
              title="Eco-Friendly Products"
              description="Curated selection of sustainable products that minimize environmental impact"
            />
            <FeatureCard 
              icon={Scale}
              title="Fair Trade"
              description="Support ethical business practices and empower local communities"
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Verified Sellers"
              description="Trusted network of sellers committed to sustainability"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <motion.div 
            className="glass-panel text-center max-w-3xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-muted-foreground mb-8">
              Join our community of conscious consumers and sustainable sellers.
              Together, we can create a positive impact on the environment.
            </p>
            <Link to="/auth">
              <Button size="lg" className="glass-button">
                Join TerraVita Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
