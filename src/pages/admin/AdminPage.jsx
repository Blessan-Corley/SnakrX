import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  AdminStats,
  AdminTabs,
  UsersTab,
  MatchHistoryTab,
  AnalyticsTab,
  SupportTicketsTab
} from '@/components/admin';
import { useAdminDataController } from './useAdminDataController.js';

/**
 * Admin Page Component
 * Provides user management, analytics, and system administration
 */
const AdminPage = () => {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'users');
  const isAdmin = userProfile?.role === 'admin';
  const {
    error,
    applyGameFilters,
    applyTicketFilters,
    applyUserFilters,
    fetchSupportTickets,
    gameFilters,
    handleTicketUpdate,
    handleUserBan,
    historyLoading,
    matchHistory,
    moderatingUserId,
    overviewLoading,
    previousGamesPage,
    previousUsersPage,
    refreshMatchHistory,
    gamesPagination,
    refreshUsers,
    setError,
    stats,
    supportInboxBadge,
    supportTicketSummary,
    supportTickets,
    supportTicketsPagination,
    ticketFilters,
    ticketsLoading,
    updateGameDraftFilter,
    updateTicketDraftFilter,
    updateUserDraftFilter,
    users,
    userFilters,
    usersLoading,
    usersPagination,
    nextGamesPage,
    nextSupportTicketsPage,
    nextUsersPage,
    previousSupportTicketsPage,
    resetGameFilters,
    resetTicketFilters,
    resetUserFilters
  } = useAdminDataController({ activeTab, isAdmin });

  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'users';
    setActiveTab((currentTab) => (currentTab === nextTab ? currentTab : nextTab));
  }, [searchParams]);

  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'users';
    if (currentTab === activeTab) return;

    const nextParams = new URLSearchParams(searchParams);
    if (activeTab === 'users') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', activeTab);
    }
    setSearchParams(nextParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Shield className="mx-auto text-red-400" size={48} />
          <h1 className="text-2xl font-bold text-white">Admin access required</h1>
          <p className="text-white/70">Your account does not have administrator permissions.</p>
        </div>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Shield className="inline mr-3 text-red-400" size={48} />
            Admin Panel
          </h1>
          <p className="text-xl text-white/70">
            System management and user administration
          </p>
        </motion.div>

        {/* Stats Overview */}
        <AdminStats stats={stats} loading={overviewLoading} />

        {/* Navigation Tabs */}
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} ticketBadge={supportInboxBadge} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                loading={usersLoading}
                moderatingUserId={moderatingUserId}
                filters={userFilters}
                onFilterChange={updateUserDraftFilter}
                onApplyFilters={applyUserFilters}
                onResetFilters={resetUserFilters}
                onRefresh={refreshUsers}
                onBanUser={handleUserBan}
                pagination={usersPagination}
                onPrevPage={previousUsersPage}
                onNextPage={nextUsersPage}
              />
            )}

            {activeTab === 'history' && (
              <MatchHistoryTab
                matchHistory={matchHistory}
                loading={historyLoading}
                filters={gameFilters}
                onFilterChange={updateGameDraftFilter}
                onApplyFilters={applyGameFilters}
                onResetFilters={resetGameFilters}
                pagination={gamesPagination}
                onPrevPage={previousGamesPage}
                onNextPage={nextGamesPage}
                onRefresh={refreshMatchHistory}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab stats={stats} />
            )}

            {activeTab === 'tickets' && (
              <SupportTicketsTab
                tickets={supportTickets}
                loading={ticketsLoading}
                filters={ticketFilters}
                summary={supportTicketSummary}
                onFilterChange={updateTicketDraftFilter}
                onApplyFilters={applyTicketFilters}
                onResetFilters={resetTicketFilters}
                onRefresh={fetchSupportTickets}
                onUpdateTicket={handleTicketUpdate}
                pagination={supportTicketsPagination}
                onPrevPage={previousSupportTicketsPage}
                onNextPage={nextSupportTicketsPage}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-2">
                <XCircle size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
