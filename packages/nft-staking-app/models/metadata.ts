import _ from "lodash"
import { PublicKey } from "@solana/web3.js"
import { BaseRawAccount, BaseRawAccountManager } from "./baseRaw"
import { programs } from "@metaplex/js"
import { Connection } from "@solana/web3.js"

const {
  metadata: { Metadata },
} = programs

export interface Creator {
  address: string
  verified: boolean
  share: number
}

export interface MetadataDataData {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators?: Creator[]
}

export interface MetaplexMetadataAccount {
  key: number
  updateAuthority: string
  mint: string
  data: MetadataDataData
  primarySaleHappened: boolean
  isMutable: boolean
  editionNonce?: number
  masterEdition?: string
  edition?: string
}

export const AccountType = "metaplexMetadata"

export class MetaplexMetadata extends BaseRawAccount<MetaplexMetadataAccount> {}

export class MetaplexMetadataManager extends BaseRawAccountManager<
  MetaplexMetadataAccount,
  MetaplexMetadata
> {
  constructor(connection: Connection) {
    super(connection, AccountType)
  }

  isValid = (entity: any): entity is MetaplexMetadata => {
    return (
      typeof entity.data.isMutable === "number" &&
      typeof entity.data.key === "number" &&
      typeof entity.data.primarySaleHappened === "number" &&
      typeof entity.data.mint === "string" &&
      typeof entity.data.updateAuthority === "string" &&
      typeof entity.data.data.sellerFeeBasisPoints === "number" &&
      typeof entity.data.data.name === "string" &&
      typeof entity.data.data.symbol === "string" &&
      typeof entity.data.data.uri === "string" &&
      (!entity.data.data.creators || _.isArray(entity.data.data.creators))
    )
  }

  toDomain = async (account: any, publicKey: PublicKey) => {
    const metadata = new Metadata(publicKey, account)
    return new MetaplexMetadata(publicKey, metadata.data as any)
  }
}
