import { factories } from '@strapi/strapi';

export default factories.createCoreService('plugin::api-forms.notification', ({ strapi }) => ({
  async process(handler: any, submission: any, form: any) {
    if (!handler?.service) {
      strapi.log.error('Handler service is missing or undefined.');
      return { error: 'Handler service is not specified.' };
    }

    const service = strapi.plugin('api-forms').service(handler.service);

    if (!service || typeof service.process !== 'function') {
      strapi.log.error(`Service ${handler.service} not found or invalid.`);
      return { error: `Service ${handler.service} does not exist.` };
    }

    try {
      return await service.process(handler, submission, form);
    } catch (error) {
      strapi.log.error(`Error processing notification in ${handler.service}:`, error);
      return { error: `Failed to process notification: ${error.message}` };
    }
  },
}));
