import { Provider, Program, Idl } from "@project-serum/anchor"
import NftStakingIdl from "./../scripts/nft_staking.json"
import { getClusterConstants } from "../constants"

export const getNftStakingProgram = (provider: Provider) => {
  const { PROGRAM_NFT_STAKING } = getClusterConstants("PROGRAM_NFT_STAKING")
  return new Program(NftStakingIdl as Idl, PROGRAM_NFT_STAKING, provider)
}
