"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingTextProps {
  texts: string[];
  staggerFrom?: "first" | "last" | "center";
  initial?: any;
  animate?: any;
  exit?: any;
  staggerDuration?: number;
  transition?: any;
  rotationInterval?: number;
  style?: React.CSSProperties;
}

export default function RotatingText({
  texts,
  staggerFrom = "first",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.025,
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2000,
  style = {},
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(id);
  }, [texts.length, rotationInterval]);

  const currentText = texts[index];
  const characters = currentText.split("");

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", overflow: "hidden", ...style }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          style={{ display: "flex", whiteSpace: "pre" }}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {characters.map((char, i) => {
            let staggerDelay = i * staggerDuration;
            if (staggerFrom === "last") {
              staggerDelay = (characters.length - 1 - i) * staggerDuration;
            } else if (staggerFrom === "center") {
              staggerDelay = Math.abs(Math.floor(characters.length / 2) - i) * staggerDuration;
            }

            return (
              <motion.span
                key={`${index}-${i}`}
                style={{ display: "inline-block" }}
                variants={{
                  hidden: initial,
                  visible: { ...animate, transition: { ...transition, delay: staggerDelay } },
                  exit: { ...exit, transition: { ...transition, delay: staggerDelay } },
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
