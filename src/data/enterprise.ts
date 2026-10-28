// Enterprise capabilities shown on /editions/ and offered in the interest form.
// `value` is what the form submits; keep it stable if the wording changes.
export const ENTERPRISE_CAPABILITIES = [
	{ value: 'sso-roles', title: 'Single sign-on and roles', body: 'sign in with your identity provider; viewers, editors and administrators' },
	{ value: 'scaling', title: 'Scaling across machines', body: 'run many flows and many users concurrently with distributed workers' },
	{ value: 'plugin-bundles', title: 'Curated plugin bundles', body: 'tested, version-pinned environments for machine learning and scientific libraries' },
	{ value: 'ai-catalog', title: 'Data catalog for AI tools', body: 'your tables, profiles and lineage exposed to AI assistants over MCP' },
	{ value: 'support', title: 'Support', body: 'from the people who build it' },
] as const;
