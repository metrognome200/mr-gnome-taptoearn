import { 
    TonConnect,
    useTonConnect,
    useTonConnectUI 
} from '@ton-connect/ui-react';

const CHAIN = process.env.TON_NETWORK === 'testnet' ? 'testnet' : 'mainnet';

export const tonConnectUI = new TonConnect({
    manifestUrl: 'https://your-app.com/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-button',
});

export const useTonWallet = () => {
    const { connected, wallet } = useTonConnect();
    const { open } = useTonConnectUI();

    const sendTransaction = async (to, amount, payload) => {
        if (!connected || !wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const transaction = {
                validUntil: Date.now() + 1000 * 60 * 5, // 5 minutes
                messages: [
                    {
                        address: to,
                        amount: amount.toString(),
                        payload: payload,
                    },
                ],
            };

            return await wallet.sendTransaction(transaction);
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    };

    return {
        connected,
        wallet,
        openConnectModal: open,
        sendTransaction,
    };
};