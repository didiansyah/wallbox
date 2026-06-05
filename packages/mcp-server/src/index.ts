#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWallboxMcpServer } from "./server.js";

const server = createWallboxMcpServer();
await server.connect(new StdioServerTransport());
