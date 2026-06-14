export interface AirtableRecord {
	id: string;
	createdTime: string;
	fields: Record<string, unknown>;
}

export interface AirtableResponse {
	records: AirtableRecord[];
}
