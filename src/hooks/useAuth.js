"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

/** Client-side view of the session (for the header and forms). Pages still check auth on the server. */
export function AuthProvider({ children }) {
  const router = useRouter();
  const [state, setState] = useState({ user: null, loading: true });

  const refresh = useCallback(async () => {
    try {
      const { user } = await api("/api/auth/me");
      setState({ user, loading: false });
      return user;
    } catch {
      setState({ user: null, loading: false });
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setState({ user: null, loading: false });
      router.push("/");
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ ...state, refresh, signOut }), [state, refresh, signOut]);
  return createElement(AuthContext.Provider, { value }, children);
}

export default function useAuth() {
  return useContext(AuthContext);
}
