<script lang="ts">
	import { Globe } from 'lucide-svelte';

	import { switchToTab } from '$lib/core/chrome';
	import type { TabInfo } from '$lib/core/types';

	interface Props {
		tab: TabInfo;
		inGroup: boolean;
		searchQuery: string;
	}

	let { tab, inGroup, searchQuery }: Props = $props();

	let faviconError = $state(false);

	// Check if tab matches search
	let isVisible = $derived.by(() => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query);
	});

	// Highlight matching text
	let highlightedTitle = $derived.by(() => {
		if (!searchQuery.trim()) return tab.title;
		const query = searchQuery.toLowerCase();
		const title = tab.title;
		const lowerTitle = title.toLowerCase();
		const idx = lowerTitle.indexOf(query);
		if (idx === -1) return title;

		const before = title.slice(0, idx);
		const match = title.slice(idx, idx + query.length);
		const after = title.slice(idx + query.length);
		return { before, match, after };
	});

	let showFavicon = $derived(tab.icon && !tab.icon.startsWith('chrome://') && !faviconError);

	async function onClick() {
		await switchToTab(tab.id, tab.windowId);
	}

	function handleFaviconError() {
		faviconError = true;
	}
</script>

<button class="tab" class:in-group={inGroup} class:hidden={!isVisible} onclick={onClick}>
	{#if showFavicon}
		<img class="favicon" src={tab.icon} alt="" onerror={handleFaviconError} />
	{:else}
		<Globe size={16} color="var(--text-secondary)" />
	{/if}
	<span class="title" title="{tab.title}\n{tab.url}">
		{#if typeof highlightedTitle === 'string'}
			{highlightedTitle}
		{:else}
			{highlightedTitle.before}<span class="highlight">{highlightedTitle.match}</span
			>{highlightedTitle.after}
		{/if}
	</span>
</button>

<style lang="less">
	.tab {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		user-select: none;
		padding: var(--spacing-xs) var(--spacing-lg);
		padding-left: var(--spacing-sm);
		background-color: var(--bg-secondary);
		border-radius: var(--radius-md);
		border: none;
		cursor: pointer;
		transition: background var(--transition-fast);

		.favicon {
			width: 16px;
			height: 16px;
			flex-shrink: 0;
			border-radius: 2px;
			object-fit: contain;
		}

		.title {
			flex: 1;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			color: var(--text-secondary);
			font-size: 12px;

			.highlight {
				background: rgba(230, 219, 116, 0.3);
				color: var(--accent-yellow);
				padding: 0 2px;
				border-radius: 2px;
			}
		}

		&:hover {
			background: var(--bg-hover);

			.title {
				color: var(--text-primary);
			}
		}
	}
</style>
