import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../auth/Auth';
import { realtimeClient } from '../services/realtimeService';

type RealtimeEventType = 
  | 'task_created' 
  | 'task_updated' 
  | 'task_deleted' 
  | 'task_status_changed' 
  | 'task_shared' 
  | 'task_unshared' 
  | 'notification' 
  | 'connection_lost' 
  | 'connection_error';

/**
 * Hook to manage real-time updates
 * Automatically connects on mount and disconnects on unmount
 */
export function useRealtime() {
  const unsubscribesRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await realtimeClient.connect();
        } else {
          realtimeClient.disconnect();
        }
      } catch (error) {
        console.error('Failed to connect to real-time server:', error);
      }
    });

    // Cleanup: disconnect on unmount
    return () => {
      // Unsubscribe from all events
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];

      unsubscribeAuth();
    };
  }, []);

  /**
   * Subscribe to a real-time event
   */
  const on = useCallback((event: RealtimeEventType, callback: Function) => {
    const unsubscribe = realtimeClient.on(event, callback);
    unsubscribesRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  return {
    on,
    isConnected: () => realtimeClient.isConnected(),
  };
}
