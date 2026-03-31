/**
 * Logo component for Judge My Driving
 * variant: 'horizontal' (default) | 'vertical'
 * theme: 'white' (for dark backgrounds) | 'dark' (for light backgrounds)
 */

const LOGOS = {
  horizontal_white: 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg.svg',
  horizontal_dark: 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg.svg',
  vertical_white: 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-%20vertical-logo-white.svg.svg',
  vertical_dark: 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-vertical-logo-dark.svg.svg',
};

export default function Logo({ variant = 'horizontal', theme = 'white', className = '', style = {} }) {
  const key = `${variant}_${theme}`;
  const src = LOGOS[key] || LOGOS.horizontal_white;
  return (
    <img
      src={src}
      alt="Judge My Driving"
      className={className}
      style={style}
    />
  );
}