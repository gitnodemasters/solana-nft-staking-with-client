import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import { Program, BN } from "@project-serum/anchor"
import { BaseAnchorAccount, BaseAnchorAccountManager } from "./baseAnchor"

export const AccountType = "config"

export interface ConfigAccount {
  authority: PublicKey
  uuid: string
  numMint: number
  mints: PublicKey[]
}

export class Config extends BaseAnchorAccount<ConfigAccount> {}

export class ConfigManager extends BaseAnchorAccountManager<
  ConfigAccount,
  Config
> {
  constructor(program: Program) {
    super(program, AccountType)
  }

  isValid = (entity: any): entity is Config => {
    return (
      entity instanceof Config &&
      typeof entity.data.uuid === "string" &&
      typeof entity.data.numMint === "number" &&
      _.isArray(entity.data.mints)
    )
  }

  toDomain = async (account: any, publicKey: PublicKey) => {
    const accountData = { ...account }
    return new Config(publicKey, accountData)
  }
}
