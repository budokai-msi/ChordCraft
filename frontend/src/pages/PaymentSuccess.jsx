import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home, Settings } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { loggerService } from '../services/loggerService';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    // Verify payment with backend
    verifyPayment();
  }, [sessionId, paymentIntentId]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      
      // Simulate API call to verify payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call your backend to verify the payment
      // const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
      // const data = await response.json();
      
      setLoading(false);
    } catch (error) {
      loggerService.error('Payment verification error:', error);
      setError('Failed to verify payment. Please contact support.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="lg" text="Verifying your payment..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-400">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-400">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-400">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated. Welcome to ChordCraft Pro!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-800 bg-opacity-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-slate-300">What's Next?</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Access to unlimited projects</li>
              <li>• Advanced AI music generation</li>
              <li>• Premium templates and sounds</li>
              <li>• Priority support</li>
              <li>• Export to multiple formats</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/studio')} 
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Creating Music
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')} 
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              You can manage your subscription and billing information in Settings → Billing
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
