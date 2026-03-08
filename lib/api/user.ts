import { apiClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    walletAddress: string;
    username: string | null;
    avatar: string | null;
    points: number;
    skrTokens: number;
    level: number;
    questionsAnswered: number;
    createdAt: string;
}

export interface UpdateUsernamePayload {
    username: string;
}

export interface UserPointsData {
    points: number;
}

export interface UserTokensData {
    skrTokens: number;
}

export interface LevelProgressData {
    /** Current level of the user (1–100). */
    level: number;
    /** Total correct questions answered all-time. */
    questionsAnswered: number;
    /** Questions answered within the current level tier. */
    answeredTowardsNextLevel: number;
    /** Total questions needed to complete the current tier and advance. Formula: N × 10 */
    requiredForNextLevel: number;
}

export interface UserProfileResponse {
    success: boolean;
    data: UserProfile;
}

export interface UserPointsResponse {
    success: boolean;
    data: UserPointsData;
}

export interface UserTokensResponse {
    success: boolean;
    data: UserTokensData;
}

export interface LevelProgressResponse {
    success: boolean;
    data: LevelProgressData;
}

export interface WithdrawPayload {
    amount: number;
}

export interface WithdrawData {
    txSignature: string;
    amount: number;
}

export interface WithdrawResponse {
    success: boolean;
    data: WithdrawData;
}

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
    /**
     * GET /user/me
     * Returns the full profile of the currently authenticated user.
     * Requires JWT.
     */
    getMe: () =>
        apiClient.get<UserProfileResponse>("/user/me"),

    /**
     * GET /user/me/points
     * Lightweight endpoint returning only the user's accumulated points.
     * Optimal for frequent UI polling. Requires JWT.
     */
    getMyPoints: () =>
        apiClient.get<UserPointsResponse>("/user/me/points"),

    /**
     * GET /user/me/tokens
     * Lightweight endpoint returning only the user's accumulated $SKR tokens.
     * Requires JWT.
     */
    getMyTokens: () =>
        apiClient.get<UserTokensResponse>("/user/me/tokens"),

    /**
     * GET /user/me/progress
     * Returns current level and progress breakdown towards the next level.
     * Level is derived from total correct answers: questionsToNextLevel(N) = N × 10.
     * Requires JWT.
     */
    getMyProgress: () =>
        apiClient.get<LevelProgressResponse>("/user/me/progress"),

    /**
     * PATCH /user/me/username
     * Updates the user's display username.
     * Requires JWT.
     */
    updateUsername: (payload: UpdateUsernamePayload) =>
        apiClient.patch<UserProfileResponse>("/user/me/username", payload),

    /**
     * POST /user/me/withdraw
     * Deducts the specified amount of $SKR tokens from the user's in-app balance
     * and transfers equivalent SPL tokens from the treasury to the user's Solana wallet.
     * Requires JWT.
     */
    withdraw: (payload: WithdrawPayload) =>
        apiClient.post<WithdrawResponse>("/user/me/withdraw", payload),
};
