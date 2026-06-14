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

	interface AirtableRecord {
		id: string;
		createdTime: string;
		fields: Record<string, unknown>;
	}

	interface AirtableResponse {
		records: AirtableRecord[];
	}

	const EXCLUDED_COLUMNS = new Set(['ID', 'Created', 'Notes', 'LastModified', 'Status', 'CreatedBy', 'AddedOn']);

	let records = $state<AirtableRecord[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let allFieldKeys = $state<string[]>([]);

	function getAllFieldKeys(recs: AirtableRecord[]): string[] {
		const keySet = new Set<string>();
		for (const r of recs) {
			for (const key of Object.keys(r.fields)) {
				if (!EXCLUDED_COLUMNS.has(key)) {
					keySet.add(key);
				}
			}
		}
		return Array.from(keySet);
	}

	async function fetchData() {
		const settings = loadSettings();
		const token = settings['AIRTABLE_API_ACCESS_TOKEN'];
		const apiUrl = settings['AIRTABLE_API_URL'];
		const baseId = settings['AIRTABLE_BASE_ID'];
		const tableName = settings['AIRTABLE_TABLE_NAME'];
		const viewId = settings['AIRTABLE_VIEW_ID'];

		if (!token || !apiUrl || !baseId || !tableName) {
			error = 'Fill in all required Airtable settings first.';
			return;
		}

		loading = true;
		error = null;

		try {
			const endpoint = `${apiUrl}/${baseId}/${tableName}${viewId ? `?view=${viewId}` : ''}`;
			const response = await fetch(endpoint, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			const data: AirtableResponse = await response.json();
			records = data.records;
			allFieldKeys = getAllFieldKeys(data.records);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
			records = [];
			allFieldKeys = [];
		} finally {
			loading = false;
		}
	}
</script>

<div class="top-bar">
	<button onclick={fetchData} disabled={loading}>
		{loading ? 'Loading...' : 'Get recent data'}
	</button>
</div>

<div class="layout">
	<main>
		{#if error}
			<p class="error-message">{error}</p>
		{:else if loading}
			<p class="status">Fetching data...</p>
		{:else if records.length > 0}
			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							{#each allFieldKeys as key}
								<th>{key}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each records as record}
							<tr>
								{#each allFieldKeys as key}
									<td>{String(record.fields[key] ?? '')}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="status">Press "Get recent data" to fetch records from Airtable.</p>
		{/if}
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
	p {
		margin-bottom: 1rem;
		color: #334155;
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
	.status {
		text-align: center;
		color: #64748b;
		padding: 2rem 0;
	}
	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	.table-scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	th,
	td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
		white-space: nowrap;
	}
	th {
		background: #f8fafc;
		font-weight: 600;
		color: #475569;
		position: sticky;
		top: 0;
	}
	tr:hover {
		background: #f1f5f9;
	}
</style>
