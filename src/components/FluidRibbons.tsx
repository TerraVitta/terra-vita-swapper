const FluidRibbons = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="fluid-ribbon fluid-ribbon-left" aria-hidden="true" />
      <div className="fluid-ribbon fluid-ribbon-right" aria-hidden="true" />
    </div>
  );
};

export default FluidRibbons;
