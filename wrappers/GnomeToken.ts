import { 
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode 
} from '@ton/core';

export class GnomeToken implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createDataCell(
        owner: Address,
        totalSupply: bigint,
        decimals: bigint,
        name: string,
        symbol: string
    ): Cell {
        return beginCell()
            .storeCoins(totalSupply)
            .storeRef(
                beginCell()
                    .storeAddress(owner)
                    .storeUint(decimals, 8)
                    .storeStringTail(name)
                    .storeStringTail(symbol)
                    .endCell()
            )
            .endCell();
    }

    static create(params: {
        owner: Address;
        totalSupply: bigint;
        decimals: bigint;
        name: string;
        symbol: string;
    }) {
        const data = GnomeToken.createDataCell(
            params.owner,
            params.totalSupply,
            params.decimals,
            params.name,
            params.symbol
        );
        return new GnomeToken(contractAddress(0, { code: Cell.EMPTY, data }), {
            code: Cell.EMPTY,
            data,
        });
    }

    async sendDeploy(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: '0.01',
            bounce: false,
        });
    }

    async sendMint(
        provider: ContractProvider,
        via: Sender,
        params: {
            to: Address;
            amount: bigint;
        }
    ) {
        await provider.internal(via, {
            value: '0.05',
            bounce: true,
            body: beginCell()
                .storeUint(0x1674b0a0, 32) // op::mint_tokens()
                .storeAddress(params.to)
                .storeCoins(params.amount)
                .endCell(),
        });
    }

    async sendTransfer(
        provider: ContractProvider,
        via: Sender,
        params: {
            to: Address;
            amount: bigint;
        }
    ) {
        await provider.internal(via, {
            value: '0.05',
            bounce: true,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32) // op::transfer()
                .storeAddress(params.to)
                .storeCoins(params.amount)
                .endCell(),
        });
    }

    async getBalance(provider: ContractProvider, address: Address) {
        const result = await provider.get('get_wallet_balance', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
        ]);
        return result.stack.readBigNumber();
    }

    async getTotalSupply(provider: ContractProvider) {
        const result = await provider.get('get_total_supply', []);
        return result.stack.readBigNumber();
    }
}
