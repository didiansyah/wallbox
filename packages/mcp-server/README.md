# @wallbox/mcp-server

MCP stdio server for Wallbox. It lets MCP-capable agents capture runs and verify certificates without wiring raw HTTP calls.

## Configure

```bash
export WALLBOX_BASE_URL="https://wallbox.hanslabs.xyz"
export WALLBOX_API_KEY="wbx_..."
```

`WALLBOX_API_KEY` is required for `wallbox_capture_run`. Read-only tools can run without it.

## Run

```bash
npx @wallbox/mcp-server
# or from the monorepo
pnpm --filter @wallbox/mcp-server start
```

## Hermes config example

```yaml
mcp_servers:
  wallbox:
    command: "node"
    args: ["/root/wallbox/packages/mcp-server/dist/index.js"]
    env:
      WALLBOX_BASE_URL: "https://wallbox.hanslabs.xyz"
      WALLBOX_API_KEY: "wbx_..."
```

## Tools

- `wallbox_capture_run` — submit task, agent, trace, sources, artifacts to Wallbox.
- `wallbox_verify_certificate` — verify a Sui certificate ID or known tx digest.
- `wallbox_get_run` — fetch a stored run by run ID.
- `wallbox_list_runs` — list recent runs.
- `wallbox_status` — show server config without exposing secrets.
