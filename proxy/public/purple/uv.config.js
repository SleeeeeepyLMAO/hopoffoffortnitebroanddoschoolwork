// This file overwrites the stock UV config.js

self.__uv$config = {
  prefix: "/purple/service/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/purple/uv.handler.js",
  client: "/purple/uv.client.js",
  bundle: "/purple/uv.bundle.js",
  config: "/purple/uv.config.js",
  sw: "/purple/uv.sw.js",
};
