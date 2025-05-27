'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PathosLogoHorizontal } from '@/components/icons/pathos-logo-horizontal';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/use-user-store';
import { useEffect, useState } from 'react';

interface LandingHeaderProps {
  scrolled: boolean;
}

export default function LandingHeader({ scrolled }: LandingHeaderProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const handleEnterPlatform = () => {
    if (user && token) {
      router.push('/main');
    } else {
      router.push('/auth');
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 py-4 transition-all duration-300 ${
        scrolled ? 'bg-primary/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PathosLogoHorizontal className="-mt-2.5 h-16 w-48" />
        </motion.div>
        <motion.nav
          className="hidden items-center space-x-8 md:flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          {['Features', 'Workflow', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="group relative text-gray-300 transition-colors hover:text-white"
            >
              {item}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </motion.nav>
        <motion.div
          className="flex w-48 items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={handleEnterPlatform}
            className="border-none bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            Enter Platform
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
