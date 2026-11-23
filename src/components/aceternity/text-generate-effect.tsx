"use client"

import { useEffect } from "react"
import { stagger, useAnimate } from "motion/react"

/**
 * Adaptasi Aceternity UI — "Text Generate Effect"
 * (https://ui.aceternity.com/components/text-generate-effect).
 * Kata-kata muncul satu per satu, blur-nya memudar seiring waktu.
 *
 * `globals.css` memaksa kata tetap terlihat saat `prefers-reduced-motion: reduce`.
 */
export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
  staggerDelay = 0.1,
}: {
  words: string
  className?: string
  duration?: number
  staggerDelay?: number
}) {
  const [scope, animate] = useAnimate()
  const wordList = words.split(" ")

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration, delay: stagger(staggerDelay) },
    )
  }, [scope, animate, duration, staggerDelay])

  return (
    <div className={className} data-text-generate>
      <div ref={scope}>
        {wordList.map((word, index) => (
          <span key={`${word}-${index}`} className="opacity-0" style={{ filter: "blur(10px)" }}>
            {word}{" "}
          </span>
        ))}
      </div>
    </div>
  )
}
