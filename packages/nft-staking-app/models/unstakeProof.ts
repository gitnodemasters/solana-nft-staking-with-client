import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import { Program, BN } from "@project-serum/anchor"
import { BaseAnchorAccount, BaseAnchorAccountManager } from "./baseAnchor"

export const AccountType = "unstakeProof"

export interface UnstakeProofAccount {
  userAccount: PublicKey
  tokenAccount: PublicKey
  unstakeTimestamp: BN
}

export class UnstakeProof extends BaseAnchorAccount<UnstakeProofAccount> {}

export class UnstakeProofManager extends BaseAnchorAccountManager<
  UnstakeProofAccount,
  UnstakeProof
> {
  constructor(program: Program) {
    super(program, AccountType)
  }

  isValid = (entity: any): entity is UnstakeProof => {
    return (
      entity instanceof UnstakeProof && BN.isBN(entity.data.unstakeTimestamp)
    )
  }

  toDomain = async (account: any, publicKey: PublicKey) => {
    const accountData = { ...account }
    return new UnstakeProof(publicKey, accountData)
  }
}
