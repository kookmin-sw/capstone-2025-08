'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  PlusCircle,
  FileImage,
  Share2,
  BarChart,
  PenLine,
  Layers,
  Microscope,
  Brain,
  Zap,
  ChevronRight,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Main() {
  const currentDate = 'May 13, 2025';
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 애니메이션 실행
  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    // 서버 사이드 렌더링 시 애니메이션 없이 렌더링
    return <div className="min-h-screen bg-white">{/* 기본 콘텐츠 */}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute left-0 top-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        </div>

        {/* 장식 요소 */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-blue-200/20 blur-[80px] filter"></div>
        <div
          className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-200/20 blur-[100px] filter"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 blur-xl"></div>
                <div className="relative rounded-full border border-blue-100 bg-white p-6 shadow-md">
                  <Layers className="h-16 w-16 text-blue-500" />
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
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                PathOs
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 text-xl text-gray-600"
            >
              Human-in-the-loop pathology AI service for next-generation
              analysis
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-gray-700 shadow-sm"
            >
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              <span>{currentDate}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* 웨이브 구분선 */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block h-[60px] w-full fill-white"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,141.14,213.2,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
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
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'New Project',
                description:
                  'Start a new analysis project with our AI-powered tools',
                icon: PlusCircle,
                href: '/projects/new',
                color: 'text-blue-500',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-100',
              },
              {
                title: 'Annotation',
                description:
                  'Powerful tools for precise annotation of pathology images',
                icon: PenLine,
                href: '/projects/annotation',
                color: 'text-indigo-500',
                bgColor: 'bg-indigo-50',
                borderColor: 'border-indigo-100',
              },
              {
                title: 'Public Space',
                description:
                  'Explore and share models with the pathology community',
                icon: Share2,
                href: '/public-space',
                color: 'text-teal-500',
                bgColor: 'bg-teal-50',
                borderColor: 'border-teal-100',
              },
              {
                title: 'Analysis',
                description: 'Run advanced AI analysis on your pathology data',
                icon: BarChart,
                href: '/projects',
                color: 'text-purple-500',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-100',
              },
            ].map((action, index) => (
              <motion.div key={index} variants={item}>
                <Card className="group h-full overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex h-full flex-col">
                      <div
                        className={`${action.bgColor} ${action.borderColor} mb-6 flex h-14 w-14 items-center justify-center rounded-xl border p-3 shadow-sm transition-transform duration-300 group-hover:scale-110`}
                      >
                        <action.icon className={`h-7 w-7 ${action.color}`} />
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
                          <span
                            className={`${action.bgColor} rounded-full p-1 transition-transform duration-300 group-hover:translate-x-1`}
                          >
                            <ChevronRight
                              className={`h-4 w-4 ${action.color}`}
                            />
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
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                title: 'Precise Cell Segmentation',
                description:
                  'Automatically identify and classify cellular structures with high accuracy using our advanced AI models.',
                icon: Microscope,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-100',
              },
              {
                title: 'AI-Assisted Diagnosis',
                description:
                  'Get intelligent insights while maintaining human oversight with our human-in-the-loop approach.',
                icon: Brain,
                color: 'text-indigo-500',
                bgColor: 'bg-indigo-50',
                borderColor: 'border-indigo-100',
              },
              {
                title: 'Rapid Processing',
                description:
                  'Process large batches of slides in a fraction of the time with our optimized analysis pipeline.',
                icon: Zap,
                color: 'text-teal-500',
                bgColor: 'bg-teal-50',
                borderColor: 'border-teal-100',
              },
              {
                title: 'Multi-Layer Analysis',
                description:
                  'Examine tissue samples at multiple levels of detail with our comprehensive analysis tools.',
                icon: Layers,
                color: 'text-purple-500',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-100',
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={item}>
                <Card className="group overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div
                        className={`${feature.bgColor} ${feature.borderColor} mr-5 flex-shrink-0 rounded-xl border p-4 shadow-sm transition-transform duration-300 group-hover:scale-110`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
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
          className="mb-20"
        >
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h3 className="mb-4 text-2xl font-bold text-gray-800">
                  Advanced Cell Analysis
                </h3>
                <p className="mb-6 text-gray-600">
                  Our AI-powered platform enables precise identification and
                  classification of cellular structures with unprecedented
                  accuracy, helping pathologists make more informed diagnoses.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                    99.2% Accuracy
                  </span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
                    Real-time Analysis
                  </span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-600">
                    Multi-tissue Support
                  </span>
                </div>
              </div>
              <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute right-0 top-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
                </div>

                {/* Cell visualization */}
                <div className="relative flex h-full items-center justify-center">
                  <motion.div
                    className="z-10 flex h-48 w-48 items-center justify-center rounded-full border border-blue-100 bg-white shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  >
                    <motion.div
                      className="h-36 w-36 rounded-full border border-blue-100 bg-blue-50"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 60,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                      }}
                    >
                      <motion.div
                        className="flex h-full w-full items-center justify-center rounded-full"
                        animate={{ scale: [1, 0.95, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                        }}
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100">
                          <div className="h-10 w-10 rounded-full bg-blue-500 opacity-70"></div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Floating elements */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-4 w-4 rounded-full bg-blue-400 opacity-60"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.6, 0.9, 0.6],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-20"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-md">
            <div className="relative p-8 md:p-12">
              <div className="mb-8 text-center">
                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  Comprehensive Analysis Dashboard
                </h3>
                <p className="mx-auto max-w-2xl text-gray-600">
                  Visualize and interpret complex pathology data with our
                  intuitive dashboard interface
                </p>
              </div>

              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-md">
                {/* Dashboard header */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 w-20 rounded bg-gray-100"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <motion.div
                    className="col-span-2 flex h-40 flex-col rounded-lg bg-blue-50 p-4"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="mb-3 h-5 w-24 rounded bg-blue-200"></div>
                    <div className="grid flex-1 grid-cols-5 items-end gap-2">
                      {[40, 65, 35, 80, 55].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-full rounded-t bg-blue-400"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        ></motion.div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex h-40 flex-col rounded-lg bg-indigo-50 p-4"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="mb-3 h-5 w-20 rounded bg-indigo-200"></div>
                    <div className="flex flex-1 items-center justify-center">
                      <div className="relative h-24 w-24">
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-indigo-300"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 8,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                          }}
                        ></motion.div>
                        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-indigo-200">
                          <div className="font-bold text-indigo-700">76%</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    className="h-32 rounded-lg bg-teal-50 p-4"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="mb-3 h-5 w-20 rounded bg-teal-200"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-4 rounded bg-teal-100"></div>
                      <div className="h-4 rounded bg-teal-200"></div>
                      <div className="h-4 rounded bg-teal-300"></div>
                      <div className="h-4 rounded bg-teal-100"></div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="h-32 rounded-lg bg-purple-50 p-4"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="mb-3 h-5 w-20 rounded bg-purple-200"></div>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-full rounded bg-purple-100"></div>
                      <div className="h-4 w-3/4 rounded bg-purple-200"></div>
                      <div className="h-4 w-1/2 rounded bg-purple-100"></div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="h-32 rounded-lg bg-amber-50 p-4"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="mb-3 h-5 w-20 rounded bg-amber-200"></div>
                    <div className="flex h-full items-center justify-center">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-8 w-8 rounded-full bg-amber-200"></div>
                        <div className="h-8 w-8 rounded-full bg-amber-300"></div>
                        <div className="h-8 w-8 rounded-full bg-amber-100"></div>
                        <div className="h-8 w-8 rounded-full bg-amber-200"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Get Started CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
            <div className="relative p-8 md:p-16">
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="mb-6 text-3xl font-bold text-gray-800 md:text-4xl"
                >
                  Ready to transform your pathology workflow?
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mb-10 text-xl text-gray-600"
                >
                  Start your journey with PathOs today and experience the future
                  of pathology analysis.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col justify-center gap-4 sm:flex-row"
                >
                  <Button
                    asChild
                    size="lg"
                    className="border-none bg-blue-500 text-white shadow-md transition-all duration-300 hover:bg-blue-600 hover:shadow-lg"
                  >
                    <Link
                      href="/projects/new"
                      className="flex items-center px-8 py-6"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Start New Project
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Link
                      href="/projects"
                      className="flex items-center px-8 py-6"
                    >
                      <FileImage className="mr-2 h-5 w-5" />
                      View Projects
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
