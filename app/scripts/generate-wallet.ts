import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log('--- Danni Wallet Generated ---');
console.log(`Address:     ${account.address}`);
console.log(`Private Key: ${privateKey}`);
console.log('');
console.log('Add to your .env file:');
console.log(`WALLET_ADDRESS=${account.address}`);
console.log(`WALLET_PRIVATE_KEY=${privateKey}`);
console.log('');
console.log('Fund with testnet USDC:');
console.log('  Base Sepolia faucet: https://faucet.circle.com/');
console.log(`  Address to fund: ${account.address}`);
