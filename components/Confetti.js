'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function ConfettiEffect({ trigger }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // Confetti shows for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
    />
  );
}
