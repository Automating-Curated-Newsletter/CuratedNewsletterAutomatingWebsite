<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import RecordsTable from '$lib/components/RecordsTable.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { convertRecordToLink, sendLinkToCurated, type LinkData } from '$lib/curated';
	import type { AirtableRecord, AirtableResponse } from '$lib/types';

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

	const EXCLUDED_COLUMNS = new Set([
		'ID',
		'Created',
		'Notes',
		'Status',
		'AddedOn',
		'Last Modified',
		'Created By',
		'URL'
	]);

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

	let records = $state<AirtableRecord[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let allFieldKeys = $state<string[]>([]);
	let sendingAll = $state(false);
	let sendProgress = $state<{ sent: number; total: number; errors: number } | null>(null);
	let rowStatus = $state<Record<string, 'idle' | 'success' | 'error'>>({});
	let sendToast = $state<string | null>(null);

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

	async function handleSendAll() {
		const settings = loadSettings();
		const apiUrl = settings['CURATED_API_URL'];
		const token = settings['CURATED_API_TOKEN'];
		const publicationId = settings['CURATED_PUBLICATION_ID'];

		if (!apiUrl || !token || !publicationId) {
			error = 'Fill in all required Curated settings first.';
			return;
		}

		const config = { apiUrl, token, publicationId };
		const links: LinkData[] = records.map((r) => convertRecordToLink(r));

		sendingAll = true;
		sendProgress = { sent: 0, total: links.length, errors: 0 };
		sendToast = null;
		rowStatus = {};
		error = null;

		for (let i = 0; i < links.length; i++) {
			const id = records[i].id;
			try {
				await sendLinkToCurated(links[i], config);
				rowStatus[id] = 'success';
				sendProgress = { ...sendProgress, sent: sendProgress.sent + 1 };
			} catch {
				rowStatus[id] = 'error';
				sendProgress = {
					...sendProgress,
					sent: sendProgress.sent + 1,
					errors: sendProgress.errors + 1
				};
			}
		}

		sendingAll = false;
		const total = sendProgress.total;
		const errs = sendProgress.errors;
		if (errs === 0) {
			sendToast = `All ${total} links sent successfully.`;
		} else {
			sendToast = `${total - errs}/${total} sent. ${errs} failed.`;
		}
		setTimeout(() => (sendToast = null), 4000);
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

<svelte:head>
	<title>CuratedNewsletterAutomatingWebsite</title>
	<meta name="description" content="Automated curation for newsletters — streamlined and simple." />
</svelte:head>

<TopBar
	{loading}
	{sendingAll}
	hasRecords={records.length > 0}
	{sendProgress}
	{sendToast}
	onfetch={fetchData}
	onsendall={handleSendAll}
/>

<div class="layout">
	<main>
		{#if error}
			<p class="error-message">{error}</p>
		{:else if loading}
			<p class="status">Fetching data...</p>
		{:else}
			<RecordsTable {records} {allFieldKeys} {rowStatus} />
		{/if}
	</main>

	<SettingsPanel
		{fields}
		{values}
		{saved}
		onchange={setValue}
		onsave={handleSubmit}
		onreset={handleReset}
	/>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 2rem;
		align-items: start;
	}
	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	.status {
		text-align: center;
		color: #64748b;
		padding: 2rem 0;
	}
</style>
