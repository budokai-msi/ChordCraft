import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  Check, 
  X, 
  CreditCard, 
  Shield, 
  Zap, 
  Crown, 
  Building,
  Star,
  ArrowRight,
  Lock
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../config/stripe';
import { stripeService } from '../services/stripeService';
import { useAuth } from '../Auth';

export function PaymentModal({ isOpen, onClose, selectedPlan = 'pro' }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(selectedPlan);

  const plans = Object.values(SUBSCRIPTION_PLANS);
  const currentPlan = plans.find(plan => plan.id === selectedPlanId);

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please log in to subscribe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create or get customer
      let customer = await stripeService.getCustomer(user.id);
      if (!customer) {
        customer = await stripeService.createCustomer({
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          user_id: user.id
        });
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        currentPlan.stripePriceId,
        customer.id,
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/payment/cancel`
      );

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error.message || 'Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'pro':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'studio':
        return <Building className="w-6 h-6 text-orange-500" />;
      case 'enterprise':
        return <Star className="w-6 h-6 text-yellow-500" />;
      default:
        return <Zap className="w-6 h-6 text-blue-500" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'pro':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'studio':
        return 'border-orange-500/20 bg-orange-500/5';
      case 'enterprise':
        return 'border-yellow-500/20 bg-yellow-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            Unlock the full potential of ChordCraft with our premium plans
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedPlanId === plan.id 
                  ? `${getPlanColor(plan.id)} border-2` 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && (
                    <span className="text-sm text-slate-400 font-normal">/{plan.interval}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-slate-400 text-xs">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Plan Details */}
        {currentPlan && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlanIcon(currentPlan.id)}
                  <div>
                    <CardTitle className="text-xl">{currentPlan.name} Plan</CardTitle>
                    <CardDescription>
                      {currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price} per ${currentPlan.interval}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/${currentPlan.interval}`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">What's included:</h4>
                  <ul className="space-y-1 text-sm">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Limits:</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>Projects: {currentPlan.limits.projects === -1 ? 'Unlimited' : currentPlan.limits.projects}</li>
                    <li>AI Requests: {currentPlan.limits.aiRequests === -1 ? 'Unlimited' : `${currentPlan.limits.aiRequests}/month`}</li>
                    <li>Storage: {currentPlan.limits.storage === -1 ? 'Unlimited' : `${currentPlan.limits.storage}GB`}</li>
                    {currentPlan.limits.collaborators && (
                      <li>Collaborators: {currentPlan.limits.collaborators === -1 ? 'Unlimited' : currentPlan.limits.collaborators}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="w-4 h-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading || currentPlan?.price === 0}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text="Processing..." />
              ) : currentPlan?.price === 0 ? (
                'Current Plan'
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-slate-800 bg-opacity-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-400">
              <p className="font-medium text-green-400 mb-1">Your payment is secure</p>
              <p>
                We use Stripe for secure payment processing. Your payment information is encrypted and never stored on our servers. 
                You can cancel your subscription at any time from your account settings.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
