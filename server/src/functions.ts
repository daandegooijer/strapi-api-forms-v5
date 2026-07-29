import { readFile, unlink } from 'fs/promises';
import { SubmissionType } from '../../admin/src/utils/types';

const DEFAULT_FILE_OPTIONS = {
	store: true,
	maxFiles: 3,
	maxFileSize: 10 * 1024 * 1024,
	allowedMimeTypes: [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.oasis.opendocument.text',
		'application/rtf',
		'text/rtf',
		'image/jpeg',
		'image/png',
	],
};

/**
 * File options for this project, merged over the defaults so a project only has
 * to declare what it actually changes.
 */
function getFileOptions(): typeof DEFAULT_FILE_OPTIONS {
	const configured = (strapi.plugin('api-forms').config('files') ?? {}) as Partial<typeof DEFAULT_FILE_OPTIONS>;

	return { ...DEFAULT_FILE_OPTIONS, ...configured };
}

/**
 * Formidable renamed its file properties between major versions, so read both
 * spellings rather than assume which one the host Strapi ships.
 */
function getFileName(file: any): string {
	return file.originalFilename ?? file.name ?? 'attachment';
}

function getFilePath(file: any): string {
	return file.filepath ?? file.path;
}

function getFileType(file: any): string {
	return file.mimetype ?? file.type ?? '';
}

/**
 * Uploads are keyed by field name and each key holds either one file or an
 * array of them, so flatten before doing anything else.
 */
function getRequestFiles(ctx: any): any[] {
	return Object.values(ctx?.request?.files ?? {})
		.flat()
		.filter(Boolean);
}

/**
 * Returns the reason an upload is unacceptable, or null when it is fine.
 */
function validateFiles(files: any[], options = getFileOptions()): string | null {
	if (files.length > options.maxFiles) {
		return `A maximum of ${options.maxFiles} file(s) can be uploaded.`;
	}

	for (const file of files) {
		if (file.size > options.maxFileSize) {
			return `${getFileName(file)} exceeds the maximum size of ${Math.round(options.maxFileSize / (1024 * 1024))}MB.`;
		}

		if (!options.allowedMimeTypes.includes(getFileType(file))) {
			return `${getFileName(file)} has file type ${getFileType(file)}, which is not allowed.`;
		}
	}

	return null;
}

/**
 * Read the uploads of the request that is being handled right now. Used when
 * files are not stored, because then the media library holds nothing to read
 * back and the notification runs from a lifecycle without its own reference to
 * the request.
 */
async function getRequestFileAttachments(): Promise<any[]> {
	const files = getRequestFiles(strapi.requestContext?.get());

	return Promise.all(
		files.map(async (file) => ({
			filename: getFileName(file),
			content: await readFile(getFilePath(file)),
		}))
	);
}

/**
 * Drop the temporary uploads. The upload service cleans up what it consumed,
 * so this only matters when storing is off, but it stays safe either way.
 */
async function cleanupFiles(files: any[]): Promise<void> {
	await Promise.all(
		files.map(async (file) => {
			try {
				await unlink(getFilePath(file));
			} catch {
				// Already gone, which is the outcome we wanted.
			}
		})
	);
}

/**
 * Validate email format
 */
function validateEmail(emails: string): boolean {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emails.split(',').every((email) => emailPattern.test(email.trim()));
}

/**
 * Retrieve value from submission fields
 */
function getValueFromSubmissionByKey(key: string, submission: any): string {
	return submission[key] ?? '-';
}

/**
 * Replace placeholders in the email template
 */
function replaceDynamicVariables(message: string, submission: any): string {
	return message.replace(/{{(.*?)}}/g, (_, key) => {
		return submission[key] ?? '-';
	});
}

/**
 * Process file attachments for email
 */
async function getFiles(submission: SubmissionType, provider: string): Promise<any[]> {
	return Promise.all(
		submission.files.map(async (file) => {
			const isAbsoluteUrl = /^(https?:\/\/)/.test(file.url);
			const fileUrl = isAbsoluteUrl ? file.url : `${strapi.config.get('server.url')}${file.url}`;

			if (provider === 'mailgun') {
				try {
					const response = await fetch(fileUrl);
					const buffer = await response.arrayBuffer();
					return {
						filename: file.name,
						content: Buffer.from(buffer),
					};
				} catch (error) {
					strapi.log.error(`Failed to fetch file: ${fileUrl}`, error);
					return null;
				}
			} else {
				return { filename: file.name, path: fileUrl };
			}
		})
	).then((files) => files.filter(Boolean)); // Remove failed file fetches
}

function generateNotificationHtml(result, settings) {
	const tableRows = result.steps
		.map((step) => {
			if (!step.layouts.lg) return '';
			return step.layouts.lg
				.map((block) => {
					const { field } = block;
					if (field.type === 'file') return '';
					return `<tr><td><strong>${field.label}</strong></td><td>{{${field.name}}}</td></tr>`;
				})
				.join('');
		})
		.join('');

	const colorBg = settings?.htmlBgColor ?? '#FFFFFF';

	const htmlWithSubmission =
		settings && settings?.html
			? settings?.html?.replace(
					/(<td[^>]+contenteditable="false"[^>]*>)([\s\S]*?)(<\/td>)/i,
					`$1<table width="600" cellpadding="0" cellspacing="0"><tbody>${tableRows}</tbody></table>$3`
				)
			: `<table width="600" cellpadding="0" cellspacing="0"><tbody>${tableRows}</tbody></table>`;

	return `<body style="margin:0; padding:0; background-color: ${colorBg};" bgcolor="${colorBg}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colorBg}" style="background-color: ${colorBg}; width: 100%;">
      <tr>
        <td align="center">
          ${htmlWithSubmission}
        </td>
      </tr>
    </table>
  </body>`;
}

export {
	validateEmail,
	getValueFromSubmissionByKey,
	replaceDynamicVariables,
	getFiles,
	generateNotificationHtml,
	getFileOptions,
	getRequestFiles,
	validateFiles,
	getRequestFileAttachments,
	cleanupFiles,
};
