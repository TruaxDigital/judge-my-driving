import React from 'react';
import { ThumbsUp, Phone, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import SalesBox from './SalesBox';

const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
const iconVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 18, delay: 0.05 } },
};

export default function ThankYouScreen({ rating, safetyFlag, sticker }) {
  if (rating >= 4) {
    return (
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="text-center space-y-8 py-8">
        <motion.div variants={iconVariants} className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <ThumbsUp className="w-12 h-12 text-green-400" />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Great Driver!</h1>
          <p className="text-zinc-400 text-lg">Thanks for the positive feedback.</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SalesBox rating={rating} sticker={sticker} />
        </motion.div>
      </motion.div>
    );
  }

  if (rating === 3) {
    return (
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="text-center space-y-8 py-8">
        <motion.div variants={iconVariants} className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <ThumbsUp className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Thanks!</h1>
          <p className="text-zinc-400 text-lg">Your feedback has been submitted.</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SalesBox discountCode="DRIVE20" rating={rating} sticker={sticker} />
        </motion.div>
      </motion.div>
    );
  }

  // Rating 1-2
  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="text-center space-y-8 py-8">
      <motion.div variants={iconVariants} className="w-24 h-24 bg-zinc-700/50 rounded-full flex items-center justify-center mx-auto">
        <ThumbsUp className="w-12 h-12 text-zinc-400" />
      </motion.div>
      <motion.div variants={itemVariants} className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Thank You</h1>
        <p className="text-zinc-400 text-lg">Your feedback has been recorded.</p>
      </motion.div>
      {safetyFlag && (
        <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 space-y-4">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-red-300 font-medium">If this is an emergency, contact local authorities.</p>
          <a href="tel:911" className="block mt-6">
            <Button variant="destructive" className="w-full rounded-xl h-12 font-semibold">
              <Phone className="w-5 h-5 mr-2" /> Call 911
            </Button>
          </a>
        </motion.div>
      )}
      <motion.div variants={itemVariants}>
        <SalesBox rating={rating} sticker={sticker} />
      </motion.div>
    </motion.div>
  );
}