// Interest form on /editions/. The only route rendered per request; every
// page is static. Each submission is stored as one JSON value in the INTEREST
// KV namespace, keyed by time so a listing reads in order.
import type { APIRoute } from 'astro';
import { ENTERPRISE_CAPABILITIES } from '../../data/enterprise';

export const prerender = false;

const ALLOWED = new Set<string>(ENTERPRISE_CAPABILITIES.map((c) => c.value));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const THANKS = '/editions/thanks/';

const field = (form: FormData, name: string, max: number) =>
	String(form.get(name) ?? '').trim().slice(0, max);

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
	const reply = (status: number, error?: string) =>
		wantsJson
			? Response.json(error ? { error } : { ok: true }, { status })
			: error
				? new Response(error, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } })
				: redirect(THANKS, 303);

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return reply(400, 'The form could not be read. Please try again.');
	}

	// Honeypot: people leave it empty. Answer as if it worked.
	if (field(form, 'website', 200)) return reply(200);

	const entry = {
		name: field(form, 'name', 200),
		email: field(form, 'email', 320),
		organisation: field(form, 'organisation', 200),
		capabilities: form.getAll('capabilities').map(String).filter((c) => ALLOWED.has(c)),
		notes: field(form, 'notes', 4000),
		submitted_at: new Date().toISOString(),
	};

	if (!entry.name || !entry.organisation) return reply(400, 'Please fill in your name and organisation.');
	if (!EMAIL.test(entry.email)) return reply(400, 'Please enter a valid email address.');

	const kv = locals.runtime?.env?.INTEREST;
	if (!kv) return reply(503, 'The form is not accepting submissions yet. Please try again later.');

	await kv.put(`${entry.submitted_at}_${crypto.randomUUID()}`, JSON.stringify(entry));
	return reply(200);
};

// Anything other than POST (a browser visiting the URL, say) goes to the form.
export const ALL: APIRoute = ({ redirect }) => redirect('/editions/#interest', 303);
