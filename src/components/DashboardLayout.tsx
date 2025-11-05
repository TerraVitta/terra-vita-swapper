import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useUserRole } from '../hooks/useUserRole';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { role } = useUserRole();

  const navItems = {
    admin: [
      { label: 'Overview', path: '/admin' },
      { label: 'Users', path: '/admin/users' },
      { label: 'Products', path: '/admin/products' },
      { label: 'Sustainability', path: '/admin/sustainability' },
    ],
    seller: [
      { label: 'Overview', path: '/seller' },
      { label: 'Products', path: '/seller/products' },
      { label: 'Orders', path: '/seller/orders' },
      { label: 'Analytics', path: '/seller/analytics' },
    ],
    buyer: [
      { label: 'Overview', path: '/dashboard' },
      { label: 'Orders', path: '/dashboard/orders' },
      { label: 'Favorites', path: '/dashboard/favorites' },
      { label: 'Settings', path: '/dashboard/settings' },
    ],
  }[role || 'buyer'];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-y-0 left-0 w-64 glass-card"
      >
        <div className="flex h-full flex-col">
          {/* Profile Section */}
          <div className="flex-shrink-0 p-4">
            <div className="glass-card p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-terra-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">John Doe</div>
                  <div className="text-xs text-muted-foreground capitalize">{role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="glass-card group flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-terra-500"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="flex-shrink-0 p-4">
            <button className="glass-card w-full px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-white">
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  );
};