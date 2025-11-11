import React from "react";

interface AnimationElement {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: string;
  height: string;
  bgColor: string;
  opacity: number;
  animation: string;
  delay?: string;
}

interface AnimatedBackgroundProps {
  variant?: "default" | "simple" | "minimal";
  showGradient?: boolean;
  gradientColors?: string;
}

const ANIMATION_CONFIGS = {
  default: {
    floatingElements: [
      {
        top: "top-1/4",
        left: "left-1/4",
        width: "w-16",
        height: "h-16",
        bgColor: "bg-purple-200",
        opacity: 40,
        animation: "animate-float-slow",
      },
      {
        top: "top-1/3",
        right: "right-1/4",
        width: "w-12",
        height: "h-12",
        bgColor: "bg-pink-200",
        opacity: 50,
        animation: "animate-float-medium",
      },
      {
        bottom: "bottom-1/4",
        left: "left-1/3",
        width: "w-20",
        height: "h-20",
        bgColor: "bg-lavender-300",
        opacity: 30,
        animation: "animate-float-slow",
      },
      {
        top: "top-1/2",
        right: "right-1/3",
        width: "w-14",
        height: "h-14",
        bgColor: "bg-purple-100",
        opacity: 60,
        animation: "animate-float-fast",
      },
    ] as AnimationElement[],
    bubbles: [
      {
        bottom: "bottom-0",
        left: "left-[10%]",
        width: "w-8",
        height: "h-8",
        bgColor: "bg-purple-200",
        opacity: 50,
        animation: "animate-bubble-rise",
        delay: "0s",
      },
      {
        bottom: "bottom-0",
        left: "left-[25%]",
        width: "w-12",
        height: "h-12",
        bgColor: "bg-pink-200",
        opacity: 40,
        animation: "animate-bubble-rise",
        delay: "2s",
      },
      {
        bottom: "bottom-0",
        left: "left-[45%]",
        width: "w-6",
        height: "h-6",
        bgColor: "bg-lavender-300",
        opacity: 60,
        animation: "animate-bubble-rise",
        delay: "4s",
      },
      {
        bottom: "bottom-0",
        left: "left-[60%]",
        width: "w-10",
        height: "h-10",
        bgColor: "bg-purple-300",
        opacity: 45,
        animation: "animate-bubble-rise",
        delay: "1s",
      },
    ] as AnimationElement[],
  },
  simple: {
    floatingElements: [
      {
        top: "top-1/4",
        left: "left-1/4",
        width: "w-16",
        height: "h-16",
        bgColor: "bg-purple-200",
        opacity: 40,
        animation: "animate-float-slow",
      },
      {
        top: "top-1/3",
        right: "right-1/4",
        width: "w-12",
        height: "h-12",
        bgColor: "bg-pink-200",
        opacity: 50,
        animation: "animate-float-medium",
      },
    ] as AnimationElement[],
    bubbles: [
      {
        bottom: "bottom-0",
        left: "left-[20%]",
        width: "w-8",
        height: "h-8",
        bgColor: "bg-purple-200",
        opacity: 50,
        animation: "animate-bubble-rise",
        delay: "0s",
      },
      {
        bottom: "bottom-0",
        left: "left-[60%]",
        width: "w-10",
        height: "h-10",
        bgColor: "bg-pink-200",
        opacity: 40,
        animation: "animate-bubble-rise",
        delay: "2s",
      },
    ] as AnimationElement[],
  },
  minimal: {
    floatingElements: [
      {
        top: "top-1/4",
        left: "left-1/4",
        width: "w-16",
        height: "h-16",
        bgColor: "bg-purple-200",
        opacity: 30,
        animation: "animate-float-slow",
      },
    ] as AnimationElement[],
    bubbles: [] as AnimationElement[],
  },
};

const AnimatedElement: React.FC<AnimationElement> = ({
  top,
  bottom,
  left,
  right,
  width,
  height,
  bgColor,
  opacity,
  animation,
  delay,
}) => (
  <div
    className={`absolute ${top || ""} ${bottom || ""} ${left || ""} ${
      right || ""
    } ${width} ${height} ${bgColor} rounded-full opacity-${opacity} ${animation}`}
    style={{ animationDelay: delay }}
  />
);

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = "default",
  showGradient = true,
  gradientColors = "from-purple-50 via-lavender-50 to-pink-50",
}) => {
  const config = ANIMATION_CONFIGS[variant];

  const renderAnimatedElements = (elements: AnimationElement[]) =>
    elements.map((element, index) => (
      <AnimatedElement key={index} {...element} />
    ));

  return (
    <div className="absolute inset-0 z-0">
      {/* Gradient Background */}
      {showGradient && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientColors}`}
        />
      )}

      {/* Floating Elements */}
      {renderAnimatedElements(config.floatingElements)}

      {/* Rising Bubbles */}
      {renderAnimatedElements(config.bubbles)}

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
};

export default AnimatedBackground;
