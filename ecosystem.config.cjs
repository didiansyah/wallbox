module.exports = {
  apps: [
    {
      name: 'wallbox',
      cwd: '/root/wallbox',
      script: '/root/.hermes/node/bin/pnpm',
      args: 'exec next start -H 127.0.0.1 -p 3075',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'https://wallbox.hanslabs.xyz',
        WALLBOX_STORAGE_DIR: '/root/wallbox/data/runs',
        WALLBOX_BLOB_STORE_MODE: process.env.WALLBOX_BLOB_STORE_MODE || 'walrus',
        WALLBOX_CERTIFICATE_MODE: process.env.WALLBOX_CERTIFICATE_MODE || 'sui-tatum',
        WALRUS_PUBLISHER_URL: process.env.WALRUS_PUBLISHER_URL,
        WALRUS_AGGREGATOR_URL: process.env.WALRUS_AGGREGATOR_URL,
        SUI_NETWORK: 'testnet',
        WALRUS_NETWORK: 'testnet',
        WALLBOX_ALLOW_MAINNET: 'false',
        TATUM_API_KEY: process.env.TATUM_API_KEY,
        TATUM_SUI_RPC_URL: process.env.TATUM_SUI_RPC_URL,
        SUI_PRIVATE_KEY: process.env.SUI_PRIVATE_KEY,
        SUI_PACKAGE_ID: process.env.SUI_PACKAGE_ID,
        SUI_CERTIFICATE_MODULE: process.env.SUI_CERTIFICATE_MODULE || 'certificate',
        SUI_CLI_PATH: process.env.SUI_CLI_PATH || '/root/.local/bin/sui',
        SUI_GAS_BUDGET: process.env.SUI_GAS_BUDGET || '50000000'
      },
      max_memory_restart: '400M',
      autorestart: true
    }
  ]
};
