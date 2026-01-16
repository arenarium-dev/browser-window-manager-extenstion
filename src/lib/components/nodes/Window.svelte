<script lang="ts">
	import GroupNode from '$lib/components/nodes/Group.svelte';
	import TabNode from '$lib/components/nodes/Tab.svelte';
	import Stats from '$lib/components/Stats.svelte';

	import { ChevronDown } from 'lucide-svelte';

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

<div class="window" class:collapsed class:hidden={!hasVisibleContent}>
	<button class="header" class:focused={windowInfo.focused} onclick={onToggle}>
		<div class="icon">
			<ChevronDown size={16} />
		</div>
		<span class="label">{`Window ${index + 1}`}</span>
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

<style lang="less">
	.window {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--spacing-sm);

		.header {
			width: 100%;
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) 0;
			padding-left: var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: 2px solid var(--text-primary);
			border-radius: var(--radius-md);
			font-size: 12px;
			cursor: pointer;
			transition: background var(--transition-fast);

			.icon {
				display: flex;
				color: var(--text-primary);
				pointer-events: none;
				transition: transform var(--transition-fast);
			}

			.label {
				flex-grow: 1;
				color: var(--text-primary);
				white-space: nowrap;
				overflow: hidden;
				text-align: start;
				text-overflow: ellipsis;
			}

			&:hover {
				background-color: var(--bg-tertiary);
			}
		}

		.children {
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: var(--spacing-xs);
			padding-left: var(--spacing-md);
			overflow: hidden;
		}

		&.collapsed {
			.icon {
				transform: rotate(-90deg);
			}

			.children {
				display: none;
			}
		}
	}
</style>
