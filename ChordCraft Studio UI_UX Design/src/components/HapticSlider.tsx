import React from "react";
import { Slider } from "./ui/slider";
import { cn } from "./ui/utils";

interface HapticSliderProps extends React.ComponentProps<typeof Slider> {
  onValueChange?: (value: number[]) => void;
}

export function HapticSlider({ onValueChange, className, ...props }: HapticSliderProps) {
  const handleValueChange = (value: number[]) => {
    // Light haptic feedback for slider interaction
    if (navigator.vibrate) {
      navigator.vibrate(3);
    }
    onValueChange?.(value);
  };

  return (
    <Slider
      {...props}
      onValueChange={handleValueChange}
      className={cn(
        "transition-all duration-200",
        "[&>span[role=slider]]:transition-all [&>span[role=slider]]:duration-200",
        "[&>span[role=slider]]:hover:scale-105 [&>span[role=slider]]:active:scale-110",
        "[&>span[role=slider]]:hover:shadow-lg [&>span[role=slider]]:active:shadow-xl",
        className
      )}
    />
  );
}