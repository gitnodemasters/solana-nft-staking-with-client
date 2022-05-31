import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import { Program, BN } from "@project-serum/anchor"
import { BaseAnchorAccount, BaseAnchorAccountManager } from "./baseAnchor"
import { U64_MAX, getNowBn } from "../utils/bn"

export const AccountType = "user"

export interface UserAccount {
  uuid: string
  mintStakedCount: number
  lastUpdateTime: BN
  rewardEarnedClaimed: BN
  rewardEarnedPending: BN
  pool: PublicKey
  user: PublicKey
  mintStaked: PublicKey
}

export class User extends BaseAnchorAccount<UserAccount> {
  getRewardsToClaim = (rewardRatePerToken: BN, decimals: number) => {
    const elapsedTime = getNowBn().sub(this.data.lastUpdateTime)
    const rewardRaw = rewardRatePerToken
      .clone()
      .mul(new BN(this.data.mintStakedCount))
      .mul(elapsedTime)
      .div(U64_MAX)
      .add(this.data.rewardEarnedPending)
    return rewardRaw.toNumber() / 10 ** decimals
  }
}

export class UserManager extends BaseAnchorAccountManager<UserAccount, User> {
  constructor(program: Program) {
    super(program, AccountType)
  }

  isValid = (entity: any): entity is User => {
    return (
      entity instanceof User &&
      typeof entity.data.uuid === "string" &&
      typeof entity.data.mintStakedCount === "number" &&
      BN.isBN(entity.data.lastUpdateTime) &&
      BN.isBN(entity.data.rewardEarnedClaimed) &&
      BN.isBN(entity.data.rewardEarnedPending)
    )
  }

  toDomain = async (account: any, publicKey: PublicKey) => {
    const accountData = { ...account }
    return new User(publicKey, accountData)
  }
}
