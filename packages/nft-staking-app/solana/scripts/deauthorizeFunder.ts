import { PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"

const deauthorizeFunder = async (
  nftStakingProgram: Program,
  authority: PublicKey,
  poolAccount: PublicKey,
  oldFunder: PublicKey
) => {
  return await nftStakingProgram.rpc.deauthorizeFunder(oldFunder, {
    accounts: {
      authority: authority,
      poolAccount: poolAccount,
    },
  })
}

export default deauthorizeFunder
