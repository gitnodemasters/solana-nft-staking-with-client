import {
  Image,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Center,
  VStack,
} from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { useCallback } from "react"
import { MonketteAccount, MonketteStakeStatus } from "../hooks/useNftAccounts"
import { Pool } from "../models/pool"
import { UnstakeProof } from "../models/unstakeProof"

const UnstakingModal = ({
  isOpen,
  walletPublicKey,
  pool,
  unstakeProof,
  selectedMonkette,
  onClose,
  beginUnstake,
  unstake,
}: {
  isOpen: boolean
  walletPublicKey?: PublicKey
  pool?: Pool
  unstakeProof?: UnstakeProof
  selectedMonkette?: MonketteAccount
  onClose: () => void
  beginUnstake: () => void
  unstake: () => void
}) => {
  const onSubmit = useCallback(() => {
    if (!walletPublicKey || !pool || !beginUnstake || !unstake) {
      return
    }
    const stakeStatus = selectedMonkette?.getStakeStatus(
      walletPublicKey,
      pool.data.unstakeDuration,
      unstakeProof?.data.unstakeTimestamp
    )
    if (stakeStatus === MonketteStakeStatus.STAKED) {
      return beginUnstake()
    } else {
      return unstake()
    }
  }, [walletPublicKey, pool, unstakeProof, beginUnstake, unstake])

  return (
    <Modal isOpen={isOpen} size="sm" onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor={"gray.100"}>
        <ModalHeader>
          <Center>Unstake NFT</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedMonkette && (
            <VStack m="4">
              <Image
                alt="selected nft"
                w="48"
                objectFit="cover"
                boxShadow="md"
                borderRadius="lg"
                src={selectedMonkette.staticData.image}
              />
              <Text fontWeight={"bold"}>
                {selectedMonkette.staticData.name}
              </Text>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Center w="full">
            <Button
              bgColor="brandPink.200"
              color="white"
              mr={3}
              _hover={{
                bgColor: "brandPink.900",
              }}
              onClick={onSubmit}
              disabled={!onSubmit}
            >
              Submit
            </Button>
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UnstakingModal
