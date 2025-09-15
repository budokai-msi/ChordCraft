import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  Building, 
  Star, 
  Calendar, 
  CreditCard, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { stripeService } from '../services/stripeService';
import { useAuth } from '../Auth';
import { SUBSCRIPTION_PLANS } from '../config/stripe';

export function SubscriptionStatus({ className = '' }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // This would typically come from your backend
      // For now, we'll simulate a subscription status
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        plan: 'pro',
        current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancel_at_period_end: false
      };
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'pro':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'studio':
        return <Building className="w-5 h-5 text-orange-500" />;
      case 'enterprise':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Zap className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'trialing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'past_due':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilRenewal = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleManageSubscription = async () => {
    try {
      if (!user) return;
      
      // Create customer portal session
      const session = await stripeService.createPortalSession(
        user.id,
        window.location.href
      );
      
      // Redirect to Stripe Customer Portal
      window.location.href = session.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      setError('Failed to open subscription management');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = subscription 
    ? SUBSCRIPTION_PLANS[subscription.plan] 
    : SUBSCRIPTION_PLANS.free;

  const daysUntilRenewal = subscription 
    ? getDaysUntilRenewal(subscription.current_period_end)
    : null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlanIcon(currentPlan.id)}
            <div>
              <CardTitle className="text-lg">{currentPlan.name} Plan</CardTitle>
              <CardDescription>
                {currentPlan.price === 0 ? 'Free plan' : `$${currentPlan.price} per ${currentPlan.interval}`}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(subscription?.status || 'active')}>
            <div className="flex items-center gap-1">
              {getStatusIcon(subscription?.status || 'active')}
              {subscription?.status || 'active'}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Subscription Details */}
        {subscription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="capitalize">{subscription.status}</span>
            </div>
            
            {subscription.current_period_end && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Next billing date</span>
                  <span>{formatDate(subscription.current_period_end)}</span>
                </div>
                
                {daysUntilRenewal !== null && daysUntilRenewal > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Days until renewal</span>
                      <span>{daysUntilRenewal} days</span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (daysUntilRenewal / 30) * 100)} 
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            )}
            
            {subscription.cancel_at_period_end && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Your subscription will cancel at the end of the current period</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plan Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Plan Features</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {currentPlan.features.slice(0, 6).map((feature, index) => (
              <div key={index} className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-slate-400 truncate">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Usage This Month</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Projects</span>
              <span>2 / {currentPlan.limits.projects === -1 ? '∞' : currentPlan.limits.projects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">AI Requests</span>
              <span>15 / {currentPlan.limits.aiRequests === -1 ? '∞' : currentPlan.limits.aiRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Storage</span>
              <span>45MB / {currentPlan.limits.storage === -1 ? '∞' : `${currentPlan.limits.storage}GB`}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-700">
          {subscription ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManageSubscription}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
