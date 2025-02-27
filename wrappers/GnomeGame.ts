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

export class GnomeGame implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createDataCell(
        owner: Address,
        tokenAddress: Address,
        tapCooldown: bigint,
        baseTapReward: bigint
    ): Cell {
        return beginCell()
            .storeRef(
                beginCell()
                    .storeAddress(owner)
                    .storeAddress(tokenAddress)
                    .endCell()
            )
            .storeDict() // Empty players dictionary
            .storeUint(tapCooldown, 32)
            .storeCoins(baseTapReward)
            .endCell();
    }

    static create(params: {
        owner: Address;
        tokenAddress: Address;
        tapCooldown: bigint;
        baseTapReward: bigint;
    }) {
        const data = GnomeGame.createDataCell(
            params.owner,
            params.tokenAddress,
            params.tapCooldown,
            params.baseTapReward
        );
        return new GnomeGame(contractAddress(0, { code: Cell.EMPTY, data }), {
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

    async sendTap(
        provider: ContractProvider,
        via: Sender,
        params: {
            player: Address;
        }
    ) {
        await provider.internal(via, {
            value: '0.05',
            bounce: true,
            body: beginCell()
                .storeUint(0x7e8764ef, 32) // op::tap()
                .storeAddress(params.player)
                .endCell(),
        });
    }

    async sendAddBooster(
        provider: ContractProvider,
        via: Sender,
        params: {
            player: Address;
            boosterId: number;
            multiplier: number;
            duration: number;
        }
    ) {
        await provider.internal(via, {
            value: '0.05',
            bounce: true,
            body: beginCell()
                .storeUint(0x2b86c972, 32) // op::add_booster()
                .storeAddress(params.player)
                .storeUint(params.boosterId, 32)
                .storeUint(params.multiplier, 32)
                .storeUint(params.duration, 32)
                .endCell(),
        });
    }

    async getPlayerBalance(provider: ContractProvider, address: Address) {
        const result = await provider.get('get_player_balance', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
        ]);
        return result.stack.readBigNumber();
    }

    async getPlayerBoosters(provider: ContractProvider, address: Address) {
        const result = await provider.get('get_player_boosters', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
        ]);
        return result.stack.readCell();
    }
}
