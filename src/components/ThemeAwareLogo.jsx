import React, { useState, useEffect } from 'react';

const LOGO_WHITE = 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg';
const LOGO_DARK = 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg';

/**
 * Renders the correct logo based on the current color scheme.
 * white logo = for dark backgrounds (dark mode)
 * dark logo  = for light backgrounds (light mode)
 */
export default function ThemeAwareLogo({ className = 'h-20 w-auto' }) {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    // Watch for class changes on <html> (app-level theme toggle)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Also watch system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMqChange = (e) => {
      if (!document.documentElement.classList.contains('dark') &&
          !document.documentElement.classList.contains('light')) {
        setIsDark(e.matches);
      }
    };
    mq.addEventListener('change', onMqChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  return (
    <img
      src={isDark ? LOGO_WHITE : LOGO_DARK}
      alt="Judge My Driving"
      className={className}
    />
  );
}