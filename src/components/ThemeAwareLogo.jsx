import React, { useState, useEffect } from 'react';

// "white" logo = white/light background (light mode)
// "dark" logo  = dark background (dark mode)
const LOGO_LIGHT_BG = 'https://cdn.jsdelivr.net/gh/TruaxDigital/judge-my-driving@main/judge-my-driving-horizontal-logo-white.svg';
const LOGO_DARK_BG  = 'https://cdn.jsdelivr.net/gh/TruaxDigital/judge-my-driving@main/judge-my-driving-horizontal-logo-dark.svg';

export default function ThemeAwareLogo({ className = 'h-20 w-auto' }) {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

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

  // isDark → use dark-background logo; light → use light-background logo
  return (
    <img
      src={isDark ? LOGO_DARK_BG : LOGO_LIGHT_BG}
      alt="Judge My Driving"
      className={className}
    />
  );
}