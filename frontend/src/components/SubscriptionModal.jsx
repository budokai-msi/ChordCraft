import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Music, Bot, FolderOpen, Zap, Crown } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, onUpgrade }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);

    // Simulate Stripe payment processing
    setTimeout(() => {
      onUpgrade();
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const freeFeatures = [
    "Basic audio upload",
    "Simple timeline editing",
    "Up to 3 projects",
    "2 tracks per project",
    "Basic export formats",
  ];

  const proFeatures = [
    "AI-powered music generation",
    "Advanced ChordCraft DSL",
    "Unlimited projects",
    "Unlimited tracks",
    "Music-to-code analysis",
    "Premium export formats",
    "Priority support",
    "Advanced audio effects",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Upgrade to ChordCraft PRO</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <Card className="border-border">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Music className="h-5 w-5" />
                Free Plan
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">$0</div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* PRO Plan */}
          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                PRO Plan
              </CardTitle>
              <div className="text-3xl font-bold text-foreground">
                $19
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">Unlock the full power of AI music</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleUpgrade} disabled={isProcessing}>
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Upgrade to PRO
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <Bot className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">AI Companion</h3>
            <p className="text-sm text-muted-foreground">Generate music with natural language prompts</p>
          </div>

          <div className="text-center p-4">
            <Music className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Music Analysis</h3>
            <p className="text-sm text-muted-foreground">Convert audio to ChordCraft DSL code</p>
          </div>

          <div className="text-center p-4">
            <FolderOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Unlimited Projects</h3>
            <p className="text-sm text-muted-foreground">Create and manage unlimited music projects</p>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Cancel anytime. No hidden fees. 30-day money-back guarantee.
        </div>
      </DialogContent>
    </Dialog>
  );
}
