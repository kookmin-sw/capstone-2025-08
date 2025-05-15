'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-gray-800 py-10">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-6 px-4 md:flex-row md:space-y-0">
        <motion.nav
          className="flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {['Features', 'Workflow', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              {item}
            </a>
          ))}
          <Link
            href="/"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Policies & Terms
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Docs & Help
          </Link>
        </motion.nav>

        {/* Copyright */}
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          © 2025 PathOs. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
}
