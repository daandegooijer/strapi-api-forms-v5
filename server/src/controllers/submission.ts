/**
 *  controller
 */
//@ts-nocheck

import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::api-forms.submission', ({ strapi }) => ({
  async post(ctx) {
    const { form, submission } = ctx.request.body;
    try {
      const { form, submission } = ctx.request.body;

      if (!form) {
        return ctx.badRequest('No data provided');
      }

      const parsedSubmission = JSON.parse(submission);
      const files = [];

      if (!parsedSubmission) {
        return ctx.badRequest('Invalid submission data');
      }

      // Fetch the form using Strapi 5 syntax
      const strapiForm = await strapi
        .plugin('api-forms')
        .service('form')
        .findOne({ where: { documentId: form } });

      if (!strapiForm) {
        return ctx.badRequest('Form not found');
      }

      // Handle Multiple File Uploads (Strapi 5 format)
      if (ctx.request.files) {
        const uploadedFiles = await strapi
          .plugin('upload')
          .service('upload')
          .upload({
            data: {}, // Optional metadata
            files: Object.values(ctx.request.files).flat(), // Ensure it's an array
          });

        if (uploadedFiles?.length > 0) {
          files.push(...uploadedFiles); // Store the uploaded file references
        }
      }

      // Create Submission in Strapi 5
      return await strapi
        .plugin('api-forms')
        .service('submission')
        .create({
          data: {
            form: {
              connect: form,
            },
            submission: JSON.stringify(parsedSubmission),
            files: files.map((file) => file.id), // Store only file IDs
          },
          populate: ['form', 'files'],
        });
    } catch (error) {
      strapi.log.error('Submission error:', error);
      return ctx.internalServerError('An error occurred while submitting the form');
    }
  },

  async export(ctx) {
    const { id } = ctx.params;
    return {
      data: await  strapi.plugin('api-forms')
        .service('submission').export(id),
      filename: `export-${id}-${Math.random()}.csv`,
    };
  },
}));
