<script>
	import InfoLine from './InfoLine.svelte';
	import { formatAccountString } from '../utils/utils';
	export let transfer;
</script>

<div class="bg-white rounded-xl overflow-hidden flex shadow-md">
	<img src={transfer.image} class="w-24 object-cover" alt="NFT Token" />
	<div class="font-bold p-2 text-gray-400">
		<InfoLine
			label="ID"
			href={`https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/${transfer.tokenId}`}
			value={transfer.tokenId}
		/>
		<InfoLine
			label="From"
			href={`https://etherscan.io/address/${transfer.from}`}
			value={formatAccountString(transfer.from)}
		/>
		<InfoLine
			label="To"
			href={`https://etherscan.io/address/${transfer.to}`}
			value={formatAccountString(transfer.to)}
		/>
		<InfoLine
			label="📦"
			href={`https://etherscan.io/block/${transfer.blockNumber}`}
			value={transfer.blockNumber}
		/>
		<InfoLine label="📆" value={transfer.date.toLocaleString()} />
	</div>
</div>
