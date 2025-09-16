import { Check, Crown, Zap, Brain, Code, BarChart3, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const proFeatures = [
    {
      icon: <Code className="w-5 h-5" />,
      title: "Music-to-Code Generation",
      description: "Convert your music into editable code format"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Advanced AI Analysis", 
      description: "Deep harmonic and structural music analysis"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Professional Analytics",
      description: "Detailed chord progressions and scale analysis"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-time Code Preview",
      description: "See generated code as you create music"
    }
  ];

  const handleUpgrade = () => {
    // In a real app, this would integrate with a payment processor
    console.log("Redirecting to payment...");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-700/30 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                ChordCraft PRO
              </span>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-purple-200 mt-2">
            Unlock the full power of AI-driven music production
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Features List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-purple-200 mb-4">
              What's included in PRO:
            </h3>
            
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-purple-700/30">
                <div className="text-purple-400 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium text-purple-200 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-purple-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Card */}
          <div className="flex flex-col">
            <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/30 mb-4">
              <CardContent className="p-6 text-center">
                <Badge 
                  variant="outline" 
                  className="bg-yellow-400/10 text-yellow-400 border-yellow-500/30 mb-4"
                >
                  Most Popular
                </Badge>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    $19
                    <span className="text-lg text-yellow-300">/month</span>
                  </div>
                  <p className="text-sm text-yellow-200">
                    Cancel anytime • 7-day free trial
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
                    <Check className="w-4 h-4 text-green-400" />
                    Unlimited AI generations
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
                    <Check className="w-4 h-4 text-green-400" />
                    Export to all formats
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
                    <Check className="w-4 h-4 text-green-400" />
                    Priority AI processing
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
                    <Check className="w-4 h-4 text-green-400" />
                    Advanced music analysis
                  </div>
                </div>

                <Button 
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium"
                  size="lg"
                >
                  Start 7-Day Free Trial
                </Button>
                
                <p className="text-xs text-yellow-300 mt-3">
                  No commitment • Cancel before trial ends
                </p>
              </CardContent>
            </Card>

            {/* Testimonial */}
            <div className="bg-black/20 border border-purple-700/30 rounded-lg p-4">
              <p className="text-sm text-purple-200 italic mb-2">
                "ChordCraft PRO transformed my music production workflow. The AI analysis is incredible!"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
                <span className="text-xs text-purple-300">Sarah M., Music Producer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-purple-800/30">
          <p className="text-xs text-purple-300 text-center">
            By upgrading, you agree to our Terms of Service and Privacy Policy.
            Secure payment processing by Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}