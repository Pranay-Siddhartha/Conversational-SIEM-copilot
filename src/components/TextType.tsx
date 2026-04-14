"use client";
import { useState, useEffect, useCallback } from "react";

interface TextTypeProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorBlinkDuration?: number;
  style?: React.CSSProperties;
}

export default function TextType({
  texts,
  typingSpeed = 75,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "_",
  cursorBlinkDuration = 0.5,
  style = {},
}: TextTypeProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentFullText = texts[textIndex] || "";

  const tick = useCallback(() => {
    if (isPaused) return;

    if (!isDeleting) {
      // Typing forward
      if (charIndex < currentFullText.length) {
        setCharIndex((prev) => prev + 1);
      } else {
        // Finished typing — pause then start deleting
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting backward
      if (charIndex > 0) {
        setCharIndex((prev) => prev - 1);
      } else {
        // Finished deleting — move to next text
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [charIndex, isDeleting, isPaused, currentFullText.length, pauseDuration, texts.length, textIndex]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, deletingSpeed, typingSpeed]);

  const displayedText = currentFullText.slice(0, charIndex);

  return (
    <span style={style}>
      {displayedText}
      {showCursor && (
        <span
          style={{
            animation: `blink ${cursorBlinkDuration}s step-end infinite`,
            color: "var(--accent-primary)",
          }}
        >
          {cursorCharacter}
        </span>
      )}
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </span>
  );
}
