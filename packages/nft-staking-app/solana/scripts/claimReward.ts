import _ from "lodash"
import { PublicKey, Transaction } from "@solana/web3.js"
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { IAnchorAccountCacheContext } from "../../contexts/AnchorAccountsCacheProvider"
import { getClusterConstants } from "../../constants"
import { getUserAddress } from "../seedAddresses"

const claimReward = async (
  anchorAccountsCache: IAnchorAccountCacheContext,
  walletPublicKey: PublicKey
) => {
  if (!anchorAccountsCache.isEnabled) {
    throw new Error("App is not connected")
  }
  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")
  const poolAccount = await anchorAccountsCache.fetch(
    "pool",
    ADDRESS_STAKING_POOL
  )
  if (!poolAccount) {
    throw new Error("poolAccount not found")
  }
  const [userAddress] = await getUserAddress(
    ADDRESS_STAKING_POOL,
    walletPublicKey,
    anchorAccountsCache.nftStakingProgram.programId
  )

  const tokenAccounts = await anchorAccountsCache.fetchTokenAccountsByOwner(
    walletPublicKey
  )
  const tokenAccount = _.find(
    tokenAccounts,
    (tokenAccount) =>
      tokenAccount.data.mint === poolAccount.data.rewardMint.toString()
  )

  let rewardAccount: PublicKey
  let tx = new Transaction()
  if (tokenAccount) {
    rewardAccount = tokenAccount.publicKey
  } else {
    rewardAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      poolAccount.data.rewardMint,
      walletPublicKey
    )
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        poolAccount.data.rewardMint,
        rewardAccount,
        walletPublicKey,
        walletPublicKey
      )
    )
  }

  tx.add(
    anchorAccountsCache.nftStakingProgram.instruction.claim({
      accounts: {
        user: walletPublicKey,
        poolAccount: ADDRESS_STAKING_POOL,
        authority: poolAccount.data.authority,
        rewardVault: poolAccount.data.rewardVault,
        userAccount: userAddress,
        rewardToAccount: rewardAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  )

  return await anchorAccountsCache.nftStakingProgram.provider.send(tx)
}

export default claimReward
