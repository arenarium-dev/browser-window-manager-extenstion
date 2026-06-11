<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import Icon from '$lib/components/icon/Icon.svelte';
	import WindowGroupNode from '$lib/components/nodes/WindowGroup.svelte';
	import { getOpenedWindows, subscribeOpenedWindows, unsubscribeOpenedWindows } from '$lib/core/chrome';
	import type { WindowGroup } from '$lib/core/types';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let windowsOpened = $state<WindowGroup | null>(null);

	onMount(async () => {
		setTimeout(async () => {
			try {
				windowsOpened = await getOpenedWindows();
				subscribeOpenedWindows(onChange);
			} catch (e) {
				error = String(e);
			} finally {
				loading = false;
			}
		}, 0);
	});

	onDestroy(() => {
		unsubscribeOpenedWindows(onChange);
	});

	async function onChange() {
		try {
			windowsOpened = await getOpenedWindows();
		} catch (e) {
			error = String(e);
		}
	}
</script>

<div class="tree">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<span>Loading...</span>
		</div>
	{:else if error}
		<div class="empty">
			<Icon name="close" size={48} />
			<span>Failed to load tabs</span>
			<small>{error}</small>
		</div>
	{:else}
		{#key windowsOpened}
			{#if windowsOpened}
				<WindowGroupNode group={windowsOpened} title="Opened" query="" />
			{/if}
		{/key}
	{/if}
</div>

<style>
	.tree {
		width: 100%;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--spacing-md);
		padding: var(--spacing-sm);
	}

	.loading {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		color: var(--text-muted);

		.spinner {
			width: 32px;
			height: 32px;
			border: 3px solid var(--bg-tertiary);
			border-top-color: var(--accent-blue);
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
	}

	.empty {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		color: var(--text-muted);
		text-align: center;
		gap: var(--spacing-sm);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
