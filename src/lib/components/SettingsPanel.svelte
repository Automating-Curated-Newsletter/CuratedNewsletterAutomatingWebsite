<script lang="ts">
	let {
		fields = [] as ReadonlyArray<{ key: string; label: string; group: string }>,
		values = {} as Record<string, string>,
		saved = false,
		onchange = (_key: string, _val: string) => {},
		onsave = () => {},
		onreset = () => {}
	}: {
		fields: ReadonlyArray<{ key: string; label: string; group: string }>;
		values: Record<string, string>;
		saved: boolean;
		onchange: (key: string, val: string) => void;
		onsave: (e: Event) => void;
		onreset: () => void;
	} = $props();
</script>

<aside class="sidebar">
	<h2>Settings</h2>
	<p class="sidebar-subtitle">API credentials & identifiers</p>

	<form onsubmit={onsave}>
		<fieldset>
			<legend>Airtable</legend>
			{#each fields.filter((f) => f.group === 'airtable') as field}
				<label>
					<span>{field.label}</span>
					<input
						type="text"
						name={field.key}
						placeholder={field.key}
						value={values[field.key] ?? ''}
						oninput={(e) => onchange(field.key, (e.currentTarget as HTMLInputElement).value)}
					/>
				</label>
			{/each}
		</fieldset>

		<fieldset>
			<legend>Curated</legend>
			{#each fields.filter((f) => f.group === 'curated') as field}
				<label>
					<span>{field.label}</span>
					<input
						type="text"
						name={field.key}
						placeholder={field.key}
						value={values[field.key] ?? ''}
						oninput={(e) => onchange(field.key, (e.currentTarget as HTMLInputElement).value)}
					/>
				</label>
			{/each}
		</fieldset>

		<div class="actions">
			<button type="submit">Save</button>
			<button type="button" onclick={onreset}>Reset</button>
		</div>
	</form>

	{#if saved}
		<p class="toast">Settings saved to localStorage.</p>
	{/if}
</aside>

<style>
	.sidebar {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	.sidebar h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}
	.sidebar-subtitle {
		font-size: 0.875rem;
		color: #64748b;
		margin-bottom: 1.5rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	fieldset {
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 1rem;
	}
	legend {
		font-weight: 600;
		font-size: 0.875rem;
		padding: 0 0.5rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}
	label:last-child {
		margin-bottom: 0;
	}
	label span {
		font-size: 0.75rem;
		color: #475569;
	}
	input {
		padding: 0.375rem 0.5rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.75rem;
	}
	input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
	}
	.actions {
		display: flex;
		gap: 0.5rem;
	}
	button {
		padding: 0.375rem 1rem;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
	}
	button[type='submit'] {
		background: #3b82f6;
		color: #fff;
	}
	button[type='submit']:hover {
		background: #2563eb;
	}
	button[type='button'] {
		background: #e2e8f0;
		color: #334155;
	}
	button[type='button']:hover {
		background: #cbd5e1;
	}
	.toast {
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: #dcfce7;
		color: #166534;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}
</style>
