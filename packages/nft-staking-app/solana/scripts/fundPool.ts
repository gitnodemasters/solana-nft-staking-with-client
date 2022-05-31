import { PublicKey } from "@solana/web3.js"
import { BN } from "@project-serum/anchor"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { IAnchorAccountCacheContext } from "../../contexts/AnchorAccountsCacheProvider"

const fundPool = async (
  anchorAccountCache: IAnchorAccountCacheContext,
  walletPublicKey: PublicKey,
  poolAccount: PublicKey,
  configAccount: PublicKey,
  rewardVault: PublicKey,
  funderVault: PublicKey,
  amountPerWeek: number
) => {
  if (!anchorAccountCache.isEnabled) {
    throw new Error("App not connected")
  }

  const poolAccountInfo = await anchorAccountCache.fetch("pool", poolAccount)
  if (!poolAccountInfo) {
    throw new Error(`poolAccount not found: ${poolAccount.toString()}`)
  }

  const mint = await anchorAccountCache.fetch(
    "hMint",
    poolAccountInfo.data.rewardMint,
    true
  )
  if (!mint) {
    throw new Error(
      `mint not found: ${poolAccountInfo.data.rewardMint.toString()}`
    )
  }

  const config =
    await anchorAccountCache.nftStakingProgram.account.config.fetch(
      poolAccountInfo.data.config
    )

  const rawAmount = poolAccountInfo.getFundAmount(
    amountPerWeek,
    mint.data.decimals,
    config.numMint
  )

  return await anchorAccountCache.nftStakingProgram.rpc.fund(rawAmount, {
    accounts: {
      funder: walletPublicKey,
      poolAccount: poolAccount,
      rewardVault: rewardVault,
      funderVault: funderVault,
      authority: poolAccountInfo.data.authority,
      tokenProgram: TOKEN_PROGRAM_ID,
      config: configAccount,
    },
  })
}

export default fundPool
