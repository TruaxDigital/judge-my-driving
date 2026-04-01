import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StarRating({ rating, onRate, size = 'lg', interactive = true }) {
  const [hovered, setHovered] = useState(0);

  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  const active = hovered || rating;

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          whileTap={interactive ? { scale: 0.82 } : {}}
          animate={star <= active ? { scale: 1.08 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={cn(
            !interactive && "cursor-default"
          )}
        >
          <motion.div
            animate={
              star <= active
                ? { rotate: [0, -12, 10, -6, 0] }
                : { rotate: 0 }
            }
            transition={star === rating && hovered === 0
              ? { duration: 0.35, ease: 'easeOut' }
              : { duration: 0 }
            }
          >
            <Star
              className={cn(
                sizes[size],
                "transition-colors duration-150",
                star <= active
                  ? "fill-primary text-primary"
                  : "fill-none text-zinc-600"
              )}
            />
          </motion.div>
        </motion.button>
      ))}
    </div>
  );
}