// The latest desktop release, read from the updater manifest (latest.json)
// that CI attaches to every GitHub release. It is a plain release download,
// not the GitHub API, so it has no rate limit; Cloudflare caches it for a few
// minutes. Publishing a release on GitHub updates the site with no redeploy.
import { REPO_URL } from '../consts';

const MANIFEST = `${REPO_URL}/releases/latest/download/latest.json`;
const CACHE_SECONDS = 300;

export type DownloadKey = 'windows' | 'windows-msi' | 'linux-appimage' | 'linux-deb';

export interface LatestRelease {
	version: string; // "1.32" (the tag without the v)
	date: string | null; // ISO time the release was built
	notesUrl: string;
	downloads: Record<DownloadKey, string>;
}

// Updater platform key in latest.json for each download. The .deb has no
// updater entry; it sits next to the AppImage with the same name pattern.
const PLATFORM: Record<Exclude<DownloadKey, 'linux-deb'>, string> = {
	windows: 'windows-x86_64-nsis',
	'windows-msi': 'windows-x86_64-msi',
	'linux-appimage': 'linux-x86_64-appimage',
};

interface Manifest {
	version?: string;
	pub_date?: string;
	platforms?: Record<string, { url?: string }>;
}

export async function getLatestRelease(): Promise<LatestRelease | null> {
	try {
		const res = await fetch(MANIFEST, {
			headers: { accept: 'application/json' },
			cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
		} as RequestInit);
		if (!res.ok) return null;
		return parseManifest((await res.json()) as Manifest);
	} catch {
		return null;
	}
}

export function parseManifest(m: Manifest): LatestRelease | null {
	const url = (key: string) => m.platforms?.[key]?.url;
	const exe = url(PLATFORM.windows);
	const msi = url(PLATFORM['windows-msi']);
	const appimage = url(PLATFORM['linux-appimage']);
	if (!exe || !msi || !appimage || !m.version) return null;

	// .../releases/download/v1.32/Sidewinder-Flow-Studio_1.32.0_amd64.AppImage
	const dir = appimage.slice(0, appimage.lastIndexOf('/'));
	const tag = dir.slice(dir.lastIndexOf('/') + 1);
	return {
		version: tag.replace(/^v/, ''),
		date: m.pub_date ?? null,
		notesUrl: `${REPO_URL}/releases/tag/${tag}`,
		downloads: {
			windows: exe,
			'windows-msi': msi,
			'linux-appimage': appimage,
			'linux-deb': `${dir}/Sidewinder-Flow-Studio_${m.version}_amd64.deb`,
		},
	};
}
