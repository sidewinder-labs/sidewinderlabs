// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// Static output: every page is prerendered and served by Cloudflare as a file.
// The only code that runs per request is the interest form endpoint
// (src/pages/api/interest.ts, prerender = false).
export default defineConfig({
	site: "https://sidewinderlabs.dev",
	output: "static",
	// /download/ is rendered per request, so the sitemap is told about it.
	integrations: [mdx(), sitemap({ customPages: ["https://sidewinderlabs.dev/download/"] })],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
