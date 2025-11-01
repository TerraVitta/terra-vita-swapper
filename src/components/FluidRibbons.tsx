const FluidRibbons = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="fluid-ribbon fluid-ribbon-left" aria-hidden="true" />
      <div className="fluid-ribbon fluid-ribbon-right" aria-hidden="true" />
    </div>
  );
};

export default FluidRibbons;
