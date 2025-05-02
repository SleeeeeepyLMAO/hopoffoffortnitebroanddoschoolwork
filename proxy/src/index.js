let links;
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, "api/some.pass");
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    links = Object.keys(JSON.parse(data));
  } catch (err) {
    console.error("Error parsing JSON:", err);
  }
});
fs.watch(filePath, () => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      links = Object.keys(JSON.parse(data));
      console.log("file change");
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  });
});
import express from "express";
import { createServer } from "node:http";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import cookieParser from 'cookie-parser';
let publicPath = "./public/";
import addPass from './api/addPass.cjs';
import pkg from './api/verify.cjs';
const { checkPass, canAddLink } = pkg;
const app = express();
// Load our publicPath first and prioritize it over UV.
app.use(express.json());
app.use(cookieParser());
app.post("/api/addLink", (req, res) => {
  if(canAddLink(req)) {
    res.sendStatus(addPass(req.body));
  } else {
    res.sendStatus(401);
  }
});
app.use("/check", (req, res) => {
  if(links.includes(req.query.domain)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});
app.use((req, res, next) => {
  if (!checkPass(req)) {
    res.send("<script>document.cookie = `password=${prompt('Enter the password')}`;location.reload();</script>");
  } else {
    next();
  }
});
app.use(express.static(publicPath));
// Load vendor files last.
// The vendor's uv.config.js won't conflict with our uv.config.js inside the publicPath directory.
app.use("/purple/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// Error for everything else
app.use((req, res) => {
  res.status(404);
  res.sendFile(join(publicPath, "404.html"));
});

const server = createServer();

server.on("request", (req, res) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  app(req, res);
});
server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
  else socket.end();
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

server.on("listening", () => {
  const address = server.address();

  // by default we are listening on 0.0.0.0 (every interface)
  // we just need to list a few
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});

// https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close();
  process.exit(0);
}

server.listen({
  port,
});

