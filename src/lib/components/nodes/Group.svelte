<script lang="ts">
	import TabNode from '$lib/components/nodes/Tab.svelte';

	import { ChevronDown } from 'lucide-svelte';

	import type { TabGroupInfo, TabInfo } from '$lib/core/types';

	interface Props {
		group: TabGroupInfo;
		tabs: TabInfo[];
		searchQuery: string;
	}

	let { group, tabs, searchQuery }: Props = $props();

	let collapsed = $state(false);

	// Filter visibility based on search
	let visibleTabs = $derived.by(() => {
		if (!searchQuery.trim()) return tabs;
		const query = searchQuery.toLowerCase();
		return tabs.filter(
			(tab) => tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)
		);
	});

	let hasVisibleContent = $derived(visibleTabs.length > 0);

	// Auto-expand when searching and has matches
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

<div
	class="group"
	class:collapsed
	class:hidden={!hasVisibleContent}
	style="--group-color: {group.color}"
>
	<button class="header" onclick={onToggle}>
		<div class="icon">
			<ChevronDown size={16} />
		</div>
		<span class="label">{group.title}</span>
	</button>

	<div class="children">
		{#each tabs as tab (tab.id)}
			<TabNode {tab} inGroup={true} {searchQuery} />
		{/each}
	</div>
</div>

<style lang="less">
	.group {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--spacing-sm);
		padding-top: var(--spacing-xs);
		user-select: none;
		animation: fadeIn var(--transition-normal) ease-out;
		animation-fill-mode: backwards;

		.header {
			--color: color-mix(in srgb, var(--group-color) 50%, var(--text-primary));

			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-lg);
			padding-left: var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: 2px solid var(--color);
			border-radius: var(--radius-md);
			cursor: pointer;
			transition: background var(--transition-fast);

			.icon {
				display: flex;
				color: var(--color);
				pointer-events: none;
				transition: transform var(--transition-fast);
			}

			.label {
				flex: 1;
				color: var(--color);
				font-size: 12px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.children {
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: var(--spacing-xs);
			padding-left: var(--spacing-md);
			overflow: hidden;
			transition: max-height var(--transition-normal);
		}

		&.collapsed {
			.header {
				.icon {
					transform: rotate(-90deg);
				}
			}

			.children {
				display: none;
			}
		}
	}
</style>
