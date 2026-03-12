import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { supportOperations } from '@/services/firebase/support.js';

const DEFAULT_TICKET_LIMIT = 20;

const useSupportTicketState = ({ userId, limit = DEFAULT_TICKET_LIMIT } = {}) => {
  const [userTickets, setUserTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [markingSeen, setMarkingSeen] = useState({});

  const unreadTicketCount = useMemo(
    () => userTickets.filter((ticket) => ticket.customerUnreadUpdate).length,
    [userTickets]
  );

  const loadUserTickets = useCallback(async () => {
    if (!userId) {
      setUserTickets([]);
      setLoadingTickets(false);
      return;
    }

    setLoadingTickets(true);
    try {
      const tickets = await supportOperations.getUserTickets(userId, limit);
      setUserTickets(tickets);
    } catch {
      toast.error('Could not load your support tickets right now.');
    } finally {
      setLoadingTickets(false);
    }
  }, [limit, userId]);

  useEffect(() => {
    loadUserTickets();
  }, [loadUserTickets]);

  useEffect(() => {
    if (!userId) return undefined;

    setLoadingTickets(true);
    const unsubscribe = supportOperations.subscribeToUserTickets(
      userId,
      limit,
      (tickets) => {
        setUserTickets(tickets);
        setLoadingTickets(false);
      },
      () => {
        setLoadingTickets(false);
        toast.error('Live support updates are unavailable right now.');
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [limit, userId]);

  const markTicketSeen = useCallback(async (ticketId) => {
    if (!ticketId) return;

    setMarkingSeen((previous) => ({ ...previous, [ticketId]: true }));
    try {
      const updatedCount = await supportOperations.markTicketUpdatesSeen([ticketId]);
      if (updatedCount > 0) {
        setUserTickets((previous) => previous.map((ticket) => (
          ticket.id === ticketId
            ? { ...ticket, customerUnreadUpdate: false, customerUnreadUpdateCount: 0 }
            : ticket
        )));
      }
    } finally {
      setMarkingSeen((previous) => ({ ...previous, [ticketId]: false }));
    }
  }, []);

  return {
    loadingTickets,
    loadUserTickets,
    markingSeen,
    markTicketSeen,
    unreadTicketCount,
    userTickets
  };
};

export default useSupportTicketState;
