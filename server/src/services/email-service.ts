import {
  getFiles,
  getValueFromSubmissionByKey,
  replaceDynamicVariables,
  validateEmail,
} from '../functions';
import {
  FormType,
  NotificationType,
  SubmissionType,
  EmailSubmissionType,
} from '../../../admin/src/utils/types';

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

      const message = replaceDynamicVariables(notification.message, fields);

      const emailAddress = validateEmail(notification.to)
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
        html: message,
      };

      if (submission.files?.length > 0) {
        try {
          const files = await getFiles(submission, providerSettings.provider);
          if (files.length > 0) {
            emailSubmission.attachments = files;
          }
        } catch (error) {
          strapi.log.error('Failed to process file attachments:', error);
        }
      }

      strapi.log.info(`Sending email to ${emailAddress}`);
      await strapi.plugin('email').service('email').send(emailSubmission);

      strapi.log.info('Email sent successfully.');
    } catch (error) {
      strapi.log.error('Email sending failed:', console.dir(error, { depth: null }));
    }
  },
};
