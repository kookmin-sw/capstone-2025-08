'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Feature } from '@/types/landing';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  features: Feature[];
  activeFeature: number;
  mousePosition: { x: number; y: number };
}

export default function HeroSection({
  features,
  activeFeature,
  mousePosition,
}: HeroSectionProps) {
  const feature = features[activeFeature];
  const FeatureIcon = feature.icon;

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  let offsetX = 0;
  let offsetY = 0;
  if (hasMounted && typeof window !== 'undefined') {
    offsetX = (mousePosition.x - window.innerWidth / 2) * 0.02;
    offsetY = (mousePosition.y - window.innerHeight / 2) * 0.02;
  }

  return (
    <section className="to-primary relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900">
      {/* Background Effects with Parallax */}
      <motion.div
        className="absolute left-1/4 top-1/4 z-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: offsetX,
          y: offsetY,
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/3 z-0 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: offsetX,
          y: offsetY,
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-50 px-40 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.title}
            className={`mb-14 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/30 p-6 backdrop-blur-sm ${feature.bgColor}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <FeatureIcon className="h-16 w-16 text-white" />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1
            key={feature.title}
            className="mb-6 text-5xl font-bold text-white md:text-7xl"
            aria-label={`Feature Highlight: ${feature.title}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {feature.title}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={feature.title}
            className="mb-10 text-gray-300 md:text-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {feature.description}
          </motion.p>
        </AnimatePresence>

        <motion.div
          className="flex flex-col justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            className="min-w-[180px] bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            aria-label="Start New Project"
          >
            <Link href="/main/projects">
              Start New Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            aria-label="Explore Public Models"
            className="min-w-[180px]"
          >
            <Link href="/main/public-space/community">
              Explore Public Models
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-400"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
      >
        Scroll to explore ↓
      </motion.div>
    </section>
  );
}
