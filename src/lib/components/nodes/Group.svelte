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

<div class="group-node" class:collapsed class:hidden={!hasVisibleContent}>
	<button class="header" onclick={onToggle}>
		<ChevronDown class="expand-icon" size={14} />
		<div class="color-dot" style="color: {group.color}"></div>
		<span class="label" style="color: {group.color}">{group.title}</span>
		<span class="badge">{tabs.length}</span>
	</button>

	<div class="children">
		{#each tabs as tab (tab.id)}
			<TabNode {tab} inGroup={true} {searchQuery} />
		{/each}
	</div>
</div>

<style lang="less">
	.group-node {
		user-select: none;
		margin-left: var(--spacing-lg);
		animation: fadeIn var(--transition-normal) ease-out;
		animation-fill-mode: backwards;

		.header {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-lg);
			padding-left: var(--spacing-md);
			cursor: pointer;
			transition: background var(--transition-fast);
			border-left: 2px solid var(--group-color);
			background: linear-gradient(90deg, rgba(174, 129, 255, 0.06) 0%, transparent 100%);

			&:hover {
				background: linear-gradient(90deg, rgba(174, 129, 255, 0.12) 0%, var(--bg-hover) 100%);
			}

			.color-dot {
				width: 10px;
				height: 10px;
				border-radius: 50%;
				flex-shrink: 0;
				box-shadow: 0 0 4px currentColor;
			}

			.label {
				font-weight: 500;
				flex: 1;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.badge {
				font-family: 'JetBrains Mono', monospace;
				font-size: 10px;
				padding: 2px 6px;
				background: rgba(174, 129, 255, 0.15);
				color: var(--group-color);
				border-radius: var(--radius-sm);
			}
		}

		.children {
			overflow: hidden;
			transition: max-height var(--transition-normal);
		}

		&.collapsed {
			:global(.expand-icon) {
				transform: rotate(-90deg);
			}

			.children {
				max-height: 0 !important;
			}
		}
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

	:global(.expand-icon) {
		flex-shrink: 0;
		color: var(--text-muted);
		transition: transform var(--transition-fast);
	}
</style>
