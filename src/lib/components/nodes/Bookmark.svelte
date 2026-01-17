<script lang="ts">
	import { Globe } from 'lucide-svelte';

	import type { Bookmark } from '$lib/core/types';

	interface Props {
		bookmark: Bookmark;
		query: string;
	}
	let props: Props = $props();

	// Favicon
	let faviconError = $state(false);
	let faviconValid = $derived(props.bookmark.icon && !props.bookmark.icon.startsWith('chrome://'));

	// Visibility
	let visible = $derived(props.bookmark.matches(props.query));

	// Title
	let titleContent = $derived.by(() => {
		// Get title
		const title = props.bookmark.title;
		if (!title) return '';

		// Check if query is in title
		const query = props.query.toLowerCase().trim();
		if (!query) return title;

		// Get index of query in title
		const idx = title.toLowerCase().indexOf(query);
		if (idx === -1) return title;

		// Return title with highlighted match
		const before = title.slice(0, idx);
		const match = title.slice(idx, idx + query.length);
		const after = title.slice(idx + query.length);
		return { before, match, after };
	});

	function onClick() {
		// Open the bookmark URL in a new tab
		if (props.bookmark.url) {
			chrome.tabs.create({ url: props.bookmark.url });
			window.close();
		}
	}
</script>

<button class="bookmark" class:hidden={!visible} onclick={onClick}>
	{#if faviconValid && !faviconError}
		<img class="favicon" src={props.bookmark.icon} alt="" onerror={() => (faviconError = true)} />
	{:else}
		<Globe size={16} color="var(--text-secondary)" />
	{/if}
	<span class="title" title="{props.bookmark.title}\n{props.bookmark.url}">
		{#if typeof titleContent === 'string'}
			<span>{titleContent}</span>
		{:else}
			<span>{titleContent.before}</span>
			<span class="highlight">{titleContent.match}</span>
			<span>{titleContent.after}</span>
		{/if}
	</span>
</button>

<style lang="less">
	.bookmark {
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
