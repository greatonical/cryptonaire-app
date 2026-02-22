/**
 * Central registry of all SecureStore keys used in the app.
 * Always reference keys from here to avoid magic strings and typos.
 */
export const STORE_KEYS = {
    // Auth
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER_ID: "user_id",

    // Wallet
    WALLET_PRIVATE_KEY: "wallet_private_key",
    WALLET_MNEMONIC: "wallet_mnemonic",
    WALLET_ADDRESS: "wallet_address",

    // Preferences
    ONBOARDING_COMPLETE: "onboarding_complete",
    BIOMETRIC_ENABLED: "biometric_enabled",
} as const;

export type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS];

/** All registered keys – used by deleteAllKeys() */
export const ALL_STORE_KEYS: StoreKey[] = Object.values(STORE_KEYS);
