'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GetStartedBtn() {
  return (
    <Button variant="default" asChild className="bg-primary text-background rounded-full px-4 py-2 text-sm font-medium focus:outline-none">
      <Link href="/sign-in" className="flex items-center group">
        Get Started
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 2
          }}
          className="ml-2 bg-background text-primary rounded-full p-1 flex items-center justify-center"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.span>
      </Link>
    </Button>
  );
} 