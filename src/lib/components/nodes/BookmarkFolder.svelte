<script lang="ts">
	import BookmarkNode from '$lib/components/nodes/Bookmark.svelte';

	import { ChevronDown, Folder } from 'lucide-svelte';

	import { BookmarkFolder, Bookmark } from '$lib/core/types';

	interface Props {
		folder: BookmarkFolder;
		query: string;
	}
	let props: Props = $props();

	// Collapsed
	let collapsed = $state(true);

	// Visibility
	let visible = $derived(props.folder.matches(props.query));
	let visibleChildren = $derived.by(() => {
		// Check if query is empty
		const query = props.query.toLowerCase().trim();
		if (!query) return props.folder.children;

		// Filter children by query
		return props.folder.children.filter((child) => child.matches(query));
	});
	let visibleContentExists = $derived(visibleChildren.length > 0);

	// Auto-expand when searching and has matches
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

<div class="folder" class:collapsed class:hidden={!visible}>
	<button class="header" onclick={onToggle}>
		<div class="icon chevron">
			<ChevronDown size={16} />
		</div>
		<div class="icon folder-icon">
			<Folder size={14} />
		</div>
		<span class="label">{props.folder.title}</span>
		<span class="count">{props.folder.children.length}</span>
	</button>

	<div class="children">
		{#each visibleChildren as child (child instanceof Bookmark ? child.id : child instanceof BookmarkFolder ? child.id : Math.random())}
			{#if child instanceof Bookmark}
				<BookmarkNode bookmark={child} query={props.query} />
			{:else if child instanceof BookmarkFolder}
				<svelte:self folder={child} query={props.query} />
			{/if}
		{/each}
	</div>
</div>

<style lang="less">
	.folder {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--spacing-xs);
		user-select: none;
		animation: fadeIn var(--transition-normal) ease-out;
		animation-fill-mode: backwards;

		.header {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-lg);
			padding-left: var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: 2px solid var(--accent-orange);
			border-radius: var(--radius-md);
			cursor: pointer;
			transition: background var(--transition-fast);

			.icon {
				display: flex;
				pointer-events: none;

				&.chevron {
					color: var(--accent-orange);
					transition: transform var(--transition-fast);
				}

				&.folder-icon {
					color: var(--accent-orange);
				}
			}

			.label {
				flex: 1;
				color: var(--accent-orange);
				font-size: 12px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.count {
				color: var(--text-muted);
				font-size: 10px;
				padding: 0 var(--spacing-xs);
				background: var(--bg-tertiary);
				border-radius: var(--radius-sm);
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
			transition: max-height var(--transition-normal);
		}

		&.collapsed {
			.header {
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
