/**
 * BrandLogo — two-tone wordmark for AssetFlow
 *
 * Renders "Asset" in heavy dark type and "Flow" in the brand primary colour,
 * matching the Piractrix-style split-wordmark aesthetic.
 *
 * Props:
 *   size  — 'sm' | 'md' | 'lg'   (controls font size)
 *   dark  — boolean               (true = dark bg variant: "Asset" goes white)
 */
export default function BrandLogo({ size = 'md', dark = false }) {
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <span
      className={`${sizeMap[size]} select-none`}
      style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.01em', lineHeight: 1 }}
      aria-label="AssetFlow"
    >
      <span
        style={{
          fontWeight: 900,
          color: dark ? '#ffffff' : 'var(--app-color-text)',
        }}
      >
        Asset
      </span>
      <span
        style={{
          fontWeight: 700,
          color: 'var(--app-color-primary)',
          letterSpacing: '0.01em',
        }}
      >
        Flow
      </span>
    </span>
  );
}
