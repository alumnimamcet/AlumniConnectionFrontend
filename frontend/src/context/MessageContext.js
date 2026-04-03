import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '../services/api';

const MessageContext = createContext(null);

export const useMessage = () => useContext(MessageContext);

// ─────────────────────────────────────────────────────────────────
// MessageProvider
//   Owns all unread-count state so every consumer (Navbar, BottomNav,
//   Messaging page) shares the SAME numbers without double-fetching.
// ─────────────────────────────────────────────────────────────────
export const MessageProvider = ({ children }) => {
  const { user }                              = useAuth();
  const [unreadMap, setUnreadMap]             = useState({});   // { chatId: count }
  const [totalUnreadCount, setTotalUnread]    = useState(0);
  const activeChatIdRef                       = useRef(null);   // which chat the user has open

  // ── Derive total whenever map changes ────────────────────────
  const recalcTotal = useCallback((map) => {
    const total = Object.values(map).reduce((sum, n) => sum + (n || 0), 0);
    setTotalUnread(total);
  }, []);

  // ── Initial fetch from REST: GET /api/chat/unread-count ──────
  const fetchUnreadCounts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await chatService.getUnreadCounts();
      const map = data.data || {};
      setUnreadMap(map);
      recalcTotal(map);
    } catch (_) { /* silent */ }
  }, [user, recalcTotal]);

  // Fetch on login
  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
    } else {
      setUnreadMap({});
      setTotalUnread(0);
    }
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark a chat as read (called from Messaging when user opens chat) ──
  const markChatAsRead = useCallback((chatId) => {
    if (!chatId) return;
    const key = chatId.toString();
    // Zero out locally immediately for instant badge update
    setUnreadMap(prev => {
      const next = { ...prev, [key]: 0 };
      recalcTotal(next);
      return next;
    });
    // Persist on server (fire-and-forget)
    chatService.markChatRead(key).catch(() => {});
  }, [recalcTotal]);

  // ── Increment count when a real-time message arrives ────────
  //   Called from Messaging.js (which has the socket listener)
  const incrementUnread = useCallback((chatId) => {
    if (!chatId) return;
    const key = chatId.toString();
    // If the incoming chat is the one the user has open, mark read immediately
    if (activeChatIdRef.current && activeChatIdRef.current === key) {
      markChatAsRead(key);
      return;
    }
    setUnreadMap(prev => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      recalcTotal(next);
      return next;
    });
  }, [markChatAsRead, recalcTotal]);

  // ── Let Messaging page register which chat is currently open ──
  const setActiveChatId = useCallback((chatId) => {
    // Always store as string so comparison with socket-delivered IDs is consistent
    activeChatIdRef.current = chatId ? chatId.toString() : null;
  }, []);

  return (
    <MessageContext.Provider
      value={{
        unreadMap,
        totalUnreadCount,
        markChatAsRead,
        incrementUnread,
        setActiveChatId,
        fetchUnreadCounts,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;
