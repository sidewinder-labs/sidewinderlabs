// Permanent links to the newest installer, for READMEs and docs:
// /download/windows, /download/windows-msi, /download/linux-appimage,
// /download/linux-deb. Each redirects to the file in the latest GitHub
// release, or to the releases page if the manifest can't be read.
import type { APIRoute } from 'astro';
import { RELEASES_URL } from '../../consts';
import { getLatestRelease, type DownloadKey } from '../../lib/latest-release';

export const prerender = false;

const KEYS = new Set<string>(['windows', 'windows-msi', 'linux-appimage', 'linux-deb']);

export const GET: APIRoute = async ({ params }) => {
	const key = params.file ?? '';
	if (!KEYS.has(key)) return new Response('Not found', { status: 404 });
	const latest = await getLatestRelease();
	const target = latest?.downloads[key as DownloadKey] ?? `${RELEASES_URL}/latest`;
	return new Response(null, {
		status: 302,
		headers: { location: target, 'cache-control': 'public, max-age=300' },
	});
};
