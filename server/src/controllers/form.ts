/**
 *  controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::api-forms.form', ({ strapi }) => ({
  async findOne(ctx) {
    const data = await strapi.documents('plugin::api-forms.form').findOne(ctx.params);
    return { data };
  },

  async update(ctx) {
    const { data } = ctx.request.body;
    const { documentId } = ctx.params;
    const response = await strapi.documents('plugin::api-forms.form').update({
      documentId: documentId,
      data,
    });

    return { response };
  },
  async delete(ctx) {
    return await strapi.documents('plugin::api-forms.form').delete(ctx.params);
  },
}));

//   async submissions(ctx) {
//     const { id } = ctx.params;
//     const data = await strapi.service('plugin::api-forms.form')!.findOne(id, {
//       populate: {
//         submissions: { sort: 'createdAt:desc', offset: 0, limit: 999 },
//       },
//       sort: 'createdAt:desc',
//     });
//     return {
//       data: {
//         id: data.id,
//         attributes: (({ id, ...object }) => object)(data),
//       },
//     };
//   },
//   async get(ctx) {
//     const { id } = ctx.params;
//     const data = await strapi.service('plugin::api-forms.form')!.findOne(id, { populate: '*' });
//     return {
//       data: {
//         id: data.id,
//         attributes: (({ id, ...object }) => object)(data),
//       },
//     };
//   },
//   async fields(ctx) {
//     const { formId } = ctx.params;
//     const data = await strapi
//       .service('plugin::api-forms.form')!
//       .findOne(formId, { filters: { active: { $eq: true } } });
//     if (!data.active) {
//       return { data: { fields: null } };
//     }
//     return {
//       data: {
//         fields: data.fields,
//       },
//     };
//   },
//   async message(ctx) {
//     const { id } = ctx.params;
//     const data = await strapi.service('plugin::api-forms.form')!.findOne(id);
//     const fields = JSON.parse(data.fields);
//     const message = fields.map((field) => {
//       if (field.type === 'file') {
//         return '';
//       }
//       return (
//         '**' +
//         field.label +
//         '**: **' +
//         field.name +
//         '**<!--rehype:style=font-size: 12px;color: white; background: #4945ff;padding:4px; padding-right: 16px;padding-left: 16px;border-radius: 4px;-->  \n'
//       );
//     });
//     return {
//       data: {
//         message: message.join('\n').toString(),
//       },
//     };
//   },
//   async dashboard(ctx) {
//     const sanitizedQuery = await this.sanitizeQuery(ctx);
//     const data = await strapi.service('plugin::api-forms.form')!.dashboard(sanitizedQuery);
//     return { data: data.results, meta: data.pagination };
//   },
// }));
