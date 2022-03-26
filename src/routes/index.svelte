<script lang="ts">
	import { abi } from '../utils/abi';
	import { createTransferObject, type NftTransfer } from '../utils/api';

	import { onMount } from 'svelte';
	import { defaultEvmStores, connected, web3, makeContractStore, chainData } from 'svelte-web3';

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

<div class="bg-gray-100 p-4">
	{#if $connected}
		<h1 class="text-3xl pb-4">Transactions</h1>
		<ul>
			{#each transfers as t}
				<li>
					<img src={t.image} alt="NFT" class="rounded-lg" />
				</li>
			{/each}
		</ul>
	{:else}
		<h1 class="text-3xl pb-4">Not connected</h1>
	{/if}
	<div />
</div>
