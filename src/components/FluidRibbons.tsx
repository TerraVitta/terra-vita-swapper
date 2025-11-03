import { ThemeToggle } from './ThemeToggle';
import { AIChatButton } from './AIChatButton';

const FluidRibbons = () => {
  return (
    <>
      {/* Ribbons in background with explicit z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="fluid-ribbon fluid-ribbon-left" aria-hidden="true" />
        <div className="fluid-ribbon fluid-ribbon-right" aria-hidden="true" />
      </div>
      
      {/* Buttons positioned on top with higher z-index */}
      <div className="fixed top-6 right-6 flex items-center gap-4" style={{ zIndex: 9999 }}>
        <ThemeToggle />
        <AIChatButton />
      </div>
    </>
  );
};

export default FluidRibbons;
