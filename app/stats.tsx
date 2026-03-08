import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    selectUserProfile,
    selectUserProgress,
    useUserStore,
} from '@/lib/store/user.store';
import { Colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
    accent,
    theme,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value: string | number;
    accent: string;
    theme: typeof Colors.light;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <View style={[styles.statIconWrap, { backgroundColor: `${accent}1A` }]}>
                <Ionicons name={icon} size={22} color={accent} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StatsScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const isDark = colorScheme === 'dark';

    const profile = useUserStore(selectUserProfile);
    const progress = useUserStore(selectUserProgress);

    const level = progress?.level ?? profile?.level ?? 1;
    const points = profile?.points ?? 0;
    const skrTokens = profile?.skrTokens ?? 0;
    const questionsAnswered = profile?.questionsAnswered ?? 0;
    const answeredTowards = progress?.answeredTowardsNextLevel ?? 0;
    const requiredForNext = progress?.requiredForNextLevel ?? 10;
    const levelPercent = requiredForNext > 0 ? answeredTowards / requiredForNext : 0;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={12}
                    style={[styles.backBtn, { backgroundColor: theme.iconBg }]}
                >
                    <Ionicons name="chevron-back" size={22} color={theme.icon} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Stats</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Level progress card */}
                <View style={[styles.levelCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <View style={styles.levelRow}>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelNumber}>{level}</Text>
                        </View>
                        <View style={styles.levelInfo}>
                            <Text style={[styles.levelTitle, { color: theme.text }]}>Level {level}</Text>
                            <Text style={[styles.levelSub, { color: theme.textSecondary }]}>
                                {answeredTowards} / {requiredForNext} correct to level up
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={[styles.track, { backgroundColor: isDark ? '#27272A' : '#E5E7EB' }]}>
                        <View
                            style={[
                                styles.fill,
                                { width: `${Math.round(levelPercent * 100)}%` as any },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressPct, { color: theme.textTertiary }]}>
                        {Math.round(levelPercent * 100)}% progress
                    </Text>
                </View>

                {/* Stat grid */}
                <View style={styles.grid}>
                    <StatCard
                        icon="star"
                        label="Points"
                        value={points.toLocaleString()}
                        accent="#FBBF24"
                        theme={theme}
                    />
                    <StatCard
                        icon="logo-bitcoin"
                        label="SKR Tokens"
                        value={skrTokens.toLocaleString()}
                        accent="#3B82F6"
                        theme={theme}
                    />
                    <StatCard
                        icon="checkmark-circle"
                        label="Questions Answered"
                        value={questionsAnswered.toLocaleString()}
                        accent="#22C55E"
                        theme={theme}
                    />
                    <StatCard
                        icon="trophy"
                        label="Current Level"
                        value={level}
                        accent="#A855F7"
                        theme={theme}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },

    scroll: { paddingHorizontal: 20, paddingBottom: 60 },

    // Level card
    levelCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
        gap: 12,
    },
    levelRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    levelBadge: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(168,85,247,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(168,85,247,0.4)',
    },
    levelNumber: { fontSize: 22, fontWeight: '900', color: '#A855F7' },
    levelInfo: { flex: 1, gap: 4 },
    levelTitle: { fontSize: 17, fontWeight: '800' },
    levelSub: { fontSize: 13, fontWeight: '500' },
    track: { height: 8, borderRadius: 4, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 4, backgroundColor: '#A855F7' },
    progressPct: { fontSize: 12, fontWeight: '500', textAlign: 'right' },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '47.5%',
        borderRadius: 18,
        borderWidth: 1,
        padding: 18,
        gap: 8,
    },
    statIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    statLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
});
