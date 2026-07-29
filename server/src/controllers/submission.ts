/**
 *  controller
 */
import { factories } from '@strapi/strapi';
import { cleanupFiles, getFileOptions, getRequestFiles, validateFiles } from '../functions';

export default factories.createCoreController('plugin::api-forms.submission', ({ strapi }) => ({
	async post(ctx) {
		const options = getFileOptions();
		const requestFiles = getRequestFiles(ctx);

		try {
			const { form, referer } = ctx.request.body;
			let { submission } = ctx.request.body;

			if (!form) {
				return ctx.badRequest('No data provided');
			}

			const files = [];

			if (!submission) {
				return ctx.badRequest('Invalid submission data');
			}

			// A multipart request carries every field as a string, so a submission
			// sent alongside an upload arrives JSON encoded and has to be decoded
			// before it is stored. Sending it as JSON keeps working unchanged.
			if (typeof submission === 'string') {
				try {
					submission = JSON.parse(submission);
				} catch {
					return ctx.badRequest('Invalid submission data');
				}
			}

			const strapiForm = await strapi.documents('plugin::api-forms.form').findOne({ documentId: form });

			if (!strapiForm) {
				return ctx.badRequest('Form not found');
			}

			const invalidFiles = validateFiles(requestFiles, options);

			if (invalidFiles) {
				return ctx.badRequest(invalidFiles);
			}

			// Storing is optional. A project that only needs the attachment on the
			// notification email should not keep the applicant's documents in its
			// media library afterwards.
			if (options.store && requestFiles.length > 0) {
				const uploadedFiles = await strapi.plugin('upload').service('upload').upload({
					data: {}, // Optional metadata
					files: requestFiles,
				});

				if (uploadedFiles?.length > 0) {
					files.push(...uploadedFiles); // Store the uploaded file references
				}
			}

			return await strapi.documents('plugin::api-forms.submission').create({
				data: {
					form: {
						connect: form,
					},
					submission: JSON.stringify(submission),
					files: files.map((file) => file.id), // Store only file IDsr
					referer,
				},
				populate: ['form', 'files'],
			});
		} catch (error) {
			strapi.log.error('Submission error:', error);
			return ctx.internalServerError(JSON.stringify(error.message, error.stack));
		} finally {
			// Runs after create(), so the notification lifecycle has already read
			// whatever it needed from these temporary files.
			await cleanupFiles(requestFiles);
		}
	},

	async export(ctx) {
		const { id } = ctx.params;
		return {
			data: await strapi.plugin('api-forms').service('submission').export(id),
			filename: `export-${id}-${Math.random()}.csv`,
		};
	},
}));
