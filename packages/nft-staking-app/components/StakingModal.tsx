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
import { MonketteAccount } from "../hooks/useNftAccounts"
import { Pool } from "../models/pool"

const StakingModal = ({
  isOpen,
  pool,
  selectedMonkette,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  pool?: Pool
  selectedMonkette?: MonketteAccount
  onClose: () => void
  onSubmit: () => void
}) => {
  return (
    <Modal isOpen={isOpen} size="sm" onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor={"gray.100"}>
        <ModalHeader>
          <Center>Stake NFT</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedMonkette && pool && (
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
              <Text>{`Unstaking period: ${pool.unstakingPeriodDisplay}`}</Text>
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
            >
              Submit
            </Button>
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StakingModal
