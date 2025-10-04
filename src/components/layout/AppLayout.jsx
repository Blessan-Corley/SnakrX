import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Main Application Layout
 * Provides consistent layout structure for all authenticated pages
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Sidebar */}
              <Sidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main 
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'lg:ml-64' : ''}
          `}
          layout
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-dark opacity-90" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
        }} />
      </div>
    </div>
  );
};

export default AppLayout;