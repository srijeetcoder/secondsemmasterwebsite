/**
 * Decorative background: soft radial gradient mesh + a faint grid.
 * Purely visual, so it is hidden from assistive tech and never intercepts clicks.
 */
export function BackgroundMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Hairline grid, fading out toward the bottom */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 75% 55% at 50% 0%, black 30%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 55% at 50% 0%, black 30%, transparent 78%)',
        }}
      />

      {/* Vignette to keep the edges calm using our matte black background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_40%,transparent_40%,#080808_100%)]" />
    </div>
  );
}
