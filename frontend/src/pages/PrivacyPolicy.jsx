import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Eye, 
  Database, 
  Lock, 
  Mail, 
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export function PrivacyPolicy() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                <p className="text-slate-400">Last updated: December 19, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Introduction */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Info className="w-5 h-5 mr-2 text-blue-400" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              At ChordCraft Studio ("we," "our," or "us"), we are committed to protecting your privacy 
              and ensuring the security of your personal information. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our AI-powered 
              music production platform.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Quick Summary:</strong> We only collect necessary data to provide our service, 
                never sell your personal information, and give you full control over your data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Database className="w-5 h-5 mr-2 text-green-400" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Account Information
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Email address (for account creation)</li>
                  <li>• Display name (optional)</li>
                  <li>• Profile preferences</li>
                  <li>• Authentication tokens</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Music className="w-4 h-4 mr-2 text-purple-400" />
                  Music Data
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Your music projects and compositions</li>
                  <li>• Audio files you upload for analysis</li>
                  <li>• Generated music and chord progressions</li>
                  <li>• AI analysis results and suggestions</li>
                </ul>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Eye className="w-4 h-4 mr-2 text-yellow-400" />
                Usage Analytics
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-200">Essential Analytics</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>• Page views and navigation patterns</li>
                    <li>• Feature usage statistics</li>
                    <li>• Error logs and performance metrics</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-200">Optional Analytics</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>• User behavior insights</li>
                    <li>• A/B testing data</li>
                    <li>• Marketing campaign effectiveness</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="w-5 h-5 mr-2 text-red-400" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Service Provision</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Process and analyze your audio files</li>
                  <li>• Generate AI-powered music suggestions</li>
                  <li>• Save and sync your projects across devices</li>
                  <li>• Provide real-time collaboration features</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Improvement & Security</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Improve our AI algorithms and features</li>
                  <li>• Detect and prevent security threats</li>
                  <li>• Provide customer support</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">We Never:</h4>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Sell your personal information to third parties</li>
                <li>• Use your music for training without explicit consent</li>
                <li>• Share your projects with other users without permission</li>
                <li>• Access your data for marketing purposes without consent</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Data Security & Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Technical Safeguards</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• End-to-end encryption for all data transmission</li>
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• Multi-factor authentication support</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Operational Safeguards</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Limited access to personal data on a need-to-know basis</li>
                  <li>• Regular staff training on data protection</li>
                  <li>• Secure data centers with 24/7 monitoring</li>
                  <li>• Incident response procedures</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-300 mb-2">Data Breach Response</h4>
                  <p className="text-yellow-200 text-sm">
                    In the unlikely event of a data breach, we will notify affected users within 
                    72 hours and take immediate steps to secure the system and investigate the incident.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Your Rights & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Access & Control</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• View and download all your data</li>
                  <li>• Update or correct your information</li>
                  <li>• Delete your account and all associated data</li>
                  <li>• Export your projects in various formats</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Privacy Controls</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Opt out of analytics and marketing</li>
                  <li>• Control cookie preferences</li>
                  <li>• Manage data sharing settings</li>
                  <li>• Request data portability</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">How to Exercise Your Rights</h4>
              <p className="text-blue-200 text-sm mb-3">
                You can manage most of your privacy settings directly in your account settings. 
                For additional requests or questions, contact us at:
              </p>
              <div className="flex items-center space-x-2 text-blue-300">
                <Mail className="w-4 h-4" />
                <span>privacy@chordcraft.studio</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Account Data</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• <strong>Active accounts:</strong> Retained indefinitely</li>
                    <li>• <strong>Inactive accounts:</strong> 3 years of inactivity</li>
                    <li>• <strong>Deleted accounts:</strong> 30 days grace period</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Music Projects</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• <strong>User projects:</strong> Until account deletion</li>
                    <li>• <strong>Audio files:</strong> 90 days after upload</li>
                    <li>• <strong>Analysis data:</strong> 1 year after generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              If you have any questions about this Privacy Policy or our data practices, 
              please don't hesitate to contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">General Inquiries</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>privacy@chordcraft.studio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>support@chordcraft.studio</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Data Protection Officer</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>dpo@chordcraft.studio</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    For formal data protection requests and complaints
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            This Privacy Policy is effective as of December 19, 2024, and will be updated 
            as our practices change. We will notify you of any material changes.
          </p>
        </div>
      </div>
    </div>
  );
}
