import { makeContractStore } from 'svelte-web3';
import { abi } from './abi';

export const BAYC_SMART_CONTRACT_ADDRESS = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';

export const contract = makeContractStore(abi, BAYC_SMART_CONTRACT_ADDRESS);
