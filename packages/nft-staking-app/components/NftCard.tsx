import { Center, Image, Text, VStack } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { MonketteAccount, MonketteStakeStatus } from "../hooks/useNftAccounts"
import { Pool } from "../models/pool"
import { UnstakeProof } from "../models/unstakeProof"

const StakeStatusText = ({
  stakeStatus,
}: {
  stakeStatus: MonketteStakeStatus
}) => {
  let text: string
  let color: string
  switch (stakeStatus) {
    case MonketteStakeStatus.UNSTAKED:
      color = "brandPink.900"
      text = "Unstaked"
      break
    case MonketteStakeStatus.STAKED:
      color = "green.500"
      text = "Staked"
      break
    case MonketteStakeStatus.PENDING:
      color = "yellow.500"
      text = "Unstaking..."
      break
    case MonketteStakeStatus.WITHDRAW:
      color = "red.500"
      text = "Withdrawable"
      break
    default:
      color = "gray.500"
      text = "..."
      break
  }

  return (
    <Text color={color} fontWeight={"bold"}>
      {text}
    </Text>
  )
}

const NftCard = ({
  walletPublicKey,
  pool,
  monketteAccount,
  onClick,
  unstakeProof,
}: {
  walletPublicKey: PublicKey
  pool: Pool
  monketteAccount: MonketteAccount
  onClick: (monketteAccount: MonketteAccount) => void
  unstakeProof?: UnstakeProof
}) => {
  return (
    <VStack
      onClick={onClick.bind(null, monketteAccount)}
      p="4"
      cursor="pointer"
      backgroundColor="gray.100"
      // opacity="0.5"
      borderRadius="lg"
      boxShadow="md"
      _hover={{
        opacity: "0.5",
      }}
    >
      <Image
        alt="selected nft"
        w="36"
        objectFit="cover"
        boxShadow="md"
        borderRadius="lg"
        src={monketteAccount.staticData.image}
      />
      <Text fontWeight={"bold"}>{monketteAccount.staticData.name}</Text>
      <StakeStatusText
        stakeStatus={monketteAccount.getStakeStatus(
          walletPublicKey,
          pool.data.unstakeDuration,
          unstakeProof?.data.unstakeTimestamp
        )}
      />
    </VStack>
  )
}

export default NftCard
