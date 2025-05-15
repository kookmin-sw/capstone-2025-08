'use client';

import { motion } from 'framer-motion';
import { WorkflowStep } from '@/types/landing';
import { useEffect, useState } from 'react';

interface WorkflowSectionProps {
  workflowSteps: WorkflowStep[];
}

export default function WorkflowSection({
  workflowSteps,
}: WorkflowSectionProps) {
  const [particleData, setParticleData] = useState<
    { x: number; y: number; delay: number }[]
  >([]);

  useEffect(() => {
    const data = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 1000 - 500,
      y: Math.random() * 1000 - 500,
      delay: Math.random() * 4,
    }));
    setParticleData(data);
  }, []);

  if (particleData.length === 0) return null; // 클라이언트 준비 전에는 아무것도 렌더링 안 함

  return (
    <section
      id="workflow"
      className="from-primary relative overflow-hidden bg-gradient-to-b to-blue-950 py-20"
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {particleData.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={
              {
                '--x': `${p.x}px`,
                '--y': `${p.y}px`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            All-in-One Pathology Workflow
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            Upload, Annotate, Analyze. Everything in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {workflowSteps.map((item, index) => (
            <motion.div
              key={index}
              className="relative rounded-xl border border-gray-800 bg-gray-900/60 p-8 shadow-xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
            >
              <div className="mb-6 flex h-14 items-center">
                <item.icon className="h-12 w-12 text-white/80" />
              </div>
              <h3 className="min-h-16 mb-3 text-xl font-bold text-white">
                Step {item.step} : {item.title}
              </h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
