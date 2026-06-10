<svelte:head>
	<title>CuratedNewsletterAutomatingWebsite</title>
	<meta name="description" content="Automated curation for newsletters — streamlined and simple." />
</svelte:head>

<script lang="ts">
	const fields = [
		{ key: 'AIRTABLE_API_ACCESS_TOKEN', label: 'Airtable API Access Token', group: 'airtable' },
		{ key: 'AIRTABLE_API_URL', label: 'Airtable API URL', group: 'airtable' },
		{ key: 'AIRTABLE_BASE_ID', label: 'Airtable Base ID', group: 'airtable' },
		{ key: 'AIRTABLE_TABLE_NAME', label: 'Airtable Table Name', group: 'airtable' },
		{ key: 'AIRTABLE_VIEW_ID', label: 'Airtable View ID', group: 'airtable' },
		{ key: 'CURATED_API_TOKEN', label: 'Curated API Token', group: 'curated' },
		{ key: 'CURATED_API_URL', label: 'Curated API URL', group: 'curated' },
		{ key: 'CURATED_PUBLICATION_ID', label: 'Curated Publication ID', group: 'curated' }
	] as const;

	const STORAGE_KEY = 'curation-settings';

	function loadSettings(): Record<string, string> {
		if (typeof localStorage === 'undefined') return {};
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : {};
		} catch {
			return {};
		}
	}

	let values = $state(loadSettings());
	let saved = $state(false);

	function getValue(key: string): string {
		return values[key] ?? '';
	}

	function setValue(key: string, val: string) {
		values[key] = val;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	function handleReset() {
		values = {};
		localStorage.removeItem(STORAGE_KEY);
		saved = false;
	}
</script>

<div class="layout">
	<main>
		<h1>CuratedNewsletterAutomatingWebsite</h1>
		<p class="subtitle">Automated curation for newsletters — streamlined and simple.</p>

		<hr />

		<p>
			This project is a work-in-progress focused on automating the process of curating
			newsletter content. The goal is to reduce manual effort while maintaining
			high-quality editorial selection.
		</p>

		<p>A full-featured application is in development. Stay tuned for updates.</p>
	</main>

	<aside class="sidebar">
		<h2>Settings</h2>
		<p class="sidebar-subtitle">API credentials & identifiers</p>

		<form onsubmit={handleSubmit}>
			<fieldset>
				<legend>Airtable</legend>
				{#each fields.filter((f) => f.group === 'airtable') as field}
					<label>
						<span>{field.label}</span>
						<input
							type="text"
							name={field.key}
							placeholder={field.key}
							value={getValue(field.key)}
							oninput={(e) => setValue(field.key, e.currentTarget.value)}
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
							value={getValue(field.key)}
							oninput={(e) => setValue(field.key, e.currentTarget.value)}
						/>
					</label>
				{/each}
			</fieldset>

			<div class="actions">
				<button type="submit">Save</button>
				<button type="button" onclick={handleReset}>Reset</button>
			</div>
		</form>

		{#if saved}
			<p class="toast">Settings saved to localStorage.</p>
		{/if}
	</aside>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 2rem;
		align-items: start;
	}
	h1 {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		font-size: 1.125rem;
		color: #64748b;
		margin-bottom: 2rem;
	}
	p {
		margin-bottom: 1rem;
		color: #334155;
	}
	hr {
		border: none;
		border-top: 1px solid #e2e8f0;
		margin: 2rem 0;
	}
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
