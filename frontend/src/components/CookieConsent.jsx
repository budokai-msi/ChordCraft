import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Cookie, 
  Settings, 
  Shield, 
  BarChart3, 
  Target, 
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import { loggerService } from '../services/loggerService';

const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Necessary',
    description: 'Essential cookies required for the website to function properly',
    required: true,
    cookies: ['session', 'auth', 'csrf', 'security']
  },
  analytics: {
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website',
    required: false,
    cookies: ['_ga', '_gid', '_gat', 'analytics']
  },
  preferences: {
    name: 'Preferences',
    description: 'Remember your settings and preferences for a better experience',
    required: false,
    cookies: ['theme', 'language', 'settings', 'preferences']
  },
  marketing: {
    name: 'Marketing',
    description: 'Used to deliver relevant advertisements and marketing campaigns',
    required: false,
    cookies: ['_fbp', 'ads', 'marketing', 'tracking']
  }
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    analytics: false,
    preferences: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('chordcraft-cookie-consent');
    if (!savedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        applyConsentSettings(parsedConsent);
      } catch (error) {
        loggerService.error('Error parsing saved consent:', error);
        setIsVisible(true);
      }
    }
  }, []);

  const applyConsentSettings = (consentSettings) => {
    // Apply analytics consent
    if (consentSettings.analytics) {
      // Initialize Google Analytics or other analytics tools
      loggerService.info('Analytics tracking enabled');
    } else {
      // Disable analytics
      loggerService.info('Analytics tracking disabled');
    }

    // Apply preferences consent
    if (consentSettings.preferences) {
      // Load user preferences
      loggerService.info('User preferences enabled');
    }

    // Apply marketing consent
    if (consentSettings.marketing) {
      // Initialize marketing tracking
      loggerService.info('Marketing tracking enabled');
    } else {
      // Disable marketing tracking
      loggerService.info('Marketing tracking disabled');
    }
  };

  const handleConsentChange = (category, value) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    setConsent(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      preferences: true,
      marketing: true
    };
    
    setConsent(allConsent);
    saveConsent(allConsent);
    applyConsentSettings(allConsent);
    setIsVisible(false);
    
    loggerService.info('User accepted all cookies');
  };

  const handleAcceptSelected = () => {
    saveConsent(consent);
    applyConsentSettings(consent);
    setIsVisible(false);
    
    loggerService.info('User accepted selected cookies:', consent);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false
    };
    
    setConsent(minimalConsent);
    saveConsent(minimalConsent);
    applyConsentSettings(minimalConsent);
    setIsVisible(false);
    
    loggerService.info('User rejected optional cookies');
  };

  const saveConsent = (consentData) => {
    localStorage.setItem('chordcraft-cookie-consent', JSON.stringify(consentData));
    localStorage.setItem('chordcraft-cookie-consent-date', new Date().toISOString());
  };

  const handlePrivacyPolicy = () => {
    // Navigate to privacy policy page
    window.open('/privacy-policy', '_blank');
  };

  const handleCookieSettings = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Cookie Consent Card */}
      <Card className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Cookie Preferences</CardTitle>
                <CardDescription className="text-slate-400">
                  We use cookies to enhance your experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRejectAll}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Message */}
          <div className="space-y-3">
            <p className="text-slate-300 leading-relaxed">
              We use cookies to provide you with the best possible experience on our website. 
              Some cookies are necessary for the site to function, while others help us understand 
              how you use our service and improve it.
            </p>
            
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Info className="w-4 h-4" />
              <span>
                You can change your preferences at any time in our{' '}
                <button
                  onClick={handlePrivacyPolicy}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </button>
              </span>
            </div>
          </div>

          {/* Cookie Categories */}
          {showDetails && (
            <div className="space-y-4">
              <Separator className="bg-slate-700" />
              
              <div className="space-y-4">
                {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="flex items-start justify-between space-x-4 p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white">{category.name}</h4>
                        {category.required && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{category.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {category.cookies.map((cookie) => (
                          <Badge key={cookie} variant="outline" className="text-xs">
                            {cookie}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch
                      checked={consent[key]}
                      onCheckedChange={(value) => handleConsentChange(key, value)}
                      disabled={category.required}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="flex-1 space-y-2">
              <Button
                onClick={handleAcceptAll}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept All
              </Button>
              <Button
                onClick={handleAcceptSelected}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-800"
              >
                Accept Selected
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCookieSettings}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide Details' : 'Cookie Settings'}
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Reject All
              </Button>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700">
            By using our website, you consent to our use of cookies as described in our{' '}
            <button
              onClick={handlePrivacyPolicy}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Privacy Policy
            </button>
            {' '}and{' '}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Terms of Service
            </button>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
