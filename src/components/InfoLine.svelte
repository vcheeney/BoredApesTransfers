<script lang="ts">
	export let label: string;
	export let value: string | number;
	export let href: string = undefined;
</script>

<p>
	<span>{label} </span>
	{#if href}
		<a {href} target="blank" class="text-gray-700 underline">{value}</a>
	{:else}
		<span>{value}</span>
	{/if}
</p>
