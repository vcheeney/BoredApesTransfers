<script lang="ts">
	import { abi } from '../utils/abi';
	import { createTransferObject, type NftTransfer } from '../utils/api';

	import { onMount } from 'svelte';
	import { defaultEvmStores, connected, web3, makeContractStore, chainData } from 'svelte-web3';
	import { formatAccountString } from '../utils/utils';

	onMount(async () => {
		if (window.ethereum) {
			await defaultEvmStores.setProvider(window.ethereum);
		}
	});

	let transfers: NftTransfer[] = [];

	const contract = makeContractStore(abi, '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');

	async function setupTransfersListener(contract) {
		if (contract) {
			const currentBlockNumber = await $web3.eth.getBlockNumber();

			contract
				.getPastEvents('Transfer', {
					fromBlock: currentBlockNumber - (60 * 60 * 6) / 15,
					toBlock: 'latest'
				})
				.then(async (events) => {
					for (const event of events) {
						if (!transfers.find((t) => t.id === event.id)) {
							const dataUri = await contract.methods.tokenURI(event.returnValues.tokenId).call();
							const transfer = await createTransferObject(event, dataUri);
							transfers = [transfer, ...transfers];
						}
					}
				});

			contract.events.Transfer(
				{
					fromBlock: 'earliest'
				},
				async (error, event) => {
					if (error) {
						console.log(error);
					} else {
						const dataUri = await contract.methods.tokenURI(event.returnValues.tokenId).call();
						const transfer = await createTransferObject(event, dataUri);
						transfers = [transfer, ...transfers];
					}
				}
			);
		}
	}

	$: setupTransfersListener($contract);
</script>

<svelte:head>
	<title>Bored Apes Transfers</title>
</svelte:head>

<div class="bg-orange-600 p-4 h-screen overflow-y-scroll text-white font-semibold">
	<div class="container max-w-screen-sm mx-auto">
		{#if $connected}
			<header class="pb-4 text-center">
				<h1 class="text-3xl text-white font-extrabold mb-2">Bored Apes Transfers</h1>
				<p>
					This app listens to <a
						class="underline"
						href="https://etherscan.io/address/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#events"
						target="blank">Transfer events</a
					> on the BYAC smart contract. New transfers will be added to the top of the list as they happen.
				</p>
			</header>
			<div class="space-y-4">
				{#each transfers as transfer}
					<div class="bg-white rounded-xl overflow-hidden flex shadow-md">
						<img src={transfer.image} class="w-24 object-cover" alt="NFT Token" />
						<div class="font-bold p-2 text-gray-400">
							<p>
								ID: <a
									class="text-gray-700 underline"
									href={`https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/${transfer.tokenId}`}
									target="blank">{transfer.tokenId}</a
								>
							</p>
							<p>
								From: <a
									href={`https://etherscan.io/address/${transfer.from}`}
									target="blank"
									class="text-gray-700 underline">{formatAccountString(transfer.from)}</a
								>
							</p>
							<p>
								To: <a
									href={`https://etherscan.io/address/${transfer.to}`}
									target="blank"
									class="text-gray-700 underline">{formatAccountString(transfer.to)}</a
								>
							</p>
							<p>
								📦 <a
									class="text-gray-700 underline"
									target="blank"
									href={`https://etherscan.io/block/${transfer.blockNumber}`}
									>{transfer.blockNumber}</a
								>
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="pb-4 text-center">
				<h1 class="text-3xl mb-2 text-white font-extrabold text-center">Not connected...</h1>
				<p>
					This app requires a Web3 provider to be connected. Please make sure you have <a
						class="underline"
						href="https://metamask.io/"
						target="blank">MetaMask</a
					>
					installed.
				</p>
			</div>
		{/if}
	</div>
	<div />
</div>
