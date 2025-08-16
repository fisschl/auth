import { parse, v7 } from "uuid";
import { base58 } from "@scure/base";

export const tokenRandom = () => {
  const uuidBytes = parse(v7());
  const randomBytes = new Uint8Array(13);
  crypto.getRandomValues(randomBytes);
  const bytes = new Uint8Array([...uuidBytes, ...randomBytes]);
  return base58.encode(bytes);
};
