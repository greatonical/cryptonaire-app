import { Button } from "@/components/ui/button/Button";
import { useSessionStore } from "@/lib/store/sessionStore";
import { useMobileWallet } from "@wallet-ui/react-native-web3js";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Assets ───────────────────────────────────────────────────────────────────

const Slide1 = require("@/assets/animations/coins.json");
const Slide2 = require("@/assets/animations/shield.json");
const Slide3 = require("@/assets/animations/trophy.json");

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
    {
        key: "learn",
        title: "Learn crypto, fast",
        text: "Quick questions. Bitesize explanations.",
        anim: Slide1,
    },
    {
        key: "fair",
        title: "Fair play",
        text: "Anti-fraud in place. Keep it clean.",
        anim: Slide2,
    },
    {
        key: "rank",
        title: "Climb the ranks",
        text: "Earn weekly points and badges.",
        anim: Slide3,
    },
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const [index, setIndex] = useState(0);
    const [isConnecting, setIsConnecting] = useState(false);
    const setOnboardingSeen = useSessionStore((s) => s.setOnboardingSeen);
    const router = useRouter();
    const { account, connect } = useMobileWallet();

    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Once wallet connects, finish onboarding and go home
    useEffect(() => {
        if (account && isConnecting) {
            (async () => {
                await setOnboardingSeen(true);
                router.replace("/(tabs)");
            })();
        }
    }, [account, isConnecting]);

    const transitionTo = (nextIndex: number) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setIndex(nextIndex);
    };

    const handleSkip = async () => {
        await setOnboardingSeen(true);
        router.replace("/(tabs)");
    };

    const handleConnectWallet = async () => {
        try {
            setIsConnecting(true);
            await connect();
        } catch {
            setIsConnecting(false);
        }
    };

    const slide = SLIDES[index];
    const isLast = index === SLIDES.length - 1;

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">

            {/* ── Skip ──────────────────────────────────────────────────────── */}
            <View className="flex-row justify-end px-6 pt-2">
                {!isLast && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={handleSkip}
                        accessibilityLabel="Skip onboarding"
                    >
                        Skip
                    </Button>
                )}
            </View>

            {/* ── Main card ─────────────────────────────────────────────────── */}
            <View className="flex-1 items-center justify-center px-6">
                <Animated.View
                    style={[styles.card, { opacity: fadeAnim }]}
                    className="w-full rounded-3xl bg-zinc-900 border border-zinc-800 items-center p-8 gap-6"
                >
                    {/* Lottie animation */}
                    <View className="h-52 w-52">
                        <LottieView source={slide.anim} autoPlay loop style={styles.lottie} />
                    </View>

                    {/* Text */}
                    <View className="items-center gap-2">
                        <Text className="text-white text-2xl font-bold text-center tracking-tight">
                            {slide.title}
                        </Text>
                        <Text className="text-zinc-400 text-base text-center leading-relaxed">
                            {slide.text}
                        </Text>
                    </View>

                    {/* CTA */}
                    {isLast ? (
                        <Button
                            variant="wallet"
                            size="lg"
                            block
                            loading={isConnecting}
                            onPress={handleConnectWallet}
                            accessibilityLabel="Login via Wallet"
                            leftIcon={
                                <Text className="text-zinc-950 font-bold text-base">◎</Text>
                            }
                        >
                            Login via Wallet
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="lg"
                            block
                            onPress={() => transitionTo(index + 1)}
                            accessibilityLabel="Next slide"
                        >
                            Next
                        </Button>
                    )}
                </Animated.View>
            </View>

            {/* ── Dot indicator ─────────────────────────────────────────────── */}
            <View className="flex-row justify-center gap-2 pb-10">
                {SLIDES.map((_, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => transitionTo(idx)}
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                        accessibilityLabel={`Go to slide ${idx + 1}`}
                    >
                        <View
                            className={`h-1.5 rounded-full ${idx === index ? "w-8 bg-amber-400" : "w-2 bg-zinc-700"
                                }`}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    lottie: {
        width: "100%",
        height: "100%",
    },
});
