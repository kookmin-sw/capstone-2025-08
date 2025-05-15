'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AboutHighlight } from '@/types/landing';

interface AboutSectionProps {
  aboutHighlights: AboutHighlight[];
}

export default function AboutSection({ aboutHighlights }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="to-primary relative overflow-hidden bg-gradient-to-b from-blue-950 py-20"
    >
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            About PathOs
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            PathOs is built through collaboration between pathologists and AI
            researchers, dedicated to enhancing diagnostic workflows.
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {aboutHighlights.map((item, index) => (
            <motion.div
              key={index}
              className="relative rounded-xl p-[2px] shadow-xl backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <div className="rounded-xl bg-white/95 p-8">
                <div className="mb-4 inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-3">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <Link href="/main">Get Started with PathOs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
