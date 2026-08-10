/**
 * Decorative background: soft rotating radial gradient clouds + a faint grid.
 * Purely visual, so it is hidden from assistive tech and never intercepts clicks.
 */
export function BackgroundMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#080808]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rotate-cloud-1 {
          0% { transform: translate(-30%, -35%) rotate(0deg) scale(1); }
          50% { transform: translate(-20%, -30%) rotate(180deg) scale(1.15); }
          100% { transform: translate(-30%, -35%) rotate(360deg) scale(1); }
        }
        @keyframes rotate-cloud-2 {
          0% { transform: translate(25%, 20%) rotate(360deg) scale(1.1); }
          50% { transform: translate(30%, 25%) rotate(180deg) scale(0.9); }
          100% { transform: translate(25%, 20%) rotate(0deg) scale(1.1); }
        }
        @keyframes rotate-cloud-3 {
          0% { transform: translate(-10%, 25%) rotate(0deg) scale(0.95); }
          50% { transform: translate(-20%, 15%) rotate(180deg) scale(1.1); }
          100% { transform: translate(-10%, 25%) rotate(360deg) scale(0.95); }
        }
        .cloud-blob {
          filter: blur(120px);
          opacity: 0.16;
          mix-blend-mode: screen;
        }
      `}} />

      {/* Rotating smoky clouds */}
      <div 
        className="absolute top-[20%] left-[30%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] rounded-full cloud-blob bg-[radial-gradient(circle,rgba(74,166,168,0.4)_0%,transparent_70%)]"
        style={{
          animation: 'rotate-cloud-1 120s linear infinite',
        }}
      />
      <div 
        className="absolute top-[35%] left-[20%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full cloud-blob bg-[radial-gradient(circle,rgba(130,122,155,0.3)_0%,transparent_70%)]"
        style={{
          animation: 'rotate-cloud-2 160s linear infinite',
        }}
      />
      <div 
        className="absolute top-[50%] left-[40%] w-[85vw] h-[85vw] max-w-[850px] max-h-[850px] rounded-full cloud-blob bg-[radial-gradient(circle,rgba(109,155,130,0.25)_0%,transparent_70%)]"
        style={{
          animation: 'rotate-cloud-3 200s linear infinite',
        }}
      />

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
