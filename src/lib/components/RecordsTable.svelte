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
</script>

{#if records.length > 0}
	<div class="table-scroll">
		<table>
			<thead>
				<tr>
					{#each allFieldKeys as key}
						<th>{key}</th>
					{/each}
					<th class="col-status">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each records as record}
					<tr>
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
	.status {
		text-align: center;
		color: #64748b;
		padding: 2rem 0;
	}
</style>
