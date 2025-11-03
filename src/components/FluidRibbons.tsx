import { ThemeToggle } from './ThemeToggle';
import { AIChatButton } from './AIChatButton';

const FluidRibbons = () => {
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="fluid-ribbon fluid-ribbon-left" aria-hidden="true" />
        <div className="fluid-ribbon fluid-ribbon-right" aria-hidden="true" />
      </div>
      
      {/* Buttons positioned on top of ribbons */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 pointer-events-auto">
        <ThemeToggle />
        <AIChatButton />
      </div>
    </>
  );
};

export default FluidRibbons;
