import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { HapticButton } from "./HapticButton";
import { motion, AnimatePresence } from "framer-motion";

interface ResponsiveLayoutProps {
  header: React.ReactNode;
  leftPanel: React.ReactNode;
  mainPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function ResponsiveLayout({ header, leftPanel, mainPanel, rightPanel }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close panels on mobile when resizing
      if (window.innerWidth >= 1024) {
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isMobile) {
    // Desktop layout - original design
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {header}
        <div className="flex h-[calc(100vh-4rem)]">
          {leftPanel}
          {mainPanel}
          {rightPanel}
        </div>
      </div>
    );
  }

  // Mobile layout - responsive design
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {header}
      
      {/* Mobile Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm lg:hidden">
        <HapticButton
          variant="ghost"
          size="sm"
          hapticType="light"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="text-purple-300 hover:text-white"
        >
          <Menu className="w-4 h-4 mr-2" />
          Tracks
        </HapticButton>
        
        <div className="text-sm text-purple-300 font-medium">
          ChordCraft Studio
        </div>
        
        <HapticButton
          variant="ghost"
          size="sm"
          hapticType="light"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="text-purple-300 hover:text-white"
        >
          AI Assistant
          <Menu className="w-4 h-4 ml-2" />
        </HapticButton>
      </div>

      <div className="flex h-[calc(100vh-8rem)] relative">
        {/* Main Panel - Always Visible on Mobile */}
        <div className="flex-1">
          {mainPanel}
        </div>

        {/* Left Panel Overlay */}
        <AnimatePresence>
          {leftPanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"
                onClick={() => setLeftPanelOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] z-20"
              >
                <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-r border-purple-700/30">
                  <div className="flex items-center justify-between p-4 border-b border-purple-800/30">
                    <h3 className="font-medium text-purple-200">Track Manager</h3>
                    <HapticButton
                      variant="ghost"
                      size="sm"
                      hapticType="light"
                      onClick={() => setLeftPanelOpen(false)}
                      className="text-purple-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </HapticButton>
                  </div>
                  <div className="h-[calc(100%-4rem)]">
                    {leftPanel}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Right Panel Overlay */}
        <AnimatePresence>
          {rightPanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"
                onClick={() => setRightPanelOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] z-20"
              >
                <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-l border-purple-700/30">
                  <div className="flex items-center justify-between p-4 border-b border-purple-800/30">
                    <h3 className="font-medium text-purple-200">AI Assistant</h3>
                    <HapticButton
                      variant="ghost"
                      size="sm"
                      hapticType="light"
                      onClick={() => setRightPanelOpen(false)}
                      className="text-purple-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </HapticButton>
                  </div>
                  <div className="h-[calc(100%-4rem)]">
                    {rightPanel}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}