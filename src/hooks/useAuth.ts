import { useState, useEffect } from 'react';
import { blink, getAnonymousId, UserRole, getUserRole } from '../lib/blink';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setLoading(true);
      if (state.user) {
        const role = await getUserRole(state.user.id);
        setUser({
          id: state.user.id,
          name: state.user.displayName || state.user.email || 'User',
          role: role,
        });
      } else {
        const anonId = getAnonymousId();
        setUser({
          id: anonId,
          name: 'Guest',
          role: 'subscriber', // Anonymous users behave like subscribers for delete permissions
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
