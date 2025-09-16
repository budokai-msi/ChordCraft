import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { 
  Brain, 
  Music, 
  Zap, 
  Code, 
  ArrowRight, 
  Play, 
  Star, 
  Activity,
  Headphones,
  Sparkles,
  Volume2,
  Upload,
  Download,
  ChevronDown,
  Quote
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface LandingPageProps {
  onEnterStudio: () => void;
}

export function LandingPage({ onEnterStudio }: LandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isDAWPreviewVisible, setIsDAWPreviewVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaFunnelRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -300]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const isHeroInView = useInView(heroRef);
  const isFeaturesInView = useInView(featuresRef);
  const isTestimonialsInView = useInView(testimonialsRef);
  const isCTAInView = useInView(ctaFunnelRef);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: 1,
      title: "AI-Powered Generation",
      description: "Transform your musical ideas into professional-quality compositions using advanced AI",
      icon: <Brain className="w-8 h-8 text-electric-violet" />,
      neonIcon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="url(#brain-gradient)"/>
          <path d="M20 32C20 24.268 26.268 18 34 18s14 6.268 14 14-6.268 14-14 14-14-6.268-14-14z" stroke="url(#brain-stroke)" strokeWidth="2"/>
          <path d="M30 28l4 4 8-8" stroke="url(#brain-accent)" strokeWidth="2"/>
          <defs>
            <linearGradient id="brain-gradient" x1="32" y1="0" x2="32" y2="64">
              <stop stopColor="#8b5cf6"/>
              <stop offset="1" stopColor="#3f00ff"/>
            </linearGradient>
            <linearGradient id="brain-stroke" x1="32" y1="18" x2="32" y2="46">
              <stop stopColor="#00c2ff"/>
              <stop offset="1" stopColor="#80ff00"/>
            </linearGradient>
            <linearGradient id="brain-accent" x1="32" y1="20" x2="32" y2="32">
              <stop stopColor="#ff00ff"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      microcopy: "Create professional tracks in seconds",
      color: "from-purple-600 to-violet-600"
    },
    {
      id: 2,
      title: "Music-to-Code",
      description: "Convert your music into editable code format for precise control and customization",
      icon: <Code className="w-8 h-8 text-neon-cyan" />,
      neonIcon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="url(#code-gradient)"/>
          <path d="M22 20C22 17.7909 23.7909 16 26 16H38C40.2091 16 42 17.7909 42 20V44C42 46.2091 40.2091 48 38 48H26C23.7909 48 22 46.2091 22 44V20Z" stroke="url(#code-stroke)" strokeWidth="3"/>
          <path d="M22 32H42" stroke="url(#code-line1)" strokeWidth="3"/>
          <path d="M32 16V48" stroke="url(#code-line2)" strokeWidth="3"/>
          <path d="M27 24L31 24" stroke="url(#code-accent1)" strokeWidth="2"/>
          <path d="M33 24L37 24" stroke="url(#code-accent2)" strokeWidth="2"/>
          <path d="M27 40L31 40" stroke="url(#code-accent3)" strokeWidth="2"/>
          <path d="M33 40L37 40" stroke="url(#code-accent4)" strokeWidth="2"/>
          <defs>
            <linearGradient id="code-gradient" x1="32" y1="0" x2="32" y2="64">
              <stop stopColor="#3F00FF"/>
              <stop offset="1" stopColor="#C800FF"/>
            </linearGradient>
            <linearGradient id="code-stroke" x1="32" y1="16" x2="32" y2="48">
              <stop stopColor="#00C2FF"/>
              <stop offset="1" stopColor="#80FF00"/>
            </linearGradient>
            <linearGradient id="code-line1">
              <stop stopColor="#FF00FF"/>
            </linearGradient>
            <linearGradient id="code-line2" x1="32" y1="16" x2="32" y2="48">
              <stop stopColor="#00FFFF"/>
              <stop offset="1" stopColor="#FF00FF"/>
            </linearGradient>
            <linearGradient id="code-accent1">
              <stop stopColor="#00FFC2"/>
            </linearGradient>
            <linearGradient id="code-accent2">
              <stop stopColor="#00FFC2"/>
            </linearGradient>
            <linearGradient id="code-accent3">
              <stop stopColor="#FFC200"/>
            </linearGradient>
            <linearGradient id="code-accent4">
              <stop stopColor="#FFC200"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      microcopy: "Edit music like code - precise & powerful",
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: 3,
      title: "Professional DAW",
      description: "Full-featured digital audio workstation with piano roll, timeline, and track management",
      icon: <Music className="w-8 h-8 text-neon-lime" />,
      neonIcon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="url(#daw-gradient)"/>
          <rect x="16" y="20" width="32" height="24" rx="4" stroke="url(#daw-stroke)" strokeWidth="2"/>
          <rect x="20" y="26" width="4" height="12" fill="url(#daw-bar1)"/>
          <rect x="28" y="24" width="4" height="14" fill="url(#daw-bar2)"/>
          <rect x="36" y="28" width="4" height="10" fill="url(#daw-bar3)"/>
          <circle cx="22" cy="18" r="2" fill="url(#daw-dot)" />
          <circle cx="32" cy="18" r="2" fill="url(#daw-dot)" />
          <circle cx="42" cy="18" r="2" fill="url(#daw-dot)" />
          <defs>
            <linearGradient id="daw-gradient" x1="32" y1="0" x2="32" y2="64">
              <stop stopColor="#22c55e"/>
              <stop offset="1" stopColor="#15803d"/>
            </linearGradient>
            <linearGradient id="daw-stroke" x1="32" y1="20" x2="32" y2="44">
              <stop stopColor="#80ff00"/>
              <stop offset="1" stopColor="#00ff80"/>
            </linearGradient>
            <linearGradient id="daw-bar1" y1="26" y2="38">
              <stop stopColor="#ff00ff"/>
            </linearGradient>
            <linearGradient id="daw-bar2" y1="24" y2="38">
              <stop stopColor="#00c2ff"/>
            </linearGradient>
            <linearGradient id="daw-bar3" y1="28" y2="38">
              <stop stopColor="#ffc200"/>
            </linearGradient>
            <linearGradient id="daw-dot">
              <stop stopColor="#ffffff"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      microcopy: "Industry-standard tools at your fingertips",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 4,
      title: "Real-time Analysis",
      description: "Get instant feedback on harmony, rhythm, and composition structure",
      icon: <Activity className="w-8 h-8 text-neon-yellow" />,
      neonIcon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="url(#analysis-gradient)"/>
          <path d="M12 32L20 20L28 36L36 24L44 40L52 32" stroke="url(#analysis-wave)" strokeWidth="3" fill="none"/>
          <circle cx="20" cy="20" r="3" fill="url(#analysis-dot1)" />
          <circle cx="28" cy="36" r="3" fill="url(#analysis-dot2)" />
          <circle cx="36" cy="24" r="3" fill="url(#analysis-dot3)" />
          <circle cx="44" cy="40" r="3" fill="url(#analysis-dot4)" />
          <defs>
            <linearGradient id="analysis-gradient" x1="32" y1="0" x2="32" y2="64">
              <stop stopColor="#f59e0b"/>
              <stop offset="1" stopColor="#d97706"/>
            </linearGradient>
            <linearGradient id="analysis-wave" x1="12" y1="32" x2="52" y2="32">
              <stop stopColor="#ffc200"/>
              <stop offset="0.5" stopColor="#ff00ff"/>
              <stop offset="1" stopColor="#00c2ff"/>
            </linearGradient>
            <linearGradient id="analysis-dot1">
              <stop stopColor="#00ff80"/>
            </linearGradient>
            <linearGradient id="analysis-dot2">
              <stop stopColor="#ff0080"/>
            </linearGradient>
            <linearGradient id="analysis-dot3">
              <stop stopColor="#0080ff"/>
            </linearGradient>
            <linearGradient id="analysis-dot4">
              <stop stopColor="#ff8000"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      microcopy: "AI-powered insights for better music",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alex Rivera",
      role: "Music Producer",
      company: "Neon Studios",
      quote: "ChordCraft transformed my workflow. I can now generate complex chord progressions in seconds and fine-tune them with code-level precision.",
      avatar: "AR",
      waveform: [20, 45, 30, 60, 25, 50, 35, 70, 40, 55]
    },
    {
      id: 2,
      name: "Sarah Chen", 
      role: "Composer",
      company: "Indie Artist",
      quote: "The Music-to-Code feature is revolutionary. It's like having a musical programming language that actually makes sense.",
      avatar: "SC",
      waveform: [35, 60, 45, 75, 30, 65, 50, 80, 35, 70]
    },
    {
      id: 3,
      name: "Marcus Johnson",
      role: "Beat Maker",
      company: "Urban Beats Collective",
      quote: "From concept to finished track in minutes. The AI understands my style and helps me push creative boundaries.",
      avatar: "MJ",
      waveform: [25, 50, 40, 65, 35, 55, 45, 75, 30, 60]
    }
  ];

  const ctaSteps = [
    {
      id: 1,
      title: "Try Studio",
      description: "Experience the power of AI-driven music creation",
      icon: <Play className="w-6 h-6" />,
      action: "Launch Studio"
    },
    {
      id: 2,
      title: "Upload Audio",
      description: "Import your existing tracks for analysis",
      icon: <Upload className="w-6 h-6" />,
      action: "Upload Track"
    },
    {
      id: 3,
      title: "Generate Code",
      description: "Transform music into editable code format",
      icon: <Code className="w-6 h-6" />,
      action: "Generate Code"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black overflow-x-hidden">
      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_50%)]" />
      </motion.div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="max-w-6xl mx-auto text-center z-10"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <Badge className="mb-6 px-6 py-2 text-lg bg-gradient-to-r from-purple-600/20 to-violet-600/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Music Production Platform
            </Badge>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            ChordCraft
            <span className="block text-4xl md:text-6xl font-light italic text-purple-300">Studio</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            The first AI that truly understands both creativity and code.
            Transform musical ideas into professional compositions with unprecedented control.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Button
              onClick={onEnterStudio}
              size="lg"
              className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 glow-electric-violet group"
            >
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Generate Your First Track
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-600/10 transition-all duration-300"
              onClick={() => setIsDAWPreviewVisible(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* DAW Preview */}
          <motion.div 
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {/* Fake DAW Interface */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <Badge className="bg-purple-600/20 text-purple-300">
                      ChordCraft Studio
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 h-32">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="bg-gradient-to-t from-purple-600/20 to-transparent rounded-sm"
                        animate={{ 
                          height: [10, Math.random() * 80 + 20, 10],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                          duration: 2,
                          delay: i * 0.1,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <motion.div
                      className="text-xs font-mono text-purple-300"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ♪ Analyzing harmonic structure... BPM: 128 | Key: C Major ♪
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-purple-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Feature Carousel */}
      <section ref={featuresRef} className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Professional Tools. Creative Freedom.
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to create, analyze, and perfect your music with AI-powered precision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onHoverStart={() => setCurrentFeature(index)}
              >
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group overflow-hidden relative">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className="w-16 h-16 mx-auto mb-4 relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={currentFeature === index ? {
                          boxShadow: [
                            "0 0 20px rgba(139, 92, 246, 0.3)",
                            "0 0 40px rgba(139, 92, 246, 0.6)",
                            "0 0 20px rgba(139, 92, 246, 0.3)"
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {feature.neonIcon}
                      </motion.div>
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{feature.description}</p>
                    
                    <AnimatePresence>
                      {currentFeature === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-purple-300 font-medium"
                        >
                          {feature.microcopy}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                  
                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Testimonials */}
      <section ref={testimonialsRef} className="relative py-24 px-6 bg-gradient-to-b from-transparent to-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-slate-300">
              Join thousands of artists pushing the boundaries of music creation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 h-full relative overflow-hidden">
                  <CardContent className="p-6">
                    {/* Waveform Overlay */}
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                      <svg viewBox="0 0 80 80" className="w-full h-full">
                        {testimonial.waveform.map((height, i) => (
                          <motion.rect
                            key={i}
                            x={i * 8}
                            y={80 - height}
                            width="6"
                            height={height}
                            fill="url(#waveform-gradient)"
                            animate={{
                              height: [height, height + 10, height],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.1,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          />
                        ))}
                        <defs>
                          <linearGradient id="waveform-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00c2ff" />
                            <stop offset="100%" stopColor="#80ff00" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-slate-400">{testimonial.role}</p>
                        <p className="text-xs text-cyan-400">{testimonial.company}</p>
                      </div>
                    </div>

                    <Quote className="w-6 h-6 text-cyan-400 mb-3" />
                    <p className="text-slate-300 leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Funnel */}
      <section ref={ctaFunnelRef} className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isCTAInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-lime-200 bg-clip-text text-transparent">
              Start Creating in 3 Steps
            </h2>
            <p className="text-xl text-slate-300">
              From idea to finished track in minutes
            </p>
          </motion.div>

          <div className="space-y-8">
            {ctaSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isCTAInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-lime-500/30 hover:border-lime-400/50 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {step.id}
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white mb-2">{step.title}</h3>
                          <p className="text-slate-300">{step.description}</p>
                        </div>
                      </div>
                      
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-500 hover:to-green-500 shadow-lg hover:shadow-lime-500/25 transition-all duration-300"
                        onClick={step.id === 1 ? onEnterStudio : undefined}
                      >
                        {step.icon}
                        <span className="ml-2">{step.action}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {index < ctaSteps.length - 1 && (
                  <motion.div 
                    className="flex-shrink-0"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isCTAInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-xl border-purple-500/50 max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-white">Ready to Create?</h3>
                <p className="text-slate-300 mb-6">
                  Join the music production revolution today
                </p>
                <Button
                  onClick={onEnterStudio}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 glow-electric-violet"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Launch ChordCraft Studio
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}