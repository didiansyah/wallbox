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
        WALLBOX_BLOB_STORE_MODE: 'local',
        WALLBOX_CERTIFICATE_MODE: 'local',
        SUI_NETWORK: 'testnet',
        WALRUS_NETWORK: 'testnet'
      },
      max_memory_restart: '400M',
      autorestart: true
    }
  ]
};
