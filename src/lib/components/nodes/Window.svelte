<script lang="ts">
	import GroupNode from '$lib/components/nodes/Group.svelte';
	import TabNode from '$lib/components/nodes/Tab.svelte';

	import { organizeTabsByGroups } from '$lib/core/chrome';
	import type { WindowInfo, TabInfo, TabGroupInfo } from '$lib/core/types';

	interface Props {
		windowInfo: WindowInfo;
		index: number;
		searchQuery: string;
	}

	let { windowInfo, index, searchQuery }: Props = $props();

	let collapsed = $state(false);

	// Organize tabs by groups, maintaining order
	let organizedContent = $derived.by(() => {
		const { groupedTabs } = organizeTabsByGroups(windowInfo.tabs);
		const items: Array<
			{ type: 'group'; group: TabGroupInfo; tabs: TabInfo[] } | { type: 'tab'; tab: TabInfo }
		> = [];
		const processedGroups = new Set<number>();

		for (const tab of windowInfo.tabs) {
			if (tab.groupId !== -1 && !processedGroups.has(tab.groupId)) {
				const group = windowInfo.groups.get(tab.groupId);
				const tabs = groupedTabs.get(tab.groupId);
				if (group && tabs) {
					items.push({ type: 'group', group, tabs });
					processedGroups.add(tab.groupId);
				}
			} else if (tab.groupId === -1) {
				items.push({ type: 'tab', tab });
			}
		}
		return items;
	});

	// Filter visibility based on search
	let hasVisibleContent = $derived.by(() => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return windowInfo.tabs.some(
			(tab) => tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)
		);
	});

	// Auto-expand when searching
	$effect(() => {
		if (searchQuery.trim() && hasVisibleContent) {
			collapsed = false;
		}
	});

	function onToggle(e: MouseEvent) {
		e.stopPropagation();
		collapsed = !collapsed;
	}
</script>

<div class="window-node" class:collapsed class:hidden={!hasVisibleContent}>
	<button class="header" class:focused={windowInfo.focused} onclick={onToggle}>
		<svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>

		<svg class="window-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
			<line x1="3" y1="9" x2="21" y2="9"></line>
		</svg>

		<span class="label">
			{`Window ${index + 1}`}
			{windowInfo.focused ? ' (Current)' : ''}
		</span>

		<span class="badge">{windowInfo.tabs.length}</span>
	</button>

	<div class="children">
		{#each organizedContent as item}
			{#if item.type === 'group'}
				<GroupNode group={item.group} tabs={item.tabs} {searchQuery} />
			{:else}
				<TabNode tab={item.tab} inGroup={false} {searchQuery} />
			{/if}
		{/each}
	</div>
</div>

<style>
	.window-node {
		user-select: none;
		animation: fadeIn var(--transition-normal) ease-out;
		animation-fill-mode: backwards;
	}

	.window-node:nth-child(1) {
		animation-delay: 0ms;
	}
	.window-node:nth-child(2) {
		animation-delay: 50ms;
	}
	.window-node:nth-child(3) {
		animation-delay: 100ms;
	}
	.window-node:nth-child(4) {
		animation-delay: 150ms;
	}
	.window-node:nth-child(5) {
		animation-delay: 200ms;
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
		padding: var(--spacing-sm) var(--spacing-lg);
		cursor: pointer;
		transition: background var(--transition-fast);
		border-left: 2px solid var(--window-color);
		background: linear-gradient(90deg, rgba(102, 217, 239, 0.08) 0%, transparent 100%);
	}

	.header:hover {
		background: linear-gradient(90deg, rgba(102, 217, 239, 0.15) 0%, var(--bg-hover) 100%);
	}

	.focused {
		position: relative;
	}

	.focused::after {
		content: '';
		position: absolute;
		right: var(--spacing-lg);
		top: 50%;
		transform: translateY(-50%);
		width: 6px;
		height: 6px;
		background: var(--accent-green);
		border-radius: 50%;
		box-shadow: 0 0 6px var(--accent-green);
	}

	.expand-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: var(--text-muted);
		transition: transform var(--transition-fast);
	}

	.collapsed .expand-icon {
		transform: rotate(-90deg);
	}

	.window-icon {
		width: 16px;
		height: 16px;
		color: var(--window-color);
		flex-shrink: 0;
	}

	.label {
		font-weight: 500;
		color: var(--window-color);
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		padding: 2px 6px;
		background: rgba(102, 217, 239, 0.15);
		color: var(--window-color);
		border-radius: var(--radius-sm);
	}

	.children {
		overflow: hidden;
		transition: max-height var(--transition-normal);
	}

	.collapsed .children {
		max-height: 0 !important;
	}
</style>
