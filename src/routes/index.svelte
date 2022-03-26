<script lang="ts">
	import { abi } from '../utils/abi';
	import { createTransferObject, type NftTransfer } from '../utils/api';

	import { onMount } from 'svelte';
	import { defaultEvmStores, connected, web3, makeContractStore, chainData } from 'svelte-web3';
	import { formatAccountString } from '../utils/utils';

	onMount(async () => {
		await defaultEvmStores.setProvider();
	});

	let transfers: NftTransfer[] = [];

	const contract = makeContractStore(abi, '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');

	async function setupTransfersListener(contract) {
		if (contract) {
			const currentBlockNumber = await $web3.eth.getBlockNumber();

			contract
				.getPastEvents('Transfer', {
					fromBlock: currentBlockNumber - 500,
					toBlock: 'latest'
				})
				.then(async (events) => {
					for (const event of events) {
						if (!transfers.find((t) => t.id === event.id)) {
							const dataUri = await contract.methods.tokenURI(event.returnValues.tokenId).call();
							const transfer = await createTransferObject(event, dataUri);
							transfers = [...transfers, transfer];
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
						transfers = [...transfers, transfer];
					}
				}
			);
		}
	}

	$: setupTransfersListener($contract);
	$: console.log('transfers', transfers);
</script>

<div class="bg-orange-500 p-4 h-screen overflow-y-scroll">
	<div class="container max-w-screen-sm mx-auto">
		{#if $connected}
			<h1 class="text-3xl pb-4 text-white font-extrabold text-center">Bored Apes Transfers</h1>
			<div class="space-y-4">
				{#each transfers as transfer}
					<div class="bg-white rounded-xl overflow-hidden flex shadow-md">
						<img src={transfer.image} class="w-24 object-cover" alt="NFT Token" />
						<div class="font-bold p-2 text-gray-400">
							<p>Token: <span class="text-gray-700">{transfer.tokenId}</span></p>
							<p>From: <span class="text-gray-700">{formatAccountString(transfer.from)}</span></p>
							<p>To: <span class="text-gray-700">{formatAccountString(transfer.to)}</span></p>
							<p>In block <span class="text-gray-700">{transfer.blockNumber}</span></p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<h1 class="text-3xl pb-4 text-white font-extrabold text-center">Not connected...</h1>
		{/if}
	</div>
	<div />
</div>
