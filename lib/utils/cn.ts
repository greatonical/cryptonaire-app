import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely with clsx + tailwind-merge.
 * Use this whenever you need to conditionally apply or override NativeWind classes.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
