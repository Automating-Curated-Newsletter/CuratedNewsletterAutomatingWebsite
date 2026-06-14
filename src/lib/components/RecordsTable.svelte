<script lang="ts">
	import type { AirtableRecord } from '$lib/types';

	let {
		records = [] as AirtableRecord[],
		allFieldKeys = [] as string[],
		rowStatus = {} as Record<string, 'idle' | 'success' | 'error'>
	}: {
		records: AirtableRecord[];
		allFieldKeys: string[];
		rowStatus: Record<string, 'idle' | 'success' | 'error'>;
	} = $props();

	let expandedRows = $state(new Set<string>());

	function toggleRow(id: string) {
		if (expandedRows.has(id)) {
			expandedRows.delete(id);
		} else {
			expandedRows.add(id);
		}
	}
</script>

{#if records.length > 0}
	<div class="table-scroll">
		<table>
			<thead>
				<tr>
					<th class="col-expand"></th>
					{#each allFieldKeys as key}
						<th>{key}</th>
					{/each}
					<th class="col-status">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each records as record}
					<tr>
						<td class="col-expand">
							<button class="expand-btn" onclick={() => toggleRow(record.id)}>
								{expandedRows.has(record.id) ? '▼' : '▶'}
							</button>
						</td>
						{#each allFieldKeys as key}
							<td>
								{#if key === 'Name' && record.fields['URL']}
									<a href={String(record.fields['URL'])} target="_blank" rel="noreferrer">
										{String(record.fields[key] ?? '')}
									</a>
								{:else}
									{String(record.fields[key] ?? '')}
								{/if}
							</td>
						{/each}
						<td class="col-status">
							{#if rowStatus[record.id] === 'success'}
								<span class="badge badge-success">&#10003;</span>
							{:else if rowStatus[record.id] === 'error'}
								<span class="badge badge-error">&#10007;</span>
							{/if}
						</td>
					</tr>
					{#if expandedRows.has(record.id)}
						<tr class="detail-row">
							<td colspan={1 + allFieldKeys.length + 1}>
								<div class="detail-grid">
									<span class="detail-label">URL</span>
									<span class="detail-value">{String(record.fields['URL'] ?? '—')}</span>
									<span class="detail-label">NewURL</span>
									<span class="detail-value">{String(record.fields['NewURL'] ?? '—')}</span>
									<span class="detail-label">Name</span>
									<span class="detail-value">{String(record.fields['Name'] ?? '—')}</span>
									<span class="detail-label">NewDescription</span>
									<span class="detail-value">{String(record.fields['NewDescription'] ?? '—')}</span>
									<span class="detail-label">Notes</span>
									<span class="detail-value">{String(record.fields['Notes'] ?? '—')}</span>
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="status">Press "Get recent data" to fetch records from Airtable.</p>
{/if}

<style>
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
	td a {
		color: #3b82f6;
		text-decoration: none;
	}
	td a:hover {
		text-decoration: underline;
	}
	.col-status {
		text-align: center;
		width: 3rem;
	}
	.badge {
		font-size: 1rem;
		font-weight: 700;
	}
	.badge-success {
		color: #059669;
	}
	.badge-error {
		color: #dc2626;
	}
	.col-expand {
		text-align: center;
		width: 2rem;
		padding: 0;
	}
	.expand-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.75rem;
		padding: 0.375rem;
		color: #94a3b8;
		line-height: 1;
	}
	.expand-btn:hover {
		color: #475569;
	}
	.detail-row td {
		background: #f9fafb;
		padding: 0;
		border-bottom: 1px solid #e2e8f0;
	}
	.detail-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.25rem 1rem;
		padding: 0.75rem 1rem 0.75rem 3rem;
		font-size: 0.8125rem;
	}
	.detail-label {
		font-weight: 600;
		color: #64748b;
		white-space: nowrap;
	}
	.detail-value {
		color: #334155;
		word-break: break-all;
	}
	.status {
		text-align: center;
		color: #64748b;
		padding: 2rem 0;
	}
</style>
