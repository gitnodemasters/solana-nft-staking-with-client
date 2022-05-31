import _ from "lodash"
import React, { ReactNode, useContext } from "react"
import { PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"
import * as Models from "../models"

export interface AnchorAccountCacheProviderProps {
  nftStakingProgram: Program
  children: ReactNode
}

type AccountMap<T> = { [key: string]: T }

export interface AnchorAccountCacheProviderState {
  [Models.Pool.AccountType]: AccountMap<Models.Pool.Pool>
  [Models.HToken.AccountType]: AccountMap<Models.HToken.HToken>
  [Models.HMint.AccountType]: AccountMap<Models.HMint.HMint>
  [Models.MetaplexMetadata
    .AccountType]: AccountMap<Models.MetaplexMetadata.MetaplexMetadata>
  [Models.User.AccountType]: AccountMap<Models.User.User>
  [Models.MintStaked.AccountType]: AccountMap<Models.MintStaked.MintStaked>
  [Models.Config.AccountType]: AccountMap<Models.Config.Config>
  [Models.UnstakeProof
    .AccountType]: AccountMap<Models.UnstakeProof.UnstakeProof>
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T

type ManagerFetchReturnType = Awaited<
  ReturnType<
    AnchorAccountCacheProvider["accountManagers"][keyof AnchorAccountCacheProvider["accountManagers"]]["fetch"]
  >
>

type ManagerFetchMultiReturnType = Awaited<
  ReturnType<
    AnchorAccountCacheProvider["accountManagers"][keyof AnchorAccountCacheProvider["accountManagers"]]["fetchMulti"]
  >
>

export type SpecificAccountType<T extends Models.AccountTypes> =
  AnchorAccountCacheProviderState[T][keyof AnchorAccountCacheProviderState[T]]

export type SpecificAccountTypeMap<T extends Models.AccountTypes> = {
  [key: string]: SpecificAccountType<T> | undefined
}

interface AnchorAccountCacheFns {
  fetch<T extends Models.AccountTypes>(
    accountType: T,
    publicKey: PublicKey,
    useCache?: boolean
  ): Promise<SpecificAccountType<T> | undefined>
  fetchMulti<T extends Models.AccountTypes>(
    accountType: T,
    publicKeys: PublicKey[],
    useCache?: boolean
  ): Promise<SpecificAccountTypeMap<T>>
  fetchAndSub<T extends Models.AccountTypes>(
    accountType: T,
    publicKey: PublicKey
  ): Promise<SpecificAccountType<T> | undefined>
  fetchAndSubMulti<T extends Models.AccountTypes>(
    accountType: T,
    publicKeys: PublicKey[]
  ): Promise<SpecificAccountTypeMap<T>>
  fetchTokenAccountsByOwner(
    owner: PublicKey
  ): Promise<Record<string, Models.HToken.HToken>>
  unsubscribe: (accountType: Models.AccountTypes, publicKey: PublicKey) => void
  unsubscribeMulti: (
    accountType: Models.AccountTypes,
    publicKeys: PublicKey[]
  ) => void
}

export type IAnchorAccountCacheContext =
  | ({ isEnabled: true } & AnchorAccountCacheProviderState &
      AnchorAccountCacheFns & { nftStakingProgram: Program })
  | { isEnabled: false }

export const AnchorAccountCacheContext =
  React.createContext<IAnchorAccountCacheContext>({ isEnabled: false })

class AnchorAccountCacheProvider extends React.Component<
  AnchorAccountCacheProviderProps,
  AnchorAccountCacheProviderState
> {
  accountManagers: {
    [Models.Pool.AccountType]: Models.Pool.PoolManager
    [Models.HToken.AccountType]: Models.HToken.HTokenManager
    [Models.HMint.AccountType]: Models.HMint.HMintManager
    [Models.MetaplexMetadata
      .AccountType]: Models.MetaplexMetadata.MetaplexMetadataManager
    [Models.User.AccountType]: Models.User.UserManager
    [Models.MintStaked.AccountType]: Models.MintStaked.MintStakedManager
    [Models.Config.AccountType]: Models.Config.ConfigManager
    [Models.UnstakeProof.AccountType]: Models.UnstakeProof.UnstakeProofManager
  }

  constructor(props: Readonly<AnchorAccountCacheProviderProps>) {
    super(props)

    this.accountManagers = {
      [Models.Pool.AccountType]: new Models.Pool.PoolManager(
        this.props.nftStakingProgram
      ),
      [Models.HToken.AccountType]: new Models.HToken.HTokenManager(
        this.props.nftStakingProgram.provider.connection
      ),
      [Models.HMint.AccountType]: new Models.HMint.HMintManager(
        this.props.nftStakingProgram.provider.connection
      ),
      [Models.MetaplexMetadata.AccountType]:
        new Models.MetaplexMetadata.MetaplexMetadataManager(
          this.props.nftStakingProgram.provider.connection
        ),
      [Models.User.AccountType]: new Models.User.UserManager(
        this.props.nftStakingProgram
      ),
      [Models.MintStaked.AccountType]: new Models.MintStaked.MintStakedManager(
        this.props.nftStakingProgram
      ),
      [Models.Config.AccountType]: new Models.Config.ConfigManager(
        this.props.nftStakingProgram
      ),
      [Models.UnstakeProof.AccountType]:
        new Models.UnstakeProof.UnstakeProofManager(
          this.props.nftStakingProgram
        ),
    }

    this.state = {
      [Models.Pool.AccountType]: {},
      [Models.HToken.AccountType]: {},
      [Models.HMint.AccountType]: {},
      [Models.MetaplexMetadata.AccountType]: {},
      [Models.User.AccountType]: {},
      [Models.MintStaked.AccountType]: {},
      [Models.Config.AccountType]: {},
      [Models.UnstakeProof.AccountType]: {},
    }
  }

  private _setAccounts<T extends Models.AccountTypes>(
    accountType: T,
    newAccountsMap: { [key: string]: ManagerFetchReturnType }
  ) {
    const accountsMap = { ...this.state[accountType] }
    _.forEach(newAccountsMap, (account, publicKeyStr) => {
      if (account) {
        accountsMap[publicKeyStr] = account
      } else {
        delete accountsMap[publicKeyStr]
      }
    })
    this.setState({
      ...this.state,
      [accountType]: accountsMap,
    })
  }

  async fetch<T extends Models.AccountTypes>(
    accountType: T,
    publicKey: PublicKey,
    useCache = false
  ) {
    const cacheAccount = this.state[accountType][publicKey.toString()]
    if (useCache && cacheAccount) {
      return cacheAccount as SpecificAccountType<T> | undefined
    }
    const accountManager = this.accountManagers[accountType]
    const account = await accountManager.fetch(publicKey)
    this._setAccounts(accountType, { [publicKey.toBase58()]: account })
    return account as SpecificAccountType<T> | undefined
  }

  async fetchMulti<T extends Models.AccountTypes>(
    accountType: T,
    publicKeys: PublicKey[],
    useCache = false
  ) {
    const accountManager = this.accountManagers[accountType]
    let accounts: ManagerFetchMultiReturnType = {}
    let fetchPublicKeys: PublicKey[] = publicKeys
    let cachePublicKeys: PublicKey[]
    if (useCache) {
      ;[cachePublicKeys, fetchPublicKeys] = _.partition(
        publicKeys,
        (publicKey) => this.state[accountType][publicKey.toString()]
      )
      accounts = _.reduce(
        cachePublicKeys,
        (accum: ManagerFetchMultiReturnType, publicKey) => {
          accum[publicKey.toString()] =
            this.state[accountType][publicKey.toString()]
          return accum
        },
        {}
      )
    }
    if (!_.isEmpty(fetchPublicKeys)) {
      accounts = _.assign(
        accounts,
        await accountManager.fetchMulti(fetchPublicKeys)
      )
    }
    this._setAccounts(accountType, accounts)
    return accounts as SpecificAccountTypeMap<T>
  }

  async fetchAndSub<T extends Models.AccountTypes>(
    accountType: T,
    publicKey: PublicKey
  ) {
    const accountManager = this.accountManagers[accountType]
    accountManager.subscribe(publicKey, (account) =>
      this._setAccounts(accountType, { [publicKey.toBase58()]: account })
    )
    const retval = await this.fetch(accountType, publicKey)
    return retval as SpecificAccountType<T> | undefined
  }

  async fetchAndSubMulti<T extends Models.AccountTypes>(
    accountType: T,
    publicKeys: PublicKey[]
  ) {
    const accountManager = this.accountManagers[accountType]
    _.forEach(publicKeys, (publicKey) =>
      accountManager.subscribe(publicKey, (account) =>
        this._setAccounts(accountType, { [publicKey.toBase58()]: account })
      )
    )
    const retval = await this.fetchMulti(accountType, publicKeys)
    return retval as SpecificAccountTypeMap<T>
  }

  async fetchTokenAccountsByOwner(owner: PublicKey) {
    const tokenAccountsMap = await this.accountManagers[
      Models.HToken.AccountType
    ].getTokenAccountsByOwner(owner)
    this._setAccounts(Models.HToken.AccountType, tokenAccountsMap)
    return tokenAccountsMap
  }

  unsubscribe = (accountType: Models.AccountTypes, publicKey: PublicKey) => {
    const accountManager = this.accountManagers[accountType]
    accountManager.unsubscribe(publicKey)
  }

  unsubscribeMulti = (
    accountType: Models.AccountTypes,
    publicKeys: PublicKey[]
  ) => {
    _.forEach(publicKeys, this.unsubscribe.bind(this, accountType))
  }

  render() {
    return (
      <AnchorAccountCacheContext.Provider
        value={{
          ...this.state,
          isEnabled: true,
          nftStakingProgram: this.props.nftStakingProgram,
          fetch: this.fetch.bind(this),
          fetchMulti: this.fetchMulti.bind(this),
          fetchAndSub: this.fetchAndSub.bind(this),
          fetchAndSubMulti: this.fetchAndSubMulti.bind(this),
          fetchTokenAccountsByOwner: this.fetchTokenAccountsByOwner.bind(this),
          unsubscribe: this.unsubscribe.bind(this),
          unsubscribeMulti: this.unsubscribeMulti.bind(this),
        }}
      >
        {this.props.children}
      </AnchorAccountCacheContext.Provider>
    )
  }
}

export default AnchorAccountCacheProvider

export const useAnchorAccountCache = () => useContext(AnchorAccountCacheContext)
