import React from "react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface HapticButtonProps extends React.ComponentProps<typeof Button> {
  hapticType?: "light" | "medium" | "heavy" | "selection";
  children: React.ReactNode;
}

export function HapticButton({ 
  hapticType = "light", 
  onClick, 
  className,
  children, 
  ...props 
}: HapticButtonProps) {
  const triggerHaptic = () => {
    // Web Vibration API for mobile devices
    if (navigator.vibrate) {
      switch (hapticType) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(20);
          break;
        case "heavy":
          navigator.vibrate([30, 10, 30]);
          break;
        case "selection":
          navigator.vibrate(5);
          break;
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic();
    onClick?.(e);
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200 active:scale-95 hover:shadow-lg",
        "active:shadow-inner active:brightness-90",
        className
      )}
    >
      {children}
    </Button>
  );
}