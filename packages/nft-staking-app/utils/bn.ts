import BN from "bn.js"

export const U64_MAX = new BN("18446744073709551615")
export const SEC_PER_WEEK = new BN("604800")

export const getNowBn = () => new BN(Date.now() / 1000)
