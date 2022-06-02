import _ from "lodash"
import { Button, Heading, Image, Text, Flex } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { Center, VStack, HStack, Box } from "@chakra-ui/layout"
import {
  useMonketteAccounts,
  MonketteAccount,
  useNftAccounts,
} from "../hooks/useNftAccounts"
import useWalletPublicKey from "../hooks/useWalletPublicKey"
import StakingModal from "../components/StakingModal"
import { useState, useMemo } from "react"
import useTxCallback from "../hooks/useTxCallback"
import { useCallback } from "react"
import { useAnchorAccountCache } from "../contexts/AnchorAccountsCacheProvider"
import stakeNft from "../solana/scripts/stakeNft"
import unstakeNft from "../solana/scripts/unstakeNft"
import beginUnstakeNft from "../solana/scripts/beginUnstakeNft"
import claimReward from "../solana/scripts/claimReward"
import {
  useUnstakeProofAddresses,
  useUserAccountAddress,
} from "../hooks/useSeedAddress"
import { useAccount, useAccounts } from "../hooks/useAccounts"
import { getClusterConstants } from "../constants"
import UnstakingModal from "../components/UnstakingModal"
import NftCard from "../components/NftCard"
import { UnstakeProof } from "../models/unstakeProof"
import { useTokenRegistry } from "../hooks/useTokenRegistry"
import { fromRawAmount } from "../solana/tokenConversion"

enum PAGE_TABS {
  STAKE,
  UNSTAKE,
  CLAIM,
}

const ManagePoolPage = () => {
  const walletPublicKey = useWalletPublicKey()
  const anchorAccountCache = useAnchorAccountCache()

  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")
  const [pool] = useAccount("pool", ADDRESS_STAKING_POOL)

  const [selectedTab, setSelectedTab] = useState<PAGE_TABS>(PAGE_TABS.STAKE)

  const userAccountAddress = useUserAccountAddress(walletPublicKey)
  const [userAccount] = useAccount("user", userAccountAddress)
  const [mintStakedAccount] = useAccount(
    "mintStaked",
    userAccount?.data.mintStaked
  )

  const tokenRegistry = useTokenRegistry()

  // STAKE
  const nftAccounts = useNftAccounts(walletPublicKey)
  const monketteAccounts = useMonketteAccounts(nftAccounts)

  const [selectedMonkette, setSelectedMonkette] = useState<
    MonketteAccount | undefined
  >()

  const _stakeNftClickHandler = useCallback(async () => {
    if (
      !anchorAccountCache.isEnabled ||
      !walletPublicKey ||
      !selectedMonkette
    ) {
      throw new Error("Invalid data")
    }

    await stakeNft(
      anchorAccountCache,
      walletPublicKey,
      selectedMonkette.tokenAccount.publicKey
    )
    setSelectedMonkette(undefined)
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    selectedMonkette,
  ])

  const stakeNftClickHandler = useTxCallback(_stakeNftClickHandler, {
    info: "Stake NFT...",
    success: "NFT Staked!",
    error: "Transaction failed",
  })

  // UNSTAKE
  const [stakedNftAccounts] = useAccounts(
    "hTokenAccount",
    mintStakedAccount?.data.mintAccounts
  )
  const stakedMonketteAccounts = useMonketteAccounts(stakedNftAccounts)

  const stakedMints = useMemo(() => {
    return _.map(
      stakedMonketteAccounts,
      (monketteAccount) =>
        new PublicKey(monketteAccount.metaplexMetadata.data.mint)
    )
  }, [stakedMonketteAccounts])

  const unstakeProofAddresses = useUnstakeProofAddresses(
    userAccount?.publicKey,
    stakedMints
  )

  const unstakeProffAddressesVal = useMemo(() => {
    return _.values(unstakeProofAddresses)
  }, [unstakeProofAddresses])

  const [unstakeProofs] = useAccounts(
    "unstakeProof",
    unstakeProffAddressesVal,
    { subscribe: true }
  )

  const _unstakeNftClickHandler = useCallback(async () => {
    if (
      !anchorAccountCache.isEnabled ||
      !walletPublicKey ||
      !selectedMonkette
    ) {
      throw new Error("Invalid data")
    }

    await unstakeNft(
      anchorAccountCache,
      walletPublicKey,
      selectedMonkette.tokenAccount.publicKey
    )
    setSelectedMonkette(undefined)
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    selectedMonkette,
  ])

  const unstakeNftClickHandler = useTxCallback(_unstakeNftClickHandler, {
    info: "Unstake NFT...",
    success: "NFT Unstaked!",
    error: "Transaction failed",
  })

  const _beginUnstakeNftClickHandler = useCallback(async () => {
    if (
      !anchorAccountCache.isEnabled ||
      !walletPublicKey ||
      !selectedMonkette
    ) {
      throw new Error("Invalid data")
    }

    await beginUnstakeNft(
      anchorAccountCache,
      walletPublicKey,
      selectedMonkette.tokenAccount.publicKey
    )
    setSelectedMonkette(undefined)
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    selectedMonkette,
  ])

  const beginUnstakeNftClickHandler = useTxCallback(
    _beginUnstakeNftClickHandler,
    {
      info: "Begin Unstaking NFT...",
      success: "Unstake Started!",
      error: "Transaction failed",
    }
  )

  // CLAIM
  const rewardToken = useMemo(() => {
    if (!tokenRegistry || !pool) {
      return
    }
    return tokenRegistry[pool.data.rewardMint.toString()]
  }, [pool, tokenRegistry])

  const _claimRewardClickHandler = useCallback(async () => {
    if (!anchorAccountCache.isEnabled || !walletPublicKey) {
      throw new Error("Invalid data")
    }
    await claimReward(anchorAccountCache, walletPublicKey)
  }, [anchorAccountCache.isEnabled, walletPublicKey?.toString()])

  const claimRewardClickHandler = useTxCallback(_claimRewardClickHandler, {
    info: "Claiming reward...",
    success: "reward claimed!",
    error: "Transaction failed",
  })

  const selectedUnstakeProof = useMemo(() => {
    if (!unstakeProofAddresses || !unstakeProofs || !selectedMonkette) {
      return
    }
    const unstakeProofAddress =
      unstakeProofAddresses[selectedMonkette.metaplexMetadata.data.mint]
    return unstakeProofs[unstakeProofAddress.toString()]
  }, [_.size(unstakeProofAddresses), _.size(unstakeProofs), selectedMonkette])

  return (
    <Box>
      <StakingModal
        isOpen={selectedTab === PAGE_TABS.STAKE && !!selectedMonkette}
        pool={pool}
        selectedMonkette={selectedMonkette}
        onClose={setSelectedMonkette.bind(null, undefined)}
        onSubmit={stakeNftClickHandler}
      />
      <UnstakingModal
        isOpen={selectedTab === PAGE_TABS.UNSTAKE && !!selectedMonkette}
        walletPublicKey={walletPublicKey}
        pool={pool}
        unstakeProof={selectedUnstakeProof}
        selectedMonkette={selectedMonkette}
        onClose={setSelectedMonkette.bind(null, undefined)}
        beginUnstake={beginUnstakeNftClickHandler}
        unstake={unstakeNftClickHandler}
      />
      <VStack w="full" spacing={16} textAlign="center">
        <Heading color="white" fontFamily="T1">
          NFT Staking!
        </Heading>
        <HStack spacing="8">
          <Button
            w="48"
            color="white"
            size={"md"}
            onClick={setSelectedTab.bind(null, PAGE_TABS.STAKE)}
            backgroundColor={
              selectedTab === PAGE_TABS.STAKE
                ? "brandPink.900"
                : "brandPink.200"
            }
          >
            My NFTs
          </Button>
          <Button
            w="48"
            color="white"
            size={"md"}
            onClick={setSelectedTab.bind(null, PAGE_TABS.UNSTAKE)}
            backgroundColor={
              selectedTab === PAGE_TABS.UNSTAKE
                ? "brandPink.900"
                : "brandPink.200"
            }
          >
            Staked NFTs
          </Button>
          <Button
            w="48"
            color="white"
            size={"md"}
            onClick={setSelectedTab.bind(null, PAGE_TABS.CLAIM)}
            backgroundColor={
              selectedTab === PAGE_TABS.CLAIM
                ? "brandPink.900"
                : "brandPink.200"
            }
          >
            Claim reward
          </Button>
        </HStack>

        {selectedTab === PAGE_TABS.STAKE &&
          (walletPublicKey && pool && monketteAccounts ? (
            <VStack>
              <Text color="white">(Click to stake)</Text>
              <Center w="120" flexWrap={"wrap"}>
                {_.map(monketteAccounts, (monketteAccount, key) => {
                  return (
                    <Box key={key} m="4">
                      <NftCard
                        walletPublicKey={walletPublicKey}
                        pool={pool}
                        monketteAccount={monketteAccount}
                        onClick={setSelectedMonkette}
                      />
                    </Box>
                  )
                })}
              </Center>
            </VStack>
          ) : (
            <VStack>
              <Text fontFamily="T1" color="white">No NFTs found</Text>
            </VStack>
          ))}

        {selectedTab === PAGE_TABS.UNSTAKE &&
          (walletPublicKey && pool && userAccount && stakedMonketteAccounts ? (
            <VStack>
              <Text color="white">(Click to unstake)</Text>
              <Center w="120" flexWrap={"wrap"}>
                {_.map(stakedMonketteAccounts, (monketteAccount, key) => {
                  let unstakeProof: UnstakeProof | undefined
                  if (unstakeProofAddresses && unstakeProofs) {
                    const unstakeProofAddress =
                      unstakeProofAddresses[
                        monketteAccount.metaplexMetadata.data.mint
                      ]
                    unstakeProof = unstakeProofs[unstakeProofAddress.toString()]
                  }
                  return (
                    <Box key={key} m="4">
                      <NftCard
                        walletPublicKey={walletPublicKey}
                        pool={pool}
                        unstakeProof={unstakeProof}
                        monketteAccount={monketteAccount}
                        onClick={setSelectedMonkette}
                      />
                    </Box>
                  )
                })}
              </Center>
            </VStack>
          ) : (
            <VStack>
              <Text fontFamily="T1" color="white">No staked NFTs found</Text>
            </VStack>
          ))}

        {selectedTab === PAGE_TABS.CLAIM && userAccount && pool && rewardToken && (
          <VStack w="96" spacing={8}>
            <Flex
              w="full"
              justifyContent="space-between"
              borderBottom={"2px solid grey"}
            >
              <Text color="white" textAlign={"left"} fontSize="18" fontWeight={600}>
                NFTs Staked
              </Text>
              <Text color="white" textAlign={"right"} fontSize="18" fontWeight={600}>
                {`${userAccount?.data.mintStakedCount.toString()}`}
              </Text>
            </Flex>
            <Flex
              w="full"
              justifyContent="space-between"
              borderBottom={"2px solid grey"}
            >
              <HStack>
                <Image
                  alt="token image"
                  w="8"
                  h="8"
                  borderRadius="20"
                  src={rewardToken.logoURI}
                />
                <Text color="white" textAlign={"left"} fontSize="18" fontWeight={600}>
                  {`${rewardToken.name} claimed`}
                </Text>
              </HStack>
              <Text color="white" textAlign={"right"} fontSize="18" fontWeight={600}>
                {`${fromRawAmount(
                  rewardToken.decimals,
                  userAccount.data.rewardEarnedClaimed.toNumber()
                )}`}
              </Text>
            </Flex>
            <Flex
              w="full"
              justifyContent="space-between"
              borderBottom={"2px solid grey"}
            >
              <HStack>
                <Image
                  alt="token image"
                  w="8"
                  h="8"
                  borderRadius="20"
                  src={rewardToken.logoURI}
                />
                <Text color="white" textAlign={"left"} fontSize="18" fontWeight={600}>
                  {`${rewardToken.name} available`}
                </Text>
              </HStack>
              <Text color="white" textAlign={"right"} fontSize="18" fontWeight={600}>
                {`${userAccount.getRewardsToClaim(
                  pool.data.rewardRatePerToken,
                  rewardToken.decimals
                )}`}
              </Text>
            </Flex>
            <Button
              size={"md"}
              border="1px solid grey"
              onClick={claimRewardClickHandler}
            >
              Claim
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default ManagePoolPage
