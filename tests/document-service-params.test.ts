import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as strapiUtils from '@strapi/utils';
import { describe, expect, it } from 'vitest';
import { findDocumentServiceCalls } from './document-service-params';

// Vitest runs from the package root.
const SERVER_SOURCE = join(process.cwd(), 'server', 'src');

/**
 * What the document service reads, taken from Strapi itself when the installed
 * version exposes it. The fallback is the list from Strapi 5.37,
 * ALLOWED_DOCUMENT_ROOT_PARAM_KEYS in
 * @strapi/core/dist/services/document-service/params.js, so that this test also
 * runs against the older @strapi/utils this plugin still declares.
 */
const FALLBACK_KEYS = [
	'filters',
	'sort',
	'fields',
	'populate',
	'status',
	'locale',
	'page',
	'pageSize',
	'start',
	'limit',
	'_q',
	'hasPublishedVersion',
	'withCount',
	'data',
	'pagination',
	'count',
	'ordering',
];

function allowedKeys(): string[] {
	const shared = (strapiUtils as unknown as { SHARED_QUERY_PARAM_KEYS?: string[] }).SHARED_QUERY_PARAM_KEYS;

	const keys = shared ? [...shared, 'withCount', 'data', 'pagination', 'count', 'ordering'] : FALLBACK_KEYS;

	// findOne, update and delete take the document to act on next to the query.
	return [...keys, 'documentId'];
}

function sourceFiles(directory: string): string[] {
	return readdirSync(directory).flatMap((entry) => {
		const path = join(directory, entry);

		if (statSync(path).isDirectory()) {
			return sourceFiles(path);
		}

		return path.endsWith('.ts') ? [path] : [];
	});
}

describe('document service parameters', () => {
	const allowed = allowedKeys();

	it('passes only parameters the document service reads', () => {
		const violations: string[] = [];

		for (const file of sourceFiles(SERVER_SOURCE)) {
			const calls = findDocumentServiceCalls(readFileSync(file, 'utf8'));

			for (const call of calls) {
				for (const key of call.keys) {
					if (!allowed.includes(key)) {
						violations.push(`${relative(SERVER_SOURCE, file)}: ${call.method}({ ${key} })`);
					}
				}
			}
		}

		// A dropped parameter does not raise anything at runtime. A query meant to
		// be filtered simply returns the first row of the table instead.
		expect(violations).toEqual([]);
	});

	it('finds the calls it is meant to guard', () => {
		const calls = sourceFiles(SERVER_SOURCE).flatMap((file) => findDocumentServiceCalls(readFileSync(file, 'utf8')));

		expect(calls.length).toBeGreaterThan(10);
		expect(calls.some((call) => call.keys.includes('filters'))).toBe(true);
	});
});

describe('the scanner behind that guard', () => {
	it('reads the keys of a plain parameter object', () => {
		const calls = findDocumentServiceCalls(`
			await strapi.documents('plugin::api-forms.form').findFirst({
				where: { id: formId },
				populate: ['notifications'],
			});
		`);

		expect(calls).toEqual([{ method: 'findFirst', keys: ['where', 'populate'], unresolved: [] }]);
	});

	it('follows a spread and a variable into the object they name', () => {
		const spread = findDocumentServiceCalls(`
			const searchParams = { status, where: { slug } };
			await strapi.documents(uid).findMany({ ...searchParams, populate });
		`);

		expect(spread[0].keys).toContain('where');

		const variable = findDocumentServiceCalls(`
			let indexData = { sort: {}, start, limit };
			await strapi.documents(contentType).findMany(indexData);
		`);

		expect(variable[0].keys).toEqual(['sort', 'start', 'limit']);
	});

	it('reads the keys of a conditional spread', () => {
		const calls = findDocumentServiceCalls(`
			await strapi.documents(uid).findMany({
				status,
				...(locale && { where: { locale } }),
				populate,
			});
		`);

		expect(calls[0].keys).toEqual(['status', 'where', 'populate']);
	});

	it('reports a spread it cannot read', () => {
		const calls = findDocumentServiceCalls(`await strapi.documents(uid).findMany({ ...params.query });`);

		expect(calls[0].unresolved).toEqual(['...params.query']);
	});

	it('is not thrown off by a regular expression holding a quote', () => {
		// One unhandled pattern used to blank the rest of the file, which took
		// every call after it out of sight and left the guard reporting nothing.
		const calls = findDocumentServiceCalls(`
			const uids = content.replace(/api::([^"]+)/g, (match) => match);
			await strapi.documents(uid).findMany({ where: { slug } });
		`);

		expect(calls).toHaveLength(1);
		expect(calls[0].keys).toEqual(['where']);
	});

	it('still treats a slash after a value as division', () => {
		const calls = findDocumentServiceCalls(`
			const half = total / 2;
			await strapi.documents(uid).findMany({ limit: half, where: { slug } });
		`);

		expect(calls[0].keys).toEqual(['limit', 'where']);
	});

	it('ignores keys that only look like parameters', () => {
		const calls = findDocumentServiceCalls(`
			await strapi.documents(uid).findMany({
				// where: { locale },
				filters: { title: { $contains: 'where: nothing' } },
			});
		`);

		expect(calls[0].keys).toEqual(['filters']);
	});

	it('reports an argument it cannot read instead of passing it', () => {
		const calls = findDocumentServiceCalls(`await strapi.documents(uid).findOne(ctx.params);`);

		expect(calls[0].unresolved).not.toEqual([]);
	});
});
