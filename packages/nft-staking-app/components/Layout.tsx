import _ from "lodash"
import Image from "next/image"
import Link from "next/link"
import React, { ReactNode } from "react"
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Badge,
  Text,
} from "@chakra-ui/react"
import { FiMenu, FiClipboard } from "react-icons/fi"
import { IconType } from "react-icons"
import { ReactText } from "react"
import { Wallet } from "./Wallet"
import { useIsAdmin } from "../hooks/useIsAdmin"
import { getClusterConstants } from "../constants"

interface LinkItemProps {
  name: string
  icon: IconType
  href: string
}

const AdminLinkItems: Array<LinkItemProps> = [
  {
    name: "Manage Pool",
    icon: FiClipboard,
    href: "/admin/manage-pool",
  },
]

export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode
}) {
  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isAdmin = useIsAdmin(ADDRESS_STAKING_POOL)

  return (
    <Box minH="100vh" backgroundImage="url('solfriends_bg.png')"
    backgroundRepeat="no-repeat" backgroundSize="cover">
      {isAdmin && (
        <>
          <SidebarContent
            onClose={() => onClose}
            display={{ base: "none", md: "block" }}
          />
          <Drawer
            autoFocus={false}
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            returnFocusOnClose={false}
            onOverlayClick={onClose}
            size="full"
          >
            <DrawerContent>
              <SidebarContent onClose={onClose} />
            </DrawerContent>
          </Drawer>
        </>
      )}
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box
        {...(isAdmin
          ? {
              w: { base: "full", md: "75%", lg: "80%", xl: "85%" },
              ml: { base: 0, md: "25%", lg: "20%", xl: "15%" },
            }
          : {
              w: "full",
              ml: 0,
            })}
        p="8"
        pb="40"
        h="full"
        position="fixed"
        backgroundColor={useColorModeValue("black.100", "gray.700")}
        overflow="auto"
      >
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      bg={useColorModeValue("brandPink.200", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: "25%", lg: "20%", xl: "15%" }}
      pos="fixed"
      h="full"
      overflow="auto"
      {...rest}
    >
      <Flex
        h="20"
        alignItems="center"
        px="4"
        py="2"
        w="full"
        justifyContent={{ base: "space-between", md: "center" }}
      >
        {/* <Link href="/" passHref>
          <Box cursor="pointer">
            <Image
              src="/solfriends.png"
              width={200}
              height={200}
              alt="solfriends Logo"
            />
          </Box>
        </Link> */}
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      <Flex
        align="center"
        p="2"
        mt="4"
        mx="4"
        role="group"
        borderBottom="2px"
        fontWeight="900"
        color="white"
      >
        <Text fontSize="2xl">Admin</Text>
      </Flex>
      {AdminLinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  href: string
  icon?: IconType
  children: ReactText
}
const NavItem = ({ href, icon, children, ...rest }: NavItemProps) => {
  return (
    <Link href={href} passHref>
      <Flex
        align="center"
        p="2"
        mt="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        fontWeight="900"
        color="white"
        _hover={{
          color: "brandPink.900",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "brandPink.900",
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL")
  const isAdmin = useIsAdmin(ADDRESS_STAKING_POOL)
  return (
    <Flex
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("brandBlue.0", "gray.900")}
      placeContent="space-between"
      // borderBottomWidth="1px"
      // borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      // justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      {/* <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      /> */}
        <Link href="/" passHref>
          <Box cursor="pointer">
            <Image
              src="/solfriends.png"
              width={200}
              height={200}
              alt="solfriends Logo"
            />
          </Box>
        </Link>

      <HStack spacing={{ base: "2", md: "6" }}>
        {isAdmin && (
          <Badge fontSize="1em" colorScheme="red">
            ADMIN
          </Badge>
        )}
        <Wallet />
      </HStack>
    </Flex>
  )
}
