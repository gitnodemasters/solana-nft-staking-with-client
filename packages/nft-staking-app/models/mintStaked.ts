import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import { Program, BN } from "@project-serum/anchor"
import { BaseAnchorAccount, BaseAnchorAccountManager } from "./baseAnchor"

export const AccountType = "mintStaked"

export interface MintStakedAccount {
  pool: PublicKey
  userAccount: PublicKey
  mintAccounts: PublicKey[]
}

export class MintStaked extends BaseAnchorAccount<MintStakedAccount> {}

export class MintStakedManager extends BaseAnchorAccountManager<
  MintStakedAccount,
  MintStaked
> {
  constructor(program: Program) {
    super(program, AccountType)
  }

  isValid = (entity: any): entity is MintStaked => {
    return entity instanceof MintStaked && _.isArray(entity.data.mintAccounts)
  }

  toDomain = async (account: any, publicKey: PublicKey) => {
    const accountData = { ...account }
    return new MintStaked(publicKey, accountData)
  }
}
