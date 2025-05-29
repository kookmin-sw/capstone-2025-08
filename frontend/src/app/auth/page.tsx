'use client';

import { LoginForm } from '@/components/auth/login-form';
import { PathosTextLogo } from '@/components/icons/pathos-text-logo';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthPage() {
  // TODO: 이미지 스플래쉬 구현

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-primary min-h-svh grid lg:grid-cols-2">
      <div className="bg-primary relative hidden overflow-hidden lg:block">
        <motion.div
          className="absolute inset-0"
          initial={{ x: '-120%' }}
          animate={{ x: '0%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <img
            src="/images/login-splash.png"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
          <div className="to-primary absolute inset-0 bg-gradient-to-r from-transparent" />
          <div className="absolute left-10 top-10 z-10">
            <Link href="/">
              <PathosTextLogo className="h-auto w-36 cursor-pointer text-white" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            className="absolute right-0 top-[20%] z-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
            animate={{
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <motion.div
            className="right-30 absolute top-[30%] z-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="relative z-50 flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm
                containerVariants={containerVariants}
                itemVariants={itemVariants}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
