'use client';

import { motion } from 'framer-motion';
import { Feature } from '@/app/page';
import { Sparkles } from 'lucide-react';

interface FeaturesSectionProps {
  features: Feature[];
  activeFeature: number;
  setActiveFeature: (index: number) => void;
}

export default function FeaturesSection({
  features,
  activeFeature,
  setActiveFeature,
}: FeaturesSectionProps) {
  return (
    <section
      className="from-primary to-primary bg-gradient-to-b py-20"
      id="features"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-4 inline-block">
            <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Key Features
          </h2>
          <p className="mb-12 text-xl text-gray-400">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Discover what's possible with our AI-powered pathology platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature, index) => {
            const isActive = activeFeature === index;
            const FeatureIcon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                onClick={() => setActiveFeature(index)}
                className={`cursor-pointer rounded-lg border p-6 shadow-md backdrop-blur-sm transition-all duration-300 ${
                  isActive
                    ? 'border-blue-400 bg-gradient-to-r from-gray-900/80 to-gray-800/80 shadow-lg'
                    : 'border-gray-800 bg-gray-900/50 hover:bg-white/5'
                }`}
              >
                <div className="mb-4 flex items-center justify-center">
                  <FeatureIcon
                    className={`h-10 w-10 ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`}
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
