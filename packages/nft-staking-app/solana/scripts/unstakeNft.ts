import _ from "lodash"
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js"
import { getUserAddress, getUnstakeProofAddress } from "../seedAddresses"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { IAnchorAccountCacheContext } from "../../contexts/AnchorAccountsCacheProvider"
import { getClusterConstants } from "../../constants"

const unstakeNft = async (
  anchorAccountsCache: IAnchorAccountCacheContext,
  walletPublicKey: PublicKey,
  poolNftAccount: PublicKey
) => {
  if (!anchorAccountsCache.isEnabled) {
    throw new Error("Accounts cache not initialized")
  }

  const { nftStakingProgram } = anchorAccountsCache
  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")

  const pool = await anchorAccountsCache.fetch("pool", ADDRESS_STAKING_POOL)
  if (!pool) {
    throw new Error("pool not found")
  }

  const [userAddress] = await getUserAddress(
    ADDRESS_STAKING_POOL,
    walletPublicKey,
    nftStakingProgram.programId
  )
  const userAccount = await anchorAccountsCache.fetch("user", userAddress)
  if (!userAccount) {
    throw new Error("user not found")
  }

  const tokenAccount = await anchorAccountsCache.fetch(
    "hTokenAccount",
    poolNftAccount
  )
  if (!tokenAccount) {
    throw new Error("poolNftAccount not found")
  }

  const [unstakeProofAddress] = await getUnstakeProofAddress(
    userAccount.publicKey,
    new PublicKey(tokenAccount.data.mint),
    nftStakingProgram.programId
  )

  const unstakeProof = await anchorAccountsCache.fetch(
    "unstakeProof",
    unstakeProofAddress
  )
  if (!unstakeProof) {
    throw new Error("unstakeProof not found")
  }

  return nftStakingProgram.rpc.unstake({
    accounts: {
      staker: walletPublicKey,
      poolAccount: ADDRESS_STAKING_POOL,
      config: pool.data.config,
      userAccount: userAddress,
      mintStaked: userAccount.data.mintStaked,
      unstakeProof: unstakeProofAddress,
      unstakeFromAccount: poolNftAccount,
      rent: SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
  })
}

export default unstakeNft
