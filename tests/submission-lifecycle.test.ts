import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import lifecycles from '../server/src/content-types/submission/lifecycles';

/**
 * Three forms in the order a table returns them. The first one stands in for the
 * form that used to receive every notification, whichever form was submitted.
 */
const FORMS = [
	{
		id: 1,
		documentId: 'form-one',
		title: 'Aanvraagformulier',
		notifications: [
			{ id: 1, identifier: 'notification', enabled: true, service: 'emailService', to: 'planning@example.test' },
		],
	},
	{
		id: 2,
		documentId: 'form-two',
		title: 'Contact formulier',
		notifications: [{ id: 2, identifier: 'notification', enabled: true, service: 'emailService', to: 'info@example.test' }],
	},
	{
		id: 3,
		documentId: 'form-three',
		title: 'Sollicitatie',
		notifications: [
			{ id: 3, identifier: 'notification', enabled: true, service: 'emailService', to: 'hr@example.test' },
			{ id: 4, identifier: 'confirmation', enabled: false, service: 'emailService', to: 'eMailadres' },
		],
	},
];

/** The parameters Strapi 5.37 keeps. Everything else is dropped in silence. */
const ALLOWED = ['filters', 'sort', 'fields', 'populate', 'status', 'locale', 'page', 'pageSize', 'start', 'limit', '_q'];

type Record_ = (typeof FORMS)[number];

function matches(record: Record_, filters: Record<string, any>): boolean {
	return Object.entries(filters).every(([key, value]) => {
		const actual = (record as any)[key];
		return value !== null && typeof value === 'object' ? actual === value.$eq : actual === value;
	});
}

/**
 * Stands in for the document service, including the part that caused the bug:
 * a parameter outside the allowlist never reaches the query, so a query meant to
 * be filtered returns the first record instead.
 */
function documentService(records: Record_[]) {
	return {
		async findFirst(params: Record<string, any> = {}) {
			const kept = Object.fromEntries(Object.entries(params).filter(([key]) => ALLOWED.includes(key)));
			const filters = kept.filters as Record<string, any> | undefined;
			const candidates = filters ? records.filter((record) => matches(record, filters)) : records;

			return candidates[0] ?? null;
		},
	};
}

interface Handled {
	handler: any;
	form: any;
}

let handled: Handled[];

beforeEach(() => {
	handled = [];

	(globalThis as any).strapi = {
		documents: () => documentService(FORMS),
		plugin: () => ({
			service: () => ({
				async process(handler: any, _submission: any, form: any) {
					handled.push({ handler, form });
					return 'sent';
				},
			}),
		}),
		log: { info: () => {}, error: () => {} },
	};
});

afterEach(() => {
	delete (globalThis as any).strapi;
});

function submissionEvent(formId: number) {
	return {
		result: { id: 99, submission: { voorEnachternaam: 'Test' }, referer: 'https://example.test/vacatures/een-vacature' },
		params: { data: { form: { connect: [{ id: formId }] } } },
	};
}

describe('afterCreate on a submission', () => {
	it('notifies through the form that was submitted', async () => {
		await lifecycles.afterCreate(submissionEvent(3));

		expect(handled).toHaveLength(1);
		expect(handled[0].form.title).toBe('Sollicitatie');
		expect(handled[0].handler.to).toBe('hr@example.test');
	});

	it('does not fall back to the first form', async () => {
		await lifecycles.afterCreate(submissionEvent(2));

		expect(handled.map(({ form }) => form.id)).toEqual([2]);
	});

	it('skips notifications that are turned off', async () => {
		await lifecycles.afterCreate(submissionEvent(3));

		expect(handled.map(({ handler }) => handler.identifier)).toEqual(['notification']);
	});
});

describe('the document service this test stands in for', () => {
	it('ignores a parameter outside the allowlist', async () => {
		// Why the bug was invisible: `where` was accepted by the type checker and
		// by the runtime, and simply never filtered anything.
		const byWhere = await documentService(FORMS).findFirst({ where: { id: 3 } } as any);
		const byFilters = await documentService(FORMS).findFirst({ filters: { id: 3 } });

		expect(byWhere?.id).toBe(1);
		expect(byFilters?.id).toBe(3);
	});
});
