"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  animateOnHover?: boolean;
  autoAnimate?: boolean;
  autoAnimateInterval?: number;
}

export function AnimatedText({
  text,
  className = "",
  animateOnHover = true,
  autoAnimate = false,
  autoAnimateInterval = 4000,
}: AnimatedTextProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChars, setDisplayChars] = useState<string[]>(text.split(""));

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

  const scramble = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const originalChars = text.split("");
    const iterations = 8;
    let currentIteration = 0;

    const interval = setInterval(() => {
      setDisplayChars(
        originalChars.map((char, index) => {
          if (char === " ") return " ";

          // Gradually reveal characters from left to right
          const revealIndex = Math.floor((currentIteration / iterations) * originalChars.length);
          if (index < revealIndex) {
            return originalChars[index];
          }

          return characters[Math.floor(Math.random() * characters.length)];
        })
      );

      currentIteration++;

      if (currentIteration >= iterations) {
        clearInterval(interval);
        setDisplayChars(originalChars);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text, isAnimating]);

  useEffect(() => {
    if (autoAnimate) {
      // Initial animation
      const initialTimeout = setTimeout(scramble, 500);

      // Repeating animation
      const interval = setInterval(scramble, autoAnimateInterval);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [autoAnimate, autoAnimateInterval, scramble]);

  return (
    <motion.span
      className={`inline-block cursor-default ${className}`}
      onHoverStart={animateOnHover ? scramble : undefined}
      whileHover={animateOnHover ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {displayChars.map((char, index) => (
        <span
          key={index}
          className="inline-block"
          style={{
            fontFamily: "inherit",
          }}
        >
          {char}
        </span>
      ))}
    </motion.span>
  );
}

// Gradient animated text with shimmer effect
export function ShimmerText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
        {text}
      </span>
    </span>
  );
}

// Typing effect text
export function TypingText({
  text,
  className = "",
  speed = 50,
  loop = false,
  loopDelay = 2000,
}: {
  text: string;
  className?: string;
  speed?: number;
  loop?: boolean;
  loopDelay?: number;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length - 1));
      }, speed / 2);
    } else if (loop && displayText.length === text.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, loopDelay);
    } else if (loop && displayText.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, text, speed, loop, loopDelay]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
