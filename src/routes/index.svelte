<script lang="ts">
	import { onMount } from 'svelte';
	import { defaultEvmStores, connected } from 'svelte-web3';

	const transactions = ['Transaction 1', 'Transaction 2', 'Transaction 3'];

	onMount(async () => {
		await defaultEvmStores.setProvider();
	});
</script>

<div class="bg-gray-100 p-4">
	{#if $connected}
		<h1 class="text-3xl pb-4">Transactions</h1>
		<img src="https://picsum.photos/200" alt="Latest transfered NFT" class="rounded-lg" />
		<ul>
			{#each transactions as t}
				<li>
					{t}
				</li>
			{/each}
		</ul>
	{:else}
		<h1 class="text-3xl pb-4">Not connected</h1>
	{/if}
	<div />
</div>
