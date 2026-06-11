<script lang="ts">
	interface Props {
		windows: number;
		groups: number;
		tabs: number;
	}

	let { windows, groups, tabs }: Props = $props();
</script>

<div class="stats">
	<span class="value">{windows ? windows : ''}</span>
	<span class="label">{windows ? 'window' + (windows > 1 ? 's' : '') : ''}</span>
	<span class="value">{groups ? groups : ''}</span>
	<span class="label">{groups ? 'group' + (groups > 1 ? 's' : '') : ''}</span>
	<span class="value">{tabs ? tabs : ''}</span>
	<span class="label">{tabs ? 'tab' + (tabs > 1 ? 's' : '') : ''}</span>
</div>

<style>
	.stats {
		color: var(--text-muted);
		display: grid;
		grid-template-columns: 30px 46px 30px 46px 30px 46px;
		gap: var(--spacing-xs);

		.value {
			color: var(--text-primary);
			font-weight: 500;
			text-align: right;
		}

		.label {
			text-align: left;
			color: var(--text-muted);
			font-weight: 400;
		}
	}
</style>
