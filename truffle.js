/**
 * 
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
var file_json = JSON.parse(fs.readFileSync('private_keys.json', 'utf8'));
const infuraKey = file_json.infuraKey;
const mnemonic = file_json.mnemonic;


module.exports = {
  // networks define how you connect to your ethereum client and let you set the
  // defaults web3 uses to send transactions
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/"+ infuraKey),
      network_id: 3,  
    },
  },
  compilers: {
    solc: {
      version: "^0.4.19",
      optimizer: {
         enabled: false,
         runs: 200
       },
    }
 }
};