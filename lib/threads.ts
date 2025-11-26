import { createIdGenerator } from "ai";

const options = {
  prefix: undefined, // 't'
  size:10, 
  alphabet:"0123456789abcdefghijklmnopqrstuvwxyz", 
  separator: undefined,
};
export const generateThreadId = createIdGenerator(options);