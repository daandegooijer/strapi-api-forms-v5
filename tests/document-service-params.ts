/**
 * Finds the parameter objects that this plugin hands to the Strapi document
 * service, so a test can hold them against the keys Strapi actually reads.
 *
 * Strapi 5.37 put an allowlist in front of the document service. A parameter it
 * does not recognise is dropped without a warning, which turns a filtered query
 * into an unfiltered one. `where` used to reach the query engine through that
 * gap and stopped doing so on the upgrade.
 */

const DOCUMENT_METHODS = [
	'findOne',
	'findFirst',
	'findMany',
	'create',
	'update',
	'delete',
	'count',
	'publish',
	'unpublish',
	'discardDraft',
];

const BACKSLASH = String.fromCharCode(92);

export interface CallSite {
	method: string;
	keys: string[];
	unresolved: string[];
}

/**
 * Blanks out comments and string bodies so that a colon inside either one is
 * never mistaken for an object key. Lengths are preserved, which keeps every
 * index valid in the original source.
 */
function blankNonCode(source: string): string {
	const out = source.split('');
	let i = 0;

	const blankUntil = (end: number) => {
		for (let j = i; j < end && j < out.length; j++) {
			if (out[j] !== '\n') {
				out[j] = ' ';
			}
		}
		i = end;
	};

	while (i < source.length) {
		const two = source.slice(i, i + 2);

		if (two === '//') {
			const end = source.indexOf('\n', i);
			blankUntil(end === -1 ? source.length : end);
			continue;
		}

		if (two === '/*') {
			const end = source.indexOf('*/', i + 2);
			blankUntil(end === -1 ? source.length : end + 2);
			continue;
		}

		const char = source[i];

		if (char === '"' || char === "'" || char === '`') {
			// An escaped character inside a string cannot end it.
			let j = i + 1;
			while (j < source.length && source[j] !== char) {
				j += source[j] === BACKSLASH ? 2 : 1;
			}
			blankUntil(Math.min(j + 1, source.length));
			continue;
		}

		i++;
	}

	return out.join('');
}

/** Index of the bracket closing the one at `open`, or -1. */
function matchBracket(code: string, open: number): number {
	const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
	const closer = pairs[code[open]];
	let depth = 0;

	for (let i = open; i < code.length; i++) {
		if (code[i] === code[open]) {
			depth++;
		} else if (code[i] === closer) {
			depth--;
			if (depth === 0) {
				return i;
			}
		}
	}

	return -1;
}

/** The entries of an object literal, split on the commas that separate them. */
function splitEntries(inner: string): string[] {
	const entries: string[] = [];
	let depth = 0;
	let start = 0;

	for (let i = 0; i < inner.length; i++) {
		const char = inner[i];

		if (char === '{' || char === '[' || char === '(') {
			depth++;
		} else if (char === '}' || char === ']' || char === ')') {
			depth--;
		} else if (char === ',' && depth === 0) {
			entries.push(inner.slice(start, i));
			start = i + 1;
		}
	}

	entries.push(inner.slice(start));

	return entries.map((entry) => entry.trim()).filter(Boolean);
}

/** The keys and the spread identifiers directly inside an object literal. */
function readObjectLiteral(code: string, open: number): { keys: string[]; spreads: string[] } {
	const close = matchBracket(code, open);
	const keys: string[] = [];
	const spreads: string[] = [];

	if (close === -1) {
		return { keys, spreads };
	}

	for (const entry of splitEntries(code.slice(open + 1, close))) {
		const spread = /^\.\.\.([A-Za-z_$][\w$]*)$/.exec(entry);

		if (spread) {
			spreads.push(spread[1]);
			continue;
		}

		// A key is written out, given in shorthand, or computed. A computed or a
		// quoted one cannot be read statically, and there are none of those here.
		const written = /^([A-Za-z_$][\w$]*)\s*:/.exec(entry);
		const shorthand = /^([A-Za-z_$][\w$]*)$/.exec(entry);

		if (written) {
			keys.push(written[1]);
		} else if (shorthand) {
			keys.push(shorthand[1]);
		}
	}

	return { keys, spreads };
}

/** Top-level keys of `const <name> = { ... }` in the same file. */
function resolveObjectVariable(code: string, name: string): { keys: string[]; spreads: string[] } | null {
	const declaration = new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*(?::[^=]+)?=\\s*\\{`).exec(code);

	if (!declaration) {
		return null;
	}

	return readObjectLiteral(code, declaration.index + declaration[0].length - 1);
}

/**
 * Every document service call in `source`, with the parameter keys it passes.
 * Keys reached through a spread or through a variable are resolved within the
 * same file; anything else is reported as unresolved rather than assumed safe.
 */
export function findDocumentServiceCalls(source: string): CallSite[] {
	const code = blankNonCode(source);
	const calls: CallSite[] = [];
	const marker = '.documents(';
	const methodCall = new RegExp(`^\\s*\\.\\s*(${DOCUMENT_METHODS.join('|')})\\s*\\(`);

	for (let at = code.indexOf(marker); at !== -1; at = code.indexOf(marker, at + 1)) {
		const uidClose = matchBracket(code, at + marker.length - 1);

		if (uidClose === -1) {
			continue;
		}

		const call = methodCall.exec(code.slice(uidClose + 1));

		if (!call) {
			continue;
		}

		const argOpen = uidClose + 1 + call[0].length - 1;
		const keys: string[] = [];
		const unresolved: string[] = [];
		const pending: string[] = [];
		const argument = /^\s*(\{|[A-Za-z_$][\w$]*)/.exec(code.slice(argOpen + 1));

		if (!argument) {
			// No argument at all, or one this scanner cannot read, such as a member
			// expression. Report it so that it is a decision rather than an oversight.
			if (!/^\s*\)/.test(code.slice(argOpen + 1))) {
				unresolved.push(code.slice(argOpen + 1, argOpen + 41).trim());
			}
		} else if (argument[1] === '{') {
			const literal = readObjectLiteral(code, argOpen + argument[0].length);
			keys.push(...literal.keys);
			pending.push(...literal.spreads);
		} else {
			pending.push(argument[1]);
		}

		while (pending.length > 0) {
			const name = pending.shift() as string;
			const resolved = resolveObjectVariable(code, name);

			if (!resolved) {
				unresolved.push(name);
				continue;
			}

			keys.push(...resolved.keys);
			pending.push(...resolved.spreads);
		}

		calls.push({ method: call[1], keys, unresolved });
	}

	return calls;
}
