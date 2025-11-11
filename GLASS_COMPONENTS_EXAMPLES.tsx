// LIQUID GLASS IMPLEMENTATION EXAMPLES
// Copy-paste ready components for your Terra Vitta Swapper

// ============================================
// 1. GLASS CARD COMPONENT
// ============================================

export const GlassCard = ({ 
  children, 
  className = '',
  interactive = true,
  shimmer = true 
}) => (
  <div className={`
    glass-panel 
    rounded-2xl p-6 
    ${interactive ? 'card-hover' : ''}
    ${shimmer ? 'liquid-shimmer' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// USAGE:
// <GlassCard>
//   <h3>Premium Card</h3>
//   <p>With shimmer and hover effect</p>
// </GlassCard>


// ============================================
// 2. GLASS BUTTON WITH RIPPLE
// ============================================

export const GlassButton = ({ 
  children, 
  onClick, 
  glow = true,
  className = '',
  ...props 
}) => (
  <button
    onClick={onClick}
    className={`
      glass-button 
      glass-button-enhanced
      rounded-lg px-6 py-2
      transition-all duration-300
      ${glow ? 'btn-glow' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

// USAGE:
// <GlassButton glow onClick={() => navigate('/auth')}>
//   Sign In
// </GlassButton>


// ============================================
// 3. GLASS FORM WRAPPER
// ============================================

export const GlassForm = ({ 
  children, 
  onSubmit, 
  title,
  className = ''
}) => (
  <form 
    onSubmit={onSubmit}
    className={`
      glass-panel 
      rounded-3xl p-8 md:p-12
      space-y-6
      modal-glass
      ${className}
    `}
  >
    {title && (
      <h2 className="text-3xl font-bold text-foreground">
        {title}
      </h2>
    )}
    {children}
  </form>
);

// USAGE:
// <GlassForm title="Login" onSubmit={handleSubmit}>
//   <input className="glass-input w-full" />
//   <GlassButton className="w-full">Submit</GlassButton>
// </GlassForm>


// ============================================
// 4. GLASS NAVIGATION BAR
// ============================================

export const GlassNavbar = ({ items, logo }) => (
  <nav className="navbar-glass">
    <div className="container mx-auto flex justify-between items-center py-4 px-6">
      <div className="flex items-center gap-2">
        <Recycle className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">{logo}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {items.map((item) => (
          <GlassButton 
            key={item.label}
            onClick={item.onClick}
            className="text-sm"
          >
            {item.label}
          </GlassButton>
        ))}
      </div>
    </div>
  </nav>
);

// USAGE:
// <GlassNavbar 
//   logo="Terra Vitta"
//   items={[
//     { label: 'Home', onClick: () => {} },
//     { label: 'About', onClick: () => {} }
//   ]}
// />


// ============================================
// 5. GLASS MODAL DIALOG
// ============================================

export const GlassModal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm',
  onConfirm,
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="modal-glass relative z-10 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="mb-6 text-muted-foreground">
          {children}
        </div>
        <div className="flex gap-3 justify-end">
          <GlassButton onClick={onClose}>
            {cancelText}
          </GlassButton>
          <GlassButton glow onClick={onConfirm}>
            {confirmText}
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

// USAGE:
// <GlassModal
//   isOpen={isOpen}
//   onClose={() => setIsOpen(false)}
//   title="Confirm Action"
//   onConfirm={handleConfirm}
// >
//   Are you sure you want to continue?
// </GlassModal>


// ============================================
// 6. GLASS STAT CARD (like counters)
// ============================================

export const GlassStatCard = ({ 
  value, 
  label, 
  icon: Icon,
  color = 'text-primary',
  className = ''
}) => (
  <div className={`
    glass-panel 
    rounded-2xl px-6 py-4
    counter-glow
    text-center
    ${className}
  `}>
    {Icon && (
      <div className={`flex justify-center mb-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    )}
    <div className="text-3xl font-bold text-primary mb-1">
      {value}
    </div>
    <div className="text-sm text-muted-foreground">
      {label}
    </div>
  </div>
);

// USAGE:
// <GlassStatCard 
//   value="12,847"
//   label="Swaps Completed"
//   icon={Recycle}
// />


// ============================================
// 7. GLASS INPUT WITH LABEL
// ============================================

export const GlassInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange,
  type = 'text',
  className = ''
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        glass-input 
        w-full
        rounded-lg
        px-4 py-3
        text-foreground
        placeholder:text-muted-foreground
        focus:outline-none
        ${className}
      `}
    />
  </div>
);

// USAGE:
// <GlassInput
//   label="Email"
//   placeholder="your@email.com"
//   value={email}
//   onChange={(e) => setEmail(e.target.value)}
// />


// ============================================
// 8. GLASS GRID (for multiple items)
// ============================================

export const GlassGrid = ({ 
  items, 
  columns = 3, 
  renderItem,
  className = ''
}) => (
  <div className={`
    grid 
    grid-cols-1 
    md:grid-cols-${columns}
    gap-6
    ${className}
  `}>
    {items.map((item, idx) => (
      <GlassCard key={idx}>
        {renderItem(item)}
      </GlassCard>
    ))}
  </div>
);

// USAGE:
// <GlassGrid
//   columns={3}
//   items={products}
//   renderItem={(product) => (
//     <>
//       <h3>{product.name}</h3>
//       <p>{product.description}</p>
//     </>
//   )}
// />


// ============================================
// 9. GLASS SIDEBAR
// ============================================

export const GlassSidebar = ({ 
  items, 
  onItemClick,
  className = ''
}) => (
  <aside className={`sidebar-glass rounded-r-2xl p-6 h-screen ${className}`}>
    <nav className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`
            w-full text-left px-4 py-3 rounded-lg
            glass-button
            transition-all duration-300
            ${item.active ? 'bg-primary/20 border-primary' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon className="h-5 w-5" />}
            <span>{item.label}</span>
          </div>
        </button>
      ))}
    </nav>
  </aside>
);

// USAGE:
// <GlassSidebar
//   items={[
//     { id: 1, label: 'Home', icon: Home, active: true },
//     { id: 2, label: 'Profile', icon: User }
//   ]}
//   onItemClick={(id) => navigate(`/page/${id}`)}
// />


// ============================================
// 10. GLASS HERO SECTION
// ============================================

export const GlassHero = ({ 
  title, 
  subtitle, 
  cta,
  image,
  className = ''
}) => (
  <section className={`
    container mx-auto py-20 px-6
    ${className}
  `}>
    <div className="glass-panel rounded-3xl p-12 md:p-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          {title}
        </h1>
        <p className="text-xl text-muted-foreground">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-6">
          {cta && cta.map((btn, idx) => (
            <GlassButton 
              key={idx}
              glow={btn.primary}
              onClick={btn.onClick}
            >
              {btn.label}
            </GlassButton>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// USAGE:
// <GlassHero
//   title="Trade Smart. Live Green."
//   subtitle="Join our sustainable community"
//   cta={[
//     { label: 'Get Started', onClick: () => {}, primary: true },
//     { label: 'Learn More', onClick: () => {} }
//   ]}
// />


// ============================================
// 11. GLASS SEARCH BAR
// ============================================

export const GlassSearchBar = ({ 
  placeholder = 'Search...',
  onSearch,
  icon: Icon = Search
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`
          glass-panel 
          pl-12 pr-4 py-3
          w-full
          rounded-lg
          search-focus
          border-0
        `}
      />
    </form>
  );
};

// USAGE:
// <GlassSearchBar
//   placeholder="What would you like to swap?"
//   onSearch={(query) => navigate(`/search?q=${query}`)}
// />


// ============================================
// 12. GLASS LOADING SPINNER
// ============================================

export const GlassLoader = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} glass-panel rounded-full animate-spin`}>
        <div className="h-full w-full border-4 border-primary/20 border-t-primary rounded-full" />
      </div>
    </div>
  );
};

// USAGE:
// <GlassLoader size="lg" />


// ============================================
// FULL PAGE EXAMPLE
// ============================================

export const GlassProductPage = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <GlassNavbar 
        logo="Terra Vitta"
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Products', onClick: () => {} },
          { label: 'Sign In', onClick: () => {} }
        ]}
      />

      {/* Hero */}
      <GlassHero
        title="Sustainable Swapping"
        subtitle="Trade items, save the planet"
        cta={[
          { label: 'Start Now', primary: true, onClick: () => {} },
          { label: 'Learn More', onClick: () => {} }
        ]}
      />

      {/* Stats */}
      <section className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassStatCard value="12,847" label="Swaps Completed" />
          <GlassStatCard value="8,532 kg" label="CO₂ Saved" />
          <GlassStatCard value="50K+" label="Community Members" />
        </div>
      </section>

      {/* Search */}
      <section className="container mx-auto py-12 px-6">
        <GlassSearchBar 
          onSearch={(q) => console.log('Search:', q)}
        />
      </section>

      {/* Footer */}
      <footer className="glass-panel border-t mt-20">
        <div className="container mx-auto py-8 px-6">
          <p className="text-center text-muted-foreground">
            © 2025 Terra Vitta. Building a sustainable future.
          </p>
        </div>
      </footer>
    </div>
  );
};

// All components are ready to use! 🎉✨
// Import them into your pages and customize as needed.
