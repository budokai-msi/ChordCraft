import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';

export function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-red-400">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled. No charges have been made to your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-slate-300">What happened?</h4>
            <p className="text-sm text-slate-400">
              You cancelled the payment process before completing your subscription. 
              Your account remains on the free plan with limited features.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/settings?tab=billing')} 
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/studio')} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue with Free Plan
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
