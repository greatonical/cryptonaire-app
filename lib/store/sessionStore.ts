import { STORE_KEYS } from "@/constants/StoreKeys";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionState {
    /** True once the user has completed the onboarding flow */
    onboardingSeen: boolean;
    /** Whether the store has been hydrated from SecureStore */
    isHydrated: boolean;

    // ── Actions ──────────────────────────────────────────────────────────────
    /** Load persisted session flags from SecureStore – call once on boot */
    hydrate: () => Promise<void>;
    /** Mark onboarding as completed (persists to SecureStore) */
    setOnboardingSeen: (value: boolean) => Promise<void>;
    /** Reset all session flags (e.g. on sign-out) */
    reset: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set) => ({
    onboardingSeen: false,
    isHydrated: false,

    hydrate: async () => {
        try {
            const raw = await SecureStore.getItemAsync(STORE_KEYS.ONBOARDING_COMPLETE);
            set({
                onboardingSeen: raw === "true",
                isHydrated: true,
            });
        } catch {
            set({ isHydrated: true });
        }
    },

    setOnboardingSeen: async (value) => {
        await SecureStore.setItemAsync(
            STORE_KEYS.ONBOARDING_COMPLETE,
            String(value)
        );
        set({ onboardingSeen: value });
    },

    reset: async () => {
        await SecureStore.deleteItemAsync(STORE_KEYS.ONBOARDING_COMPLETE).catch(
            () => { }
        );
        set({ onboardingSeen: false });
    },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectOnboardingSeen = (s: SessionState) => s.onboardingSeen;
export const selectSessionHydrated = (s: SessionState) => s.isHydrated;
