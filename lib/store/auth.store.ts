import { STORE_KEYS } from "@/constants/StoreKeys";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    email?: string;
    username?: string;
    walletAddress?: string;
}

interface AuthState {
    /** The currently authenticated user, or null if unauthenticated */
    user: AuthUser | null;
    /** Raw auth token stored in SecureStore */
    token: string | null;
    /** Whether the app has finished hydrating from SecureStore */
    isHydrated: boolean;
    /** True while an auth operation (sign-in / sign-out) is in progress */
    isLoading: boolean;

    // ── Actions ──────────────────────────────────────────────────────────────
    /** Hydrate store from SecureStore – call once on app boot */
    hydrate: () => Promise<void>;
    /** Persist token + user after a successful login */
    signIn: (token: string, user: AuthUser) => Promise<void>;
    /** Wipe all auth data from memory and SecureStore */
    signOut: () => Promise<void>;
    /** Update user fields (e.g. after profile edit) */
    updateUser: (partial: Partial<AuthUser>) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isHydrated: false,
    isLoading: false,

    hydrate: async () => {
        try {
            const [token, userRaw] = await Promise.all([
                SecureStore.getItemAsync(STORE_KEYS.AUTH_TOKEN),
                SecureStore.getItemAsync(STORE_KEYS.USER_ID),
            ]);

            if (token && userRaw) {
                set({
                    token,
                    user: JSON.parse(userRaw) as AuthUser,
                    isHydrated: true,
                });
            } else {
                set({ isHydrated: true });
            }
        } catch {
            set({ isHydrated: true });
        }
    },

    signIn: async (token, user) => {
        set({ isLoading: true });
        try {
            await Promise.all([
                SecureStore.setItemAsync(STORE_KEYS.AUTH_TOKEN, token),
                SecureStore.setItemAsync(STORE_KEYS.USER_ID, JSON.stringify(user)),
            ]);
            set({ token, user, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await Promise.allSettled([
                SecureStore.deleteItemAsync(STORE_KEYS.AUTH_TOKEN),
                SecureStore.deleteItemAsync(STORE_KEYS.REFRESH_TOKEN),
                SecureStore.deleteItemAsync(STORE_KEYS.USER_ID),
            ]);
            set({ token: null, user: null, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    updateUser: (partial) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...partial };
        set({ user: updated });
        // Fire-and-forget persistence
        SecureStore.setItemAsync(
            STORE_KEYS.USER_ID,
            JSON.stringify(updated)
        ).catch(() => { });
    },
}));

// ─── Convenience selectors ────────────────────────────────────────────────────

export const selectIsAuthenticated = (s: AuthState) =>
    Boolean(s.token && s.user);
export const selectUser = (s: AuthState) => s.user;
export const selectToken = (s: AuthState) => s.token;
export const selectIsHydrated = (s: AuthState) => s.isHydrated;
