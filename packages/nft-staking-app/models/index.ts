import * as Pool from "./pool"
import * as HToken from "./tokenAccount"
import * as HMint from "./mint"
import * as MetaplexMetadata from "./metadata"
import * as User from "./user"
import * as MintStaked from "./mintStaked"
import * as Config from "./config"
import * as UnstakeProof from "./unstakeProof"

export const AccountMap = {
  [Pool.AccountType]: Pool,
  [HToken.AccountType]: HToken,
  [HMint.AccountType]: HMint,
  [MetaplexMetadata.AccountType]: MetaplexMetadata,
  [User.AccountType]: User,
  [MintStaked.AccountType]: MintStaked,
  [Config.AccountType]: Config,
  [UnstakeProof.AccountType]: UnstakeProof,
}

export type TAccountMap = {
  [Pool.AccountType]: Pool.Pool
  [HToken.AccountType]: HToken.HToken
  [HMint.AccountType]: HMint.HMint
  [MetaplexMetadata.AccountType]: MetaplexMetadata.MetaplexMetadata
  [User.AccountType]: User.User
  [MintStaked.AccountType]: MintStaked.MintStaked
  [Config.AccountType]: Config.Config
  [UnstakeProof.AccountType]: UnstakeProof.UnstakeProof
}

export type AccountTypes = keyof typeof AccountMap

export type SpecificAccountType<T extends AccountTypes> = TAccountMap[T]

export type SpecificAccountTypeMap<T extends AccountTypes> = {
  [key: string]: SpecificAccountType<T> | undefined
}

export type FilteredSpecificAccountTypeMap<T extends AccountTypes> = {
  [key: string]: SpecificAccountType<T>
}

export {
  Pool,
  HToken,
  HMint,
  MetaplexMetadata,
  User,
  MintStaked,
  Config,
  UnstakeProof,
}
