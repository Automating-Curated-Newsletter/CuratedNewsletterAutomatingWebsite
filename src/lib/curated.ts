export interface LinkData {
	url: string;
	title: string;
	category?: string;
	image?: string;
}

export interface CuratedConfig {
	apiUrl: string;
	token: string;
	publicationId: string;
}

export function getYouTubeVideoId(url: string): string | null {
	try {
		const u = new URL(url);
		const host = u.hostname.replace(/^www\./, '');
		if (host === 'youtube.com' || host === 'm.youtube.com') {
			const v = u.searchParams.get('v');
			if (v) return v;
			const segments = u.pathname.split('/').filter(Boolean);
			if (segments[0] === 'embed' && segments[1]) return segments[1];
		}
		if (host === 'youtu.be') {
			const segments = u.pathname.split('/').filter(Boolean);
			if (segments[0]) return segments[0];
		}
	} catch {
		/* invalid URL */
	}
	return null;
}

export function getYouTubeThumbnail(url: string): string | undefined {
	const videoId = getYouTubeVideoId(url);
	if (videoId) {
		return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
	}
	return undefined;
}

export function convertRecordToLink(record: { fields: Record<string, unknown> }): LinkData {
	const fields = record.fields;
	const url = String(fields['NewURL'] ?? fields['URL'] ?? '');
	const title = String(fields['NewDescription'] ?? fields['Name'] ?? '');
	const rawCategory = fields['TargetCategory'];
	const thumbnail = getYouTubeThumbnail(url);

	const link: LinkData = { url, title };
	if (rawCategory) link.category = String(rawCategory).toLowerCase();
	if (thumbnail) link.image = thumbnail;
	return link;
}

export async function sendLinkToCurated(link: LinkData, config: CuratedConfig): Promise<void> {
	const { apiUrl, token, publicationId } = config;

	if (!apiUrl || !token || !publicationId) {
		throw new Error('Curated API configuration is incomplete.');
	}
	if (!link.url || !link.title) {
		throw new Error('Link must have both a URL and a title.');
	}

	const endpoint = `${apiUrl.replace(/\/+$/, '')}/${publicationId}/links`;

	const params = new URLSearchParams();
	params.set('url', link.url);
	params.set('title', link.title);
	if (link.category) params.set('category', link.category);
	if (link.image) params.set('image', link.image);

	const response = await fetch(`${endpoint}?${params.toString()}`, {
		method: 'POST',
		headers: {
			Authorization: `Token token="${token}"`
		},
		body: null
	});

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(
			`Curated API error: ${response.status} ${response.statusText}.${text ? ` ${text}` : ''}`
		);
	}
}
