import { getFiles, getRequestFileAttachments, getValueFromSubmissionByKey, replaceDynamicVariables, validateEmail } from '../functions';
import { FormType, NotificationType, SubmissionType, EmailSubmissionType } from '../../../admin/src/utils/types';

/**
 * Strapi 5 Email Notification Service
 */
export default {
	async process(notification: NotificationType, submission: SubmissionType, form: FormType) {
		if (!notification || !submission) {
			strapi.log.error('Missing notification or submission data.');
			return;
		}

		try {
			const providerSettings = await strapi.plugin('email').service('email').getProviderSettings();
			const fields = submission.submission;
			const referer = submission.referer || null;

			const message = replaceDynamicVariables(notification.message, fields);
			let messageWithReferer = message;

			if (process.env.NODE_ENV !== 'production') {
				console.log('Processing email notification:', {
					referer,
					notification,
					submission,
					form,
					providerSettings,
				});
			}

			if (referer && notification.identifier === 'notification') {
				messageWithReferer += `<br><br>Submitted from: <a href="${referer}" target="_blank" rel="noopener noreferrer">${referer}</a>`;
			}

			const emailAddress = providerSettings.overrideEmailAddress
				? providerSettings.overrideEmailAddress
				: validateEmail(notification.to)
					? notification.to
					: getValueFromSubmissionByKey(notification.to, fields);

			if (!emailAddress) {
				strapi.log.error('No valid email address found for sending notification.');
				return;
			}

			const emailSubmission: EmailSubmissionType = {
				to: [emailAddress],
				from: notification.from,
				subject: notification.subject,
				html: messageWithReferer,
			};

			try {
				// Stored uploads are read back from the media library. When storing
				// is off there is nothing to read back, so fall back to the uploads
				// of the request that is being handled right now.
				const files =
					submission.files?.length > 0
						? await getFiles(submission, providerSettings.provider)
						: await getRequestFileAttachments();

				if (files.length > 0) {
					if (providerSettings.provider === 'mailgun') {
						//@ts-ignore
						emailSubmission.attachment = files.map((file) => ({
							filename: file.filename,
							data: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'base64'),
						}));
					} else {
						emailSubmission.attachments = files;
					}
				}
			} catch (error) {
				strapi.log.error('Failed to process file attachments:', error);
			}

			strapi.log.info(`Sending email to ${emailAddress}`);
			await strapi.plugin('email').service('email').send(emailSubmission);

			strapi.log.info('Email sent successfully.');
		} catch (error) {
			strapi.log.error('Email sending failed:', console.dir(error, { depth: null }));
		}
	},
};
