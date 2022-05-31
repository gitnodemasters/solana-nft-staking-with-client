import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import useWalletPublicKey from "../hooks/useWalletPublicKey"
import { useAccount } from "./useAccounts"
import { useEffect, useMemo } from "react"
import { useAnchorAccountCache } from "../contexts/AnchorAccountsCacheProvider"

export function useIsAdmin(poolAddress: PublicKey) {
  const walletPublicKey = useWalletPublicKey()
  const [pool] = useAccount("pool", poolAddress, { subscribe: true })

  const isAdmin = useMemo(() => {
    if (!walletPublicKey || !pool) {
      return false
    }
    if (pool.data.authority.equals(walletPublicKey)) {
      return true
    }
    const funders = _.map(pool.data.funders, (funder) => funder.toString())
    return _.includes(funders, walletPublicKey.toString())
  }, [walletPublicKey, pool])

  return isAdmin
}
