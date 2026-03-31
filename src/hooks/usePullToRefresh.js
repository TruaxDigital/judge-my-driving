import { useRef, useState, useEffect } from 'react';

const THRESHOLD = 72; // px to pull before triggering

export default function usePullToRefresh(onRefresh) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current || window;

    const getScrollTop = () => {
      if (containerRef.current) return containerRef.current.scrollTop;
      return window.scrollY || document.documentElement.scrollTop;
    };

    const onTouchStart = (e) => {
      if (getScrollTop() > 0) return;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && getScrollTop() <= 0) {
        setPulling(true);
        setPullDistance(Math.min(delta, THRESHOLD * 1.5));
        // Prevent default scroll only when pulling down from top
        if (delta > 5) e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(0);
        setPulling(false);
        await onRefresh();
        setRefreshing(false);
      } else {
        setPullDistance(0);
        setPulling(false);
      }
      startY.current = null;
    };

    const target = containerRef.current || document;
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: false });
    target.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, pullDistance]);

  return { containerRef, pulling, pullDistance, refreshing };
}