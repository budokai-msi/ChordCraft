import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Calendar,
  Info
} from 'lucide-react';

export function TermsOfService() {
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
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
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
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Welcome to ChordCraft Studio! These Terms of Service ("Terms") govern your use of our 
              AI-powered music production platform. By accessing or using our service, you agree to 
              be bound by these Terms.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Important:</strong> Please read these Terms carefully. If you do not agree 
                with any part of these Terms, you may not access or use our service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Scale className="w-5 h-5 mr-2 text-purple-400" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              ChordCraft Studio is an AI-powered music production platform that provides:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Core Features</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• AI-powered music generation and analysis</li>
                  <li>• Audio file upload and processing</li>
                  <li>• Real-time collaboration tools</li>
                  <li>• Project management and storage</li>
                  <li>• Export capabilities (MIDI, WAV, MP3)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">AI Technology</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Microsoft Muzic AI integration</li>
                  <li>• Advanced audio analysis</li>
                  <li>• Chord progression suggestions</li>
                  <li>• Tempo and key detection</li>
                  <li>• Music style recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Account Creation</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• You must provide accurate and complete information</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• One account per person or organization</li>
                <li>• You must be at least 13 years old to create an account</li>
              </ul>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Account Responsibilities</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">You Must:</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• Keep your login credentials secure</li>
                    <li>• Notify us of any unauthorized access</li>
                    <li>• Use your account only for lawful purposes</li>
                    <li>• Comply with all applicable laws</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">You Must Not:</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• Share your account with others</li>
                    <li>• Use automated tools to access our service</li>
                    <li>• Attempt to reverse engineer our platform</li>
                    <li>• Violate any intellectual property rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="w-5 h-5 mr-2 text-yellow-400" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Permitted Uses</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Create original music compositions</li>
                <li>• Analyze and improve existing audio files</li>
                <li>• Collaborate with other users on projects</li>
                <li>• Export and share your creations (subject to licensing)</li>
                <li>• Use for educational and commercial purposes</li>
              </ul>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Prohibited Uses</h3>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-300 mb-3">You May Not:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-red-200 text-sm">
                    <li>• Upload copyrighted material without permission</li>
                    <li>• Create content that violates laws or regulations</li>
                    <li>• Generate harmful, offensive, or inappropriate content</li>
                    <li>• Attempt to circumvent usage limits or restrictions</li>
                  </ul>
                  <ul className="space-y-2 text-red-200 text-sm">
                    <li>• Use the service for illegal activities</li>
                    <li>• Interfere with other users' access to the service</li>
                    <li>• Attempt to gain unauthorized access to our systems</li>
                    <li>• Use the service to compete with us directly</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Intellectual Property Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Your Content</h3>
              <p className="text-slate-300 leading-relaxed">
                You retain all rights to the original music and content you create using our platform. 
                We do not claim ownership of your creative works.
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• You own the copyright to your original compositions</li>
                <li>• You are responsible for ensuring you have rights to any samples or materials you use</li>
                <li>• You grant us a limited license to process and store your content to provide our service</li>
                <li>• You can export and use your content as you see fit</li>
              </ul>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Our Platform</h3>
              <p className="text-slate-300 leading-relaxed">
                ChordCraft Studio and all related technology, including our AI models, are protected 
                by intellectual property laws.
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• Our platform, algorithms, and AI models remain our property</li>
                <li>• You may not copy, modify, or distribute our technology</li>
                <li>• Generated suggestions and analysis are provided as tools, not as our property</li>
                <li>• We respect third-party intellectual property rights</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Privacy and Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is 
              governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Data Security</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• We implement industry-standard security measures</li>
                  <li>• Your data is encrypted in transit and at rest</li>
                  <li>• We regularly audit our security practices</li>
                  <li>• We comply with applicable data protection laws</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Your Control</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• You can access, update, or delete your data</li>
                  <li>• You control your privacy settings</li>
                  <li>• You can export your projects at any time</li>
                  <li>• You can request data deletion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment and Billing */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Scale className="w-5 h-5 mr-2 text-purple-400" />
              Payment and Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Free Plan</h4>
                  <p className="text-sm text-slate-300">Basic features with usage limits</p>
                </div>
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Pro Plan</h4>
                  <p className="text-sm text-slate-300">Advanced features and higher limits</p>
                </div>
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Studio Plan</h4>
                  <p className="text-sm text-slate-300">Professional features and collaboration</p>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Billing Terms</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Subscriptions are billed in advance on a monthly or annual basis</li>
                <li>• All fees are non-refundable unless otherwise stated</li>
                <li>• We may change pricing with 30 days' notice</li>
                <li>• You can cancel your subscription at any time</li>
                <li>• Refunds are handled on a case-by-case basis</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">Important Legal Notice</h4>
              <p className="text-yellow-200 text-sm">
                This section limits our liability to you. Please read carefully.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Service Availability</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>• We may perform maintenance that temporarily affects availability</li>
                <li>• We are not liable for service interruptions due to circumstances beyond our control</li>
              </ul>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Limitations</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Our liability is limited to the amount you paid for the service in the past 12 months</li>
                <li>• We are not liable for indirect, incidental, or consequential damages</li>
                <li>• We are not responsible for content created by users</li>
                <li>• We provide the service "as is" without warranties of any kind</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-5 h-5 mr-2 text-red-400" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">By You</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• You may terminate your account at any time</li>
                  <li>• You can export your data before termination</li>
                  <li>• Your data will be deleted after 30 days</li>
                  <li>• No refunds for unused subscription time</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">By Us</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• We may suspend or terminate accounts that violate these Terms</li>
                  <li>• We will provide notice before termination when possible</li>
                  <li>• Immediate termination for serious violations</li>
                  <li>• We may discontinue the service with 90 days' notice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              We may update these Terms from time to time. When we make changes, we will:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li>• Post the updated Terms on our website</li>
              <li>• Update the "Last updated" date at the top of this page</li>
              <li>• Notify you of material changes via email or in-app notification</li>
              <li>• Give you 30 days to review and accept the changes</li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Continued Use:</strong> Your continued use of our service after changes 
                become effective constitutes acceptance of the new Terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">General Inquiries</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>legal@chordcraft.studio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>support@chordcraft.studio</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Legal Matters</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>legal@chordcraft.studio</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    For formal legal notices and disputes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            These Terms of Service are effective as of December 19, 2024. 
            By using ChordCraft Studio, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms.
          </p>
        </div>
      </div>
    </div>
  );
}
