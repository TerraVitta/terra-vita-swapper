const FluidRibbons = () => {
  return (
    <>
      {/* Main fluid ribbons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="fluid-ribbon fluid-ribbon-left" aria-hidden="true" />
        <div className="fluid-ribbon fluid-ribbon-right" aria-hidden="true" />
      </div>
      
      {/* Additional ambient light orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            top: '10%',
            left: '5%',
            background: 'radial-gradient(circle, hsl(175 65% 80% / 0.4) 0%, transparent 70%)',
            animation: 'float-ambient 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            top: '60%',
            right: '10%',
            background: 'radial-gradient(circle, hsl(200 55% 85% / 0.3) 0%, transparent 70%)',
            animation: 'float-ambient 25s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute w-[350px] h-[350px] rounded-full opacity-10 blur-3xl"
          style={{
            bottom: '15%',
            left: '50%',
            background: 'radial-gradient(circle, hsl(270 45% 85% / 0.3) 0%, transparent 70%)',
            animation: 'float-ambient 30s ease-in-out infinite',
            animationDelay: '5s'
          }}
        />
      </div>
    </>
  );
};

export default FluidRibbons;
