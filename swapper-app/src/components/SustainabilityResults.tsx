import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Sparkles, Leaf } from "lucide-react";

interface SustainabilityItem {
  item: string;
  score: number;
  category: string;
  eco_reason: string;
  alternative: string;
  icon: string;
}

interface Props {
  results: SustainabilityItem[];
}

export const SustainabilityResults = ({ results }: Props) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, icon: CheckCircle2 };
    if (score >= 60) return { variant: "secondary" as const, icon: Sparkles };
    return { variant: "destructive" as const, icon: XCircle };
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          <CardTitle>Sustainability Analysis</CardTitle>
        </div>
        <CardDescription>AI-powered eco-friendliness assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((item, idx) => {
            const { variant, icon: ScoreIcon } = getScoreBadge(item.score);
            
            return (
              <div
                key={idx}
                className="card-glow p-4 rounded-lg border border-border/30 bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{item.item}</h3>
                      <Badge variant={variant} className="gap-1">
                        <ScoreIcon className="w-3 h-3" />
                        {item.score}/100
                      </Badge>
                    </div>
                    
                    <Badge variant="outline" className="mb-2 text-xs">
                      {item.category}
                    </Badge>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.eco_reason}
                    </p>
                    
                    {item.alternative && item.score < 80 && (
                      <div className="bg-primary/10 border border-primary/30 rounded-md p-3 mt-2">
                        <p className="text-xs font-semibold text-primary mb-1">
                          💡 Eco-Friendly Alternative:
                        </p>
                        <p className="text-sm text-foreground">{item.alternative}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};