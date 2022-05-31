import { PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"

const authorizeFunder = async (
  nftStakingProgram: Program,
  authority: PublicKey,
  poolAccount: PublicKey,
  newFunder: PublicKey
) => {
  return await nftStakingProgram.rpc.authorizeFunder(newFunder, {
    accounts: {
      authority: authority,
      poolAccount: poolAccount,
    },
  })
}

export default authorizeFunder
