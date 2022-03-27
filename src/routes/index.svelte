<script lang="ts">
	import { onMount } from 'svelte';
	import { connected, defaultEvmStores, web3 } from 'svelte-web3';

	import Container from 'src/components/Container.svelte';
	import Header from 'src/components/Header.svelte';
	import TransferCard from 'src/components/TransferCard.svelte';

	import { createTransferObject, type NftTransfer } from 'src/utils/api';
	import { contract } from 'src/utils/stores';

	onMount(async () => {
		if (window.ethereum) {
			await defaultEvmStores.setProvider(window.ethereum);
		}
	});

	let transfers: NftTransfer[] = [];

	$: setupTransfersListener($contract);

	async function setupTransfersListener(contract) {
		if (contract) {
			await fetchLast6HoursTransfers(contract);
			subscribeToNewTransferEvents(contract);
		}
	}

	async function fetchLast6HoursTransfers(contract) {
		const currentBlockNumber = await $web3.eth.getBlockNumber();
		const BLOCK_SIX_HOURS_AGO = currentBlockNumber - (60 * 60 * 6) / 15;

		contract
			.getPastEvents('Transfer', {
				fromBlock: BLOCK_SIX_HOURS_AGO,
				toBlock: 'latest'
			})
			.then(async (events) => {
				for (const event of events) {
					if (!transfers.find((t) => t.id === event.id)) {
						const dataUri = await contract.methods.tokenURI(event.returnValues.tokenId).call();
						const block = await $web3.eth.getBlock(event.blockNumber);
						const transferDate = new Date(block.timestamp * 1000);
						const transfer = await createTransferObject(event, dataUri, transferDate);
						transfers = [transfer, ...transfers];
					}
				}
			});
	}

	function subscribeToNewTransferEvents(contract) {
		contract.events.Transfer(
			{
				fromBlock: 'earliest'
			},
			async (error, event) => {
				if (error) {
					console.log(error);
				} else {
					const dataUri = await contract.methods.tokenURI(event.returnValues.tokenId).call();
					const block = await $web3.eth.getBlock(event.blockNumber);
					const transferDate = new Date(block.timestamp * 1000);
					const transfer = await createTransferObject(event, dataUri, transferDate);
					transfers = [transfer, ...transfers];
				}
			}
		);
	}
</script>

<Container>
	{#if $connected}
		<Header>
			<p>
				This app listens to <a
					class="underline"
					href="https://etherscan.io/address/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#events"
					target="blank">Transfer events</a
				>
				on the BAYC smart contract. New transfers will be added to the top of the list as they happen.
			</p>
		</Header>
		<div class="space-y-4">
			{#each transfers as transfer}
				<TransferCard {transfer} />
			{/each}
		</div>
	{:else}
		<Header>
			<p>
				This app requires a Web3 provider to be connected. Please make sure you have <a
					class="underline"
					href="https://metamask.io/"
					target="blank">MetaMask</a
				>
				installed.
			</p>
		</Header>
	{/if}
</Container>
