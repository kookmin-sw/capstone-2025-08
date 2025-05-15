'use client';

import { useEffect, useState } from 'react';

export function useAutoRotateFeatures(length: number) {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % length);
    }, 4000);
    return () => clearInterval(interval);
  }, [length]);

  return { activeFeature, setActiveFeature };
}
