import _ from "lodash"
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js"
import { getUserAddress, getUnstakeProofAddress } from "../seedAddresses"
import { IAnchorAccountCacheContext } from "../../contexts/AnchorAccountsCacheProvider"
import { getClusterConstants } from "../../constants"

const beginUnstakeNft = async (
  anchorAccountsCache: IAnchorAccountCacheContext,
  walletPublicKey: PublicKey,
  poolNftAccount: PublicKey
) => {
  if (!anchorAccountsCache.isEnabled) {
    throw new Error("Accounts cache not initialized")
  }
  const { nftStakingProgram } = anchorAccountsCache
  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")

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

  const [unstakeProofAddress, unstakeProofAddressBump] =
    await getUnstakeProofAddress(
      userAccount.publicKey,
      new PublicKey(tokenAccount.data.mint),
      nftStakingProgram.programId
    )

  return nftStakingProgram.rpc.beginUnstake(unstakeProofAddressBump, {
    accounts: {
      staker: walletPublicKey,
      poolAccount: ADDRESS_STAKING_POOL,
      userAccount: userAddress,
      mintStaked: userAccount.data.mintStaked,
      unstakeFromAccount: poolNftAccount,
      unstakeProof: unstakeProofAddress,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    },
  })
}

export default beginUnstakeNft
