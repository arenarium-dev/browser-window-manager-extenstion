<script lang="ts">
	import WindowNode from './Window.svelte';

	import Icon from '$lib/components/icon/Icon.svelte';

	import { WindowGroup } from '$lib/core/types';

	interface Props {
		group: WindowGroup;
		title: 'Opened' | 'Bookmarked';
		query: string;
	}
	let props: Props = $props();

	let accent = $derived.by(() => {
		switch (props.title) {
			case 'Opened':
				return 'var(--accent-green)';
			case 'Bookmarked':
				return 'var(--accent-yellow)';
			default:
				return 'var(--accent-blue)';
		}
	});

	// Collapsed
	let collapsed = $state(false);

	// Visibility
	let visibleItems = $derived(props.group.windows.filter((item) => item.matches(props.query)));
	let visibleContentExists = $derived(visibleItems.length > 0);

	// Auto-expand when searching
	$effect(() => {
		if (props.query.trim() && visibleContentExists) {
			collapsed = false;
		}
	});

	function onToggle(e: MouseEvent) {
		e.stopPropagation();
		collapsed = !collapsed;
	}
</script>

<div class="group" class:collapsed class:hidden={!visibleContentExists} style="--accent: {accent};">
	<button class="header" onclick={onToggle}>
		<div class="icon">
			{#if props.title === 'Opened'}
				<Icon name="dock_to_left" size={16} />
			{/if}
			{#if props.title === 'Bookmarked'}
				<Icon name="bookmark" size={16} />
			{/if}
		</div>
		<span class="label">{props.title} {props.group.name}</span>
		<div class="icon chevron">
			<Icon name="keyboard_arrow_down" size={16} />
		</div>
	</button>

	<div class="children">
		{#each props.group.windows as window}
			<WindowNode {window} query={props.query} />
		{/each}
	</div>
</div>

<style>
	.group {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		border: 2px solid var(--accent);
		border-radius: var(--radius-md);
		overflow: hidden;

		.header {
			width: 100%;
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: none;
			border-bottom: 2px solid var(--accent);
			font-size: 12px;
			cursor: pointer;
			transition: background var(--transition-fast);

			.icon {
				display: flex;
				color: var(--accent);
				pointer-events: none;
				transition: transform var(--transition-fast);
			}

			.label {
				flex-grow: 1;
				color: var(--accent);
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
			padding: var(--spacing-md);
			padding-right: 0px;
			overflow: hidden;
		}

		&.collapsed {
			.header {
				border: none;

				.chevron {
					transform: rotate(-90deg);
				}
			}

			.children {
				display: none;
			}
		}
	}
</style>
