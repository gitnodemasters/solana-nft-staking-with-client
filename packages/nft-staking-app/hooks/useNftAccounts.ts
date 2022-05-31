import _ from "lodash"
import axios from "axios"
import { useContext, useEffect, useMemo, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { HToken } from "../models/tokenAccount"
import { MetaplexMetadata } from "../models/metadata"
import scriptConfig from "../scripts/scriptConfig.json"
import {
  AnchorAccountCacheContext,
  useAnchorAccountCache,
} from "../contexts/AnchorAccountsCacheProvider"
import { useAccounts } from "./useAccounts"
import { useMetaplexMetadataAddresses } from "./useSeedAddress"
import { useTokenAccounts } from "./useTokenAccounts"
import { BN } from "@project-serum/anchor"
import { getNowBn } from "../utils/bn"

export const useNftAccounts = (ownerPublicKey: PublicKey | undefined) => {
  const anchorAccountCache = useContext(AnchorAccountCacheContext)
  const [tokenAccounts, setTokenAccounts] = useState<
    Record<string, HToken> | undefined
  >()

  useEffect(() => {
    if (!anchorAccountCache.isEnabled || !ownerPublicKey) {
      return
    }
    ;(async function () {
      const tokenAccounts = await anchorAccountCache.fetchTokenAccountsByOwner(
        ownerPublicKey
      )
      setTokenAccounts(tokenAccounts)
    })()
  }, [anchorAccountCache.isEnabled, ownerPublicKey?.toString()])

  return useMemo(() => {
    if (!tokenAccounts || _.isEmpty(tokenAccounts)) {
      return undefined
    }
    return _.reduce(
      tokenAccounts,
      (accum: Record<string, HToken>, tokenAccount) => {
        if (tokenAccount.data.amount === 1) {
          accum[tokenAccount.publicKey.toString()] = tokenAccount
        }
        return accum
      },
      {}
    )
  }, [tokenAccounts])
}

export enum MonketteStakeStatus {
  UNSTAKED,
  STAKED,
  PENDING,
  WITHDRAW,
}

export class MonketteAccount {
  constructor(
    public readonly metaplexMetadata: MetaplexMetadata,
    public readonly staticData: any,
    public readonly tokenAccount: HToken
  ) {}

  getStakeStatus(
    walletPublicKey: PublicKey,
    unstakeDuration: BN,
    unstakeTimestamp?: BN
  ) {
    if (this.tokenAccount.data.owner === walletPublicKey.toString()) {
      return MonketteStakeStatus.UNSTAKED
    } else if (!unstakeTimestamp) {
      return MonketteStakeStatus.STAKED
    }
    const now = getNowBn()
    return unstakeTimestamp.add(unstakeDuration).gt(now)
      ? MonketteStakeStatus.PENDING
      : MonketteStakeStatus.WITHDRAW
  }
}

export const useMonketteAccounts = (
  nftAccounts: Record<string, HToken> | undefined
) => {
  const { validNftMints } = scriptConfig

  const monketteAccounts = useMemo(() => {
    if (!nftAccounts || _.isEmpty(validNftMints)) {
      return undefined
    }

    const validMintSet = new Set(validNftMints)
    return _.pickBy(nftAccounts, (nftAccount) =>
      validMintSet.has(nftAccount.data.mint)
    )
  }, [nftAccounts, validNftMints])

  const metadataAddresses = useMetaplexMetadataAddresses(monketteAccounts)
  const [metaplexMetadatas] = useAccounts(
    "metaplexMetadata",
    _.values(metadataAddresses),
    {
      useCache: true,
    }
  )

  const [monketteData, setMonketteData] = useState<
    { [key: string]: MonketteAccount } | undefined
  >()

  useEffect(() => {
    if (
      !metadataAddresses ||
      !metaplexMetadatas ||
      _.isEmpty(metaplexMetadatas) ||
      !nftAccounts ||
      _.isEmpty(nftAccounts)
    ) {
      return
    }
    ;(async function () {
      const fetchResults = await Promise.all(
        _.map(
          metadataAddresses,
          async function (
            metadataAddress: PublicKey,
            tokenAccountAddress: string
          ): Promise<[string, any, HToken]> {
            const metadata = metaplexMetadatas[metadataAddress.toString()]
            const { data } = await axios.get(metadata.data.data.uri)
            return [
              metadata.publicKey.toString(),
              data,
              nftAccounts[tokenAccountAddress],
            ]
          }
        )
      )
      const fetchedMonketteData = _.reduce(
        fetchResults,
        (
          accum: { [key: string]: MonketteAccount },
          [key, data, tokenAccount]
        ) => {
          accum[key] = new MonketteAccount(
            metaplexMetadatas[key],
            data,
            tokenAccount
          )
          return accum
        },
        {}
      )
      setMonketteData(fetchedMonketteData)
    })()
  }, [
    _.size(metadataAddresses),
    _.size(metaplexMetadatas),
    _.size(nftAccounts),
  ])

  return monketteData
}

export const useNftMintAccounts = (
  ownerPublicKey?: PublicKey,
  mintAddresses?: PublicKey[]
) => {
  const tokenAccounts = useTokenAccounts(ownerPublicKey)

  return useMemo(() => {
    if (_.isEmpty(tokenAccounts)) {
      return
    }
    const mintAddressSet = new Set(
      _.map(mintAddresses, (mintAddress) => mintAddress.toString())
    )
    return _.reduce(
      tokenAccounts,
      (accum: Record<string, HToken>, tokenAccount) => {
        if (mintAddressSet.has(tokenAccount.data.mint)) {
          accum[tokenAccount.publicKey.toString()] = tokenAccount
        }
        return accum
      },
      {}
    )
  }, [tokenAccounts])
}
