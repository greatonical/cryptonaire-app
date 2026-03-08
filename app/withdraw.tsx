import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/popup/toast';
import { useWithdrawMutation } from '@/lib/api/mutations';
import { selectUserProfile, useUserStore } from '@/lib/store/user.store';
import { Colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WithdrawScreen() {
    const profile = useUserStore(selectUserProfile);
    const { colorScheme } = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const toast = useToast();

    const SKR_DECIMALS = 6;

    const [amountText, setAmountText] = useState('');
    const withdrawMutation = useWithdrawMutation();

    const balance = profile?.skrTokens ?? 0;

    // Allow digits and a single decimal point; cap to SKR_DECIMALS decimal places
    function sanitizeInput(raw: string): string {
        // Only digits and one dot
        let v = raw.replace(/[^0-9.]/g, '');
        const parts = v.split('.');
        if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
        // Limit decimal places
        if (v.includes('.')) {
            const [whole, frac] = v.split('.');
            v = whole + '.' + frac.slice(0, SKR_DECIMALS);
        }
        return v;
    }

    const amount = parseFloat(amountText);
    const isValidAmount = !isNaN(amount) && amount > 0 && amount <= balance;

    const handleWithdraw = async () => {
        if (!isValidAmount) {
            toast.error('Invalid Amount', `Enter an amount between 0.${'0'.repeat(SKR_DECIMALS - 1)}1 and ${balance}.`);
            return;
        }

        // Round to avoid floating-point drift beyond SKR_DECIMALS places
        const rounded = parseFloat(amount.toFixed(SKR_DECIMALS));

        try {
            const result = await withdrawMutation.mutateAsync({ amount: rounded });
            toast.success('Withdrawal Submitted', `${result.data.amount} $SKR sent to your wallet.`);
            router.back();
        } catch (error: any) {
            const message = error?.response?.data?.error || error.message || 'Withdrawal failed';
            toast.error('Error', message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => router.back()}
                        className="px-2"
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.icon} />
                    </Button>
                    <Text style={[styles.title, { color: theme.text }]}>Withdraw Tokens</Text>
                    <View style={styles.headerRight} />
                </View>

                {/* Content */}
                <View style={styles.content}>

                    {/* Balance card */}
                    <View style={[styles.balanceCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                        <View style={[styles.tokenIconWrap, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                            <Ionicons name="logo-bitcoin" size={24} color="#FBBF24" />
                        </View>
                        <View style={styles.balanceInfo}>
                            <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Available Balance</Text>
                            <Text style={[styles.balanceValue, { color: theme.text }]}>
                                {balance.toLocaleString()} <Text style={styles.balanceTicker}>$SKR</Text>
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.label, { color: theme.textSecondary }]}>
                        Enter the amount of $SKR tokens to withdraw. They will be sent to your connected Solana wallet on devnet.
                    </Text>

                    {/* Amount input */}
                    <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="0.000000"
                            placeholderTextColor={theme.textTertiary}
                            value={amountText}
                            onChangeText={(v) => setAmountText(sanitizeInput(v))}
                            keyboardType="decimal-pad"
                            returnKeyType="done"
                            onSubmitEditing={handleWithdraw}
                        />
                        <Text style={[styles.inputTicker, { color: theme.textSecondary }]}>$SKR</Text>
                        <Button
                            variant="soft"
                            size="sm"
                            onPress={() => setAmountText(String(balance))}
                            disabled={balance === 0}
                        >
                            Max
                        </Button>
                    </View>

                    {/* Inline error hint */}
                    {amountText.length > 0 && !isValidAmount && (
                        <Text style={[styles.hint, { color: theme.danger }]}>
                            {amount > balance
                                ? `Exceeds your balance of ${balance} $SKR`
                                : 'Enter a valid positive amount'}
                        </Text>
                    )}

                    <Button
                        variant="primary"
                        block
                        size="lg"
                        loading={withdrawMutation.isPending}
                        onPress={handleWithdraw}
                        disabled={!isValidAmount}
                        className="mt-6"
                    >
                        Withdraw {isValidAmount ? `${parseFloat(amount.toFixed(SKR_DECIMALS))} $SKR` : '$SKR'}
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: { fontSize: 18, fontWeight: '700' },
    headerRight: { width: 40 },

    content: { flex: 1, padding: 24 },

    balanceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
    },
    tokenIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceInfo: { gap: 2 },
    balanceLabel: { fontSize: 12, fontWeight: '500' },
    balanceValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    balanceTicker: { fontSize: 14, fontWeight: '600' },

    label: { fontSize: 14, lineHeight: 20, marginBottom: 24 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
        height: 56,
    },
    input: { flex: 1, fontSize: 20, fontWeight: '700', height: '100%' },
    inputTicker: { fontSize: 14, fontWeight: '600' },

    hint: { fontSize: 12, fontWeight: '500', marginTop: 8 },
});
