/**
 *  controller
 */
//@ts-nocheck

import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::api-forms.submission', ({ strapi }) => ({
  async post(ctx) {
    const { form, submission } = ctx.request.body;
    // if (!form) {
    //   return ctx.badRequest('No data');
    // }
    // const parsedSubmission = JSON.parse(submission);
    // const files = [];
    // if (!form && !parsedSubmission) {
    //   return ctx.badRequest('No data');
    // }
    // const strapiForm = await strapi.service('plugin::api-forms.form')!.findOne(form);
    // if (!strapiForm) {
    //   return ctx.badRequest('No form');
    // }
    // if (ctx.request.files) {
    //   await Promise.all(
    //     Object.entries(ctx.request.files).map(async ([key, file]) => {
    //       const uploadedFile = await strapi.service('plugin::api-forms.submission')!.upload(file);
    //       if (uploadedFile) {
    //         files.push(uploadedFile);
    //       }
    //     })
    //   );
    // }
    // const postedSubmission = await strapi.service('plugin::api-forms.submission')!.create({
    //   data: { form, submission: JSON.stringify(parsedSubmission), files },
    //   populate: ['form', 'files'],
    // });
    // return postedSubmission;
  },

  async export(ctx) {
    // const { formId } = ctx.params;
    // return {
    //   data: await strapi.service('plugin::api-forms.submission')!.export(formId),
    //   filename: `export-${formId}-${Math.random()}.csv`,
    // };
  },
}));
