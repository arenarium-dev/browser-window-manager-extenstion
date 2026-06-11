<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	import type { Tab } from '$lib/core/types';

	interface Props {
		tab: Tab;
		query: string;
	}
	let props: Props = $props();

	// Favicon
	let faviconError = $state(false);
	let faviconValid = $derived(props.tab.icon && !props.tab.icon.startsWith('chrome://'));

	// Visibility
	let visible = $derived(props.tab.matches(props.query));

	// Title
	let titleContent = $derived.by(() => {
		// Get title
		const title = props.tab.title;
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

	async function onClick() {
		// Get tab id and window id
		const id = props.tab.id;
		const windowId = props.tab.windowId;
		if (!id || !windowId) return;

		await chrome.tabs.update(id, { active: true });
		await chrome.windows.update(windowId, { focused: true });
	}
</script>

<button class="tab" class:hidden={!visible} onclick={onClick}>
	{#if faviconValid && !faviconError}
		<img class="favicon" src={props.tab.icon} alt="" onerror={() => (faviconError = true)} />
	{:else}
		<Icon name="globe" size={16} color="var(--text-secondary)" />
	{/if}
	<span class="title" title="{props.tab.title}\n{props.tab.url}">
		{#if typeof titleContent === 'string'}
			{titleContent}
		{:else}
			<span>{titleContent.before}</span>
			<span class="highlight">{titleContent.match}</span>
			<span>{titleContent.after}</span>
		{/if}
	</span>
</button>

<style>
	.tab {
		width: 100%;
		display: flex;
		align-items: center;
		text-align: start;
		gap: var(--spacing-sm);
		user-select: none;
		padding: var(--spacing-xs) var(--spacing-lg);
		padding-left: var(--spacing-sm);
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
			width: 100%;
			flex: 1;
			color: var(--text-secondary);
			font-size: 16px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

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
