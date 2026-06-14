<script lang="ts">
	let {
		loading = false,
		sendingAll = false,
		hasRecords = false,
		sendProgress = null,
		sendToast = null,
		onfetch = () => {},
		onsendall = () => {}
	}: {
		loading: boolean;
		sendingAll: boolean;
		hasRecords: boolean;
		sendProgress: { sent: number; total: number; errors: number } | null;
		sendToast: string | null;
		onfetch: () => void;
		onsendall: () => void;
	} = $props();
</script>

<div class="top-bar">
	<button onclick={onfetch} disabled={loading}>
		{loading ? 'Loading...' : 'Get recent data'}
	</button>
	<button class="send-btn" onclick={onsendall} disabled={sendingAll || !hasRecords}>
		{sendingAll ? 'Sending...' : 'Send all to Curated'}
	</button>
	{#if sendProgress}
		<span class="progress-text">
			Sending {sendProgress.sent}/{sendProgress.total}
			{#if sendProgress.errors > 0}
				({sendProgress.errors} failed)
			{/if}
		</span>
	{/if}
	{#if sendToast}
		<p class="toast toast-inline">{sendToast}</p>
	{/if}
</div>

<style>
	.top-bar {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	.top-bar button {
		padding: 0.5rem 1.5rem;
		font-size: 1rem;
		background: #3b82f6;
		color: #fff;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
		cursor: pointer;
	}
	.top-bar button:hover:not(:disabled) {
		background: #2563eb;
	}
	.top-bar button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.send-btn {
		background: #059669;
		color: #fff;
	}
	.send-btn:hover:not(:disabled) {
		background: #047857;
	}
	.progress-text {
		font-size: 0.875rem;
		color: #64748b;
		margin-left: 1rem;
	}
	.toast-inline {
		margin: 0.5rem 0 0 0;
		padding: 0.375rem 0.75rem;
		background: #dcfce7;
		color: #166534;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		display: inline-block;
	}
</style>
