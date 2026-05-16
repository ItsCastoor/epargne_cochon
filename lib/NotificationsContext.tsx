import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getNotifications } from "./api";
import { useAuth } from "./AuthContext";

interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCount: 0,
  refresh: async () => {},
});

const POLL_INTERVAL_MS = 30000; // 30s

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await getNotifications();
      let list: Array<{ isRead?: boolean }> = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (
        (data as Record<string, unknown>).data &&
        Array.isArray((data as Record<string, unknown>).data)
      ) {
        list = (data as Record<string, unknown>).data as Array<{
          isRead?: boolean;
        }>;
      } else if (
        (data as Record<string, unknown>).notifications &&
        Array.isArray((data as Record<string, unknown>).notifications)
      ) {
        list = (data as Record<string, unknown>).notifications as Array<{
          isRead?: boolean;
        }>;
      }

      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch {
      // silencieux : on garde la valeur précédente
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue =>
  useContext(NotificationsContext);

