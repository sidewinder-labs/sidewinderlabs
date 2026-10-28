type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

// Bindings used by the site (see wrangler.json). Optional so the site still
// builds and serves pages before they are created in Cloudflare.
interface Env {
  /** KV namespace that stores interest-form submissions. */
  INTEREST?: KVNamespace;
}
