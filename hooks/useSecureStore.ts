import { ALL_STORE_KEYS, StoreKey } from "@/constants/StoreKeys";
import * as SecureStore from "expo-secure-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SecureStoreOptions = SecureStore.SecureStoreOptions;

export interface UseSecureStore {
    /** Check if SecureStore is available on this device */
    isAvailable: () => Promise<boolean>;
    /** Check if biometric authentication can be used */
    canUseBiometrics: () => boolean;
    /** Save a string value */
    setItem: (
        key: StoreKey,
        value: string,
        options?: SecureStoreOptions
    ) => Promise<void>;
    /** Save any JSON-serialisable value */
    setJSON: <T>(
        key: StoreKey,
        value: T,
        options?: SecureStoreOptions
    ) => Promise<void>;
    /** Retrieve a string value (returns null if not set) */
    getItem: (
        key: StoreKey,
        options?: SecureStoreOptions
    ) => Promise<string | null>;
    /** Retrieve and parse a JSON value (returns null if not set or parse fails) */
    getJSON: <T>(
        key: StoreKey,
        options?: SecureStoreOptions
    ) => Promise<T | null>;
    /** Retrieve a string value synchronously (blocks JS thread) */
    getItemSync: (key: StoreKey, options?: SecureStoreOptions) => string | null;
    /** Delete a single key */
    deleteItem: (key: StoreKey, options?: SecureStoreOptions) => Promise<void>;
    /** Delete all registered keys (full sign-out / wipe) */
    deleteAllKeys: (options?: SecureStoreOptions) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSecureStore(): UseSecureStore {
    /** Check if SecureStore is available on this device */
    const isAvailable = async (): Promise<boolean> => {
        try {
            return await SecureStore.isAvailableAsync();
        } catch {
            return false;
        }
    };

    /** Check if biometric authentication can be used with requireAuthentication */
    const canUseBiometrics = (): boolean => {
        try {
            return SecureStore.canUseBiometricAuthentication();
        } catch {
            return false;
        }
    };

    /** Store a raw string */
    const setItem = async (
        key: StoreKey,
        value: string,
        options?: SecureStoreOptions
    ): Promise<void> => {
        await SecureStore.setItemAsync(key, value, options);
    };

    /** Serialize and store any JSON-serialisable value */
    const setJSON = async <T>(
        key: StoreKey,
        value: T,
        options?: SecureStoreOptions
    ): Promise<void> => {
        const serialised = JSON.stringify(value);
        await SecureStore.setItemAsync(key, serialised, options);
    };

    /** Retrieve a raw string */
    const getItem = async (
        key: StoreKey,
        options?: SecureStoreOptions
    ): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(key, options);
        } catch {
            return null;
        }
    };

    /** Retrieve and deserialise a JSON value */
    const getJSON = async <T>(
        key: StoreKey,
        options?: SecureStoreOptions
    ): Promise<T | null> => {
        try {
            const raw = await SecureStore.getItemAsync(key, options);
            if (raw === null) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    };

    /**
     * Synchronously retrieve a string value.
     * ⚠️  Blocks the JS thread – use sparingly (e.g. during app boot).
     */
    const getItemSync = (
        key: StoreKey,
        options?: SecureStoreOptions
    ): string | null => {
        try {
            return SecureStore.getItem(key, options);
        } catch {
            return null;
        }
    };

    /** Remove a single item */
    const deleteItem = async (
        key: StoreKey,
        options?: SecureStoreOptions
    ): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(key, options);
        } catch {
            // Key may not exist – treat as a no-op
        }
    };

    /**
     * Wipe every registered STORE_KEY from SecureStore.
     * Call this on sign-out or factory reset.
     */
    const deleteAllKeys = async (
        options?: SecureStoreOptions
    ): Promise<void> => {
        await Promise.allSettled(
            ALL_STORE_KEYS.map((key) => SecureStore.deleteItemAsync(key, options))
        );
    };

    return {
        isAvailable,
        canUseBiometrics,
        setItem,
        setJSON,
        getItem,
        getJSON,
        getItemSync,
        deleteItem,
        deleteAllKeys,
    };
}
