import React, { useState, useEffect, useRef } from 'react';
import { Music, Zap, Layers, Brain, Sparkles, Play, ArrowRight, Star, Users, Award, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LandingPage({ onGetStarted }) {
  const heroRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Add a subtle parallax effect on scroll
    const handleScroll = () => {
      if (heroRef.current) {
        const offset = window.pageYOffset;
        heroRef.current.style.backgroundPositionY = `${offset * 0.5}px`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Music,
      title: "AI-Powered Music Generation",
      description: "Create professional-quality music with our advanced AI that understands musical theory, harmony, and composition.",
      color: "primary-gradient-text"
    },
    {
      icon: Brain,
      title: "Microsoft Muzic AI Integration",
      description: "Powered by cutting-edge Microsoft Muzic AI for deep audio analysis, stem separation, and intelligent music understanding.",
      color: "vibrant-gradient-text"
    },
    {
      icon: Layers,
      title: "Professional DAW Interface",
      description: "A complete digital audio workstation with piano roll, timeline editing, and real-time collaboration features.",
      color: "cyber-gradient-text"
    },
    {
      icon: Zap,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time. Share projects, chat, and create music together seamlessly.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption, secure cloud storage, and enterprise-grade authentication.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Rocket,
      title: "Lightning Fast Performance",
      description: "Optimized for speed and performance. Create, edit, and export your music without any lag or delays.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Music Producer",
      company: "Sony Music",
      content: "ChordCraft has revolutionized how I create music. The AI suggestions are incredibly intelligent and the interface is so intuitive.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Composer",
      company: "Netflix",
      content: "The stem separation feature is mind-blowing. I can isolate individual instruments from any track with perfect quality.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Sound Designer",
      company: "Ubisoft",
      content: "The real-time collaboration features have transformed our workflow. Our team can work together seamlessly from anywhere.",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "1M+", label: "Songs Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen w-full animated-bg text-foreground overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="h-screen w-full flex items-center justify-center relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)
          `
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Static Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500 bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-green-500 bg-opacity-10 rounded-full blur-xl"></div>
        
        {/* Professional Timeline Preview */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 opacity-15 pointer-events-none">
          <div className="h-full glass-pane rounded-lg overflow-hidden">
            <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 relative">
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="grid grid-cols-16 gap-0 h-full">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="border-r border-slate-500/40"></div>
                  ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-8 gap-0 h-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-b border-slate-500/20"></div>
                  ))}
                </div>
              </div>
              
              {/* Note Labels */}
              <div className="absolute left-0 top-0 w-16 h-full border-r border-slate-500/50 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <div className="p-2 space-y-0">
                  {['C7', 'B6', 'A6', 'G6', 'F6', 'E6', 'D6', 'C6'].map((note, i) => (
                    <div key={note} className="flex items-center justify-center h-8 text-xs font-mono font-semibold text-slate-300">
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Music Notes */}
              <div className="absolute inset-0 ml-16">
                <div className="absolute top-4 left-8 w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="absolute top-12 left-16 w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="absolute top-20 left-24 w-3 h-3 bg-pink-400 rounded-full"></div>
                <div className="absolute top-8 left-32 w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="absolute top-16 left-40 w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-24 left-48 w-3 h-3 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="z-10 text-center p-8 max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-purple-500 bg-opacity-20 border-purple-500 border-opacity-30 text-purple-300 neon-glow-pink">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Microsoft Muzic AI
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 cyber-gradient-text text-shadow-lg">
              ChordCraft Studio
            </h1>
            
            <p className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The future of music production is here. Turn your ideas into reality with the power of 
              <span className="vibrant-gradient-text font-semibold"> generative AI</span> and 
              <span className="cyber-gradient-text font-semibold"> professional tools</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={onGetStarted} 
                className="btn-primary text-lg px-8 py-4 h-auto hover:scale-105 transition-transform duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Creating for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDemo(true)}
                className="btn-secondary text-lg px-8 py-4 h-auto hover:scale-105 transition-transform duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Studio Preview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass-pane rounded-lg p-4 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl font-bold text-blue-400 mb-1">AI-Powered</div>
                <div className="text-sm text-slate-400">Music Generation</div>
              </div>
              <div className="glass-pane rounded-lg p-4 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl font-bold text-purple-400 mb-1">Real-time</div>
                <div className="text-sm text-slate-400">Code Conversion</div>
              </div>
              <div className="glass-pane rounded-lg p-4 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl font-bold text-green-400 mb-1">Professional</div>
                <div className="text-sm text-slate-400">DAW Interface</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold vibrant-gradient-text mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold mb-6 vibrant-gradient-text">
              An entirely new way to create
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Our advanced AI tools streamline your workflow, so you can focus on what matters most: 
              <span className="text-white font-semibold"> your music</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`feature-card hover-lift group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 neon-glow">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-8 bg-gradient-to-r from-slate-900 bg-opacity-50 to-slate-800 bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 vibrant-gradient-text">
              Loved by creators worldwide
            </h2>
            <p className="text-xl text-slate-300">
              See what our community is saying about ChordCraft
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-pane hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl font-bold mb-6 cyber-gradient-text">
            Ready to create something amazing?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using ChordCraft to bring their musical visions to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onGetStarted} 
              className="btn-primary text-xl px-12 py-6 h-auto hover:scale-105 transition-transform duration-300"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button 
              variant="outline" 
              className="btn-secondary text-xl px-12 py-6 h-auto hover:scale-105 transition-transform duration-300"
            >
              <Users className="w-6 h-6 mr-3" />
              Join Community
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-slate-400">
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Enterprise security
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 neon-glow">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold vibrant-gradient-text">ChordCraft Studio</h3>
          </div>
          <p className="text-slate-400 mb-6">
            The future of music production, powered by AI
          </p>
          <div className="flex justify-center space-x-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">ChordCraft Demo</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowDemo(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">Interactive Demo</h4>
                  <p className="text-slate-400 mb-4">
                    Experience ChordCraft's AI-powered music creation in action
                  </p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>• Upload audio files for AI analysis</p>
                    <p>• Generate music from text prompts</p>
                    <p>• Real-time collaboration features</p>
                    <p>• Professional DAW interface</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    setShowDemo(false);
                    onGetStarted();
                  }}
                  className="btn-primary"
                >
                  Try It Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDemo(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}