import { TonClient, WalletContractV4, internal } from '@ton/ton';
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
    console.log(`Deployer wallet balance: ${balance.toString()}`);

    if (balance.isZero()) {
        throw new Error('Deployer wallet has zero balance');
    }

    // Deploy GnomeToken contract
    console.log('Deploying GnomeToken contract...');
    const tokenContract = GnomeToken.create({
        owner: await contract.address(),
        totalSupply: 1000000000n, // 1 billion tokens
        decimals: 9n,
        name: 'GNOME',
        symbol: 'GNOME'
    });

    const tokenDeployResult = await contract.deploy({
        value: internal.toNano('0.1'),
        body: tokenContract.createDeployMessage(),
    });

    console.log(`GnomeToken deployed at: ${tokenDeployResult.address}`);

    // Deploy GnomeGame contract
    console.log('Deploying GnomeGame contract...');
    const gameContract = GnomeGame.create({
        owner: await contract.address(),
        tokenAddress: tokenDeployResult.address,
        tapCooldown: 5n,
        baseTapReward: 1000000n // 0.001 GNOME
    });

    const gameDeployResult = await contract.deploy({
        value: internal.toNano('0.1'),
        body: gameContract.createDeployMessage(),
    });

    console.log(`GnomeGame deployed at: ${gameDeployResult.address}`);

    // Save contract addresses
    console.log('\nContract Addresses:');
    console.log('Token:', tokenDeployResult.address.toString());
    console.log('Game:', gameDeployResult.address.toString());
}

deploy().catch(console.error);
