import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, Shield, BarChart3, Target, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { CookieConsentManager, CookieConsent } from '../utils/cookies';

interface CookieConsentBannerProps {
  onAccept?: (consent: CookieConsent) => void;
  onReject?: () => void;
}

export function CookieConsentBanner({ onAccept, onReject }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(CookieConsentManager.getDefaultConsent());

  useEffect(() => {
    // Only show banner if user hasn't made a choice yet
    if (!CookieConsentManager.hasConsent()) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now()
    };
    
    CookieConsentManager.setConsent(newConsent);
    setShowBanner(false);
    onAccept?.(newConsent);
  };

  const handleRejectAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now()
    };
    
    CookieConsentManager.setConsent(newConsent);
    setShowBanner(false);
    onReject?.();
  };

  const handleSavePreferences = () => {
    CookieConsentManager.setConsent(consent);
    setShowBanner(false);
    onAccept?.(consent);
  };

  const updateConsent = (key: keyof Omit<CookieConsent, 'timestamp'>, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-sm"
      >
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Cookie className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Cookie Preferences</CardTitle>
                  <p className="text-slate-400 text-sm">
                    We use cookies to enhance your experience and analyze usage
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!showDetails ? (
              // Simple view
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <p className="text-slate-300 text-sm flex-1">
                  We use cookies to personalize your experience, analyze site traffic, and improve our services. 
                  You can customize your preferences or accept all cookies.
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-none border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Reject All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(true)}
                    className="flex-1 sm:flex-none border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Customize
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            ) : (
              // Detailed view
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <h4 className="font-medium text-white">Necessary Cookies</h4>
                        <p className="text-sm text-slate-400">
                          Essential for the website to function properly
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={consent.necessary}
                      disabled
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="font-medium text-white">Analytics Cookies</h4>
                        <p className="text-sm text-slate-400">
                          Help us understand how you use our website
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={consent.analytics}
                      onCheckedChange={(checked) => updateConsent('analytics', checked)}
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="font-medium text-white">Marketing Cookies</h4>
                        <p className="text-sm text-slate-400">
                          Used to deliver relevant ads and track campaigns
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={consent.marketing}
                      onCheckedChange={(checked) => updateConsent('marketing', checked)}
                    />
                  </div>

                  {/* Preferences Cookies */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h4 className="font-medium text-white">Preference Cookies</h4>
                        <p className="text-sm text-slate-400">
                          Remember your settings and preferences
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={consent.preferences}
                      onCheckedChange={(checked) => updateConsent('preferences', checked)}
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePreferences}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
