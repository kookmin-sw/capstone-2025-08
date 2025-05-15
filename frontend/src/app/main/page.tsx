'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { featureSectionData, quickActionData } from '@/data/main';
import { Badge } from '@/components/ui/badge';

export default function Main() {
  // 애니메이션 변수
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="from-primary/10 relative overflow-hidden bg-gradient-to-b to-white">
        <div className="container relative z-10 mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 blur-xl"></div>
                <div className="relative rounded-full border border-gray-200 bg-white p-6 shadow-md">
                  <Brain className="text-primary h-16 w-16" />
                </div>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 text-4xl font-bold tracking-tight text-gray-800 md:text-6xl"
            >
              Welcome to{' '}
              <span className="from-primary bg-gradient-to-r to-gray-700 bg-clip-text text-transparent">
                PathOs
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 text-xl text-gray-600"
            >
              A human-in-the-loop, no-code AI platform for pathology
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-16 py-16">
        {/* Quick Actions */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
              Quick Actions
            </h2>
            <div className="bg-primary mx-auto h-1 w-20 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActionData.map((action, index) => (
              <motion.div key={index} variants={item}>
                <Card className="group h-full overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex h-full flex-col">
                      <div className="bg-primary/5 border-primary/5 mb-6 flex h-14 w-14 items-center justify-center rounded-xl border p-3 shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <action.icon className="text-primary h-7 w-7" />
                      </div>

                      <h3 className="mb-3 text-xl font-bold text-gray-800">
                        {action.title}
                      </h3>

                      <p className="mb-6 flex-grow text-gray-600">
                        {action.description}
                      </p>

                      <Button
                        asChild
                        variant="outline"
                        className="translate-y-1 transition-all duration-300 group-hover:translate-y-0"
                      >
                        <Link
                          href={action.href}
                          className="flex w-full items-center justify-between"
                        >
                          <span>Get Started</span>
                          <span className="bg-primary/10 rounded-full p-1 transition-transform duration-300 group-hover:translate-x-1">
                            <ChevronRight className="text-primary h-4 w-4" />
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Section */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-20"
        >
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
              Powerful AI-Driven Tools
            </h2>
            <div className="bg-primary mx-auto h-1 w-20 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {featureSectionData.map((feature, index) => (
              <motion.div key={index} variants={item}>
                <Card className="group h-full overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div
                        className={`bg-primary/5 border-primary/5 mr-5 flex-shrink-0 rounded-xl border p-4 shadow-sm transition-transform duration-300 group-hover:scale-110`}
                      >
                        <feature.icon className={`text-primary h-6 w-6`} />
                      </div>
                      <div>
                        <h3 className="mb-3 text-xl font-bold text-gray-800">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Visualization Area */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h3 className="mb-4 text-2xl font-bold text-gray-800">
                  Advanced Cell & Tissue Analysis
                </h3>
                <p className="mb-6 text-gray-600">
                  Our human-in-the-loop AI engine delivers high-precision
                  segmentation and classification of cells and tissues,
                  empowering pathologists with real-time, multi-layered
                  insights—no coding required.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant={'secondary'}>Dual-mode Support</Badge>
                  <Badge variant={'secondary'}>No-code Segmentation</Badge>
                  <Badge variant={'secondary'}>Human-in-the-loop</Badge>
                </div>
              </div>
              <div className="bg-primary/5 relative min-h-[300px] overflow-hidden">
                <Image
                  src={'/images/annotation-simulation.gif'}
                  alt={'annotation-simulation'}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
