const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
require('ts-node').register({ transpileOnly: true });
const { seedDatabase } = require('./lib/seed.ts');

seedDatabase().then(console.log).catch(console.error).finally(() => process.exit(0));
