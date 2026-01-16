<script lang="ts">
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

<button class="tab-node" class:in-group={inGroup} class:hidden={!isVisible} onclick={onClick}>
	<div class="header">
		{#if showFavicon}
			<img class="favicon" src={tab.icon} alt="" onerror={handleFaviconError} />
		{:else}
			<svg
				class="favicon-placeholder"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
				<polyline points="14 2 14 8 20 8"></polyline>
			</svg>
		{/if}

		<span class="title" title="{tab.title}\n{tab.url}">
			{#if typeof highlightedTitle === 'string'}
				{highlightedTitle}
			{:else}
				{highlightedTitle.before}<span class="highlight">{highlightedTitle.match}</span
				>{highlightedTitle.after}
			{/if}
		</span>
	</div>
</button>

<style>
	.tab-node {
		user-select: none;
		margin-left: calc(var(--spacing-lg) * 2);
		animation: fadeIn var(--transition-normal) ease-out;
		animation-fill-mode: backwards;
	}

	.tab-node.in-group {
		margin-left: var(--spacing-lg);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.header {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-lg);
		padding-left: var(--spacing-md);
		cursor: pointer;
		transition: background var(--transition-fast);
		border-left: 2px solid transparent;
		position: relative;
	}

	.header:hover {
		background: var(--bg-hover);
		border-left-color: var(--text-muted);
	}

	.favicon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		border-radius: 2px;
		object-fit: contain;
	}

	.favicon-placeholder {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--text-muted);
	}

	.title {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-secondary);
		font-size: 12px;
	}

	.highlight {
		background: rgba(230, 219, 116, 0.3);
		color: var(--accent-yellow);
		padding: 0 2px;
		border-radius: 2px;
	}
</style>
