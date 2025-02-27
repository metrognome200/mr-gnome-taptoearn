import { 
    TonClient, 
    WalletContractV4, 
    internal,
    fromNano,
    toNano,
    Address
} from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { GnomeToken } from '../wrappers/GnomeToken';
import { GnomeGame } from '../wrappers/GnomeGame';
import * as dotenv from 'dotenv';

dotenv.config();

async function deploy() {
    // Initialize TON client
    const client = new TonClient({
        endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TON_API_KEY
    });

    // Load deployer wallet
    const mnemonic = process.env.DEPLOYER_MNEMONIC!;
    const key = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const contract = client.open(wallet);

    // Check wallet balance
    const balance = await contract.getBalance();
    console.log(`Deployer wallet balance: ${fromNano(balance)} TON`);

    if (balance === 0n) {
        throw new Error('Deployer wallet has zero balance');
    }

    // Deploy GnomeToken contract
    console.log('Deploying GnomeToken contract...');
    const tokenContract = GnomeToken.create({
        owner: contract.address,
        totalSupply: 1000000000n, // 1 billion tokens
        decimals: 9n,
        name: 'GNOME',
        symbol: 'GNOME'
    });

    await tokenContract.sendDeploy(contract.sender, contract.sender, toNano('0.1'));
    const tokenAddress = tokenContract.address;
    console.log(`GnomeToken deployed at: ${tokenAddress.toString()}`);

    // Deploy GnomeGame contract
    console.log('Deploying GnomeGame contract...');
    const gameContract = GnomeGame.create({
        owner: contract.address,
        tokenAddress: tokenAddress,
        tapCooldown: 5n,
        baseTapReward: 1000000n // 0.001 GNOME
    });

    await gameContract.sendDeploy(contract.sender, contract.sender, toNano('0.1'));
    const gameAddress = gameContract.address;
    console.log(`GnomeGame deployed at: ${gameAddress.toString()}`);

    // Save contract addresses
    console.log('\nContract Addresses:');
    console.log('Token:', tokenAddress.toString());
    console.log('Game:', gameAddress.toString());
}

deploy().catch(console.error);
