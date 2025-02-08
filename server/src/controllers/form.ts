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

  async getFormConfig(ctx) {
    try {
      const form = await strapi
        .documents('plugin::api-forms.form')
        .findOne({ documentId: ctx.params.id });

      if (!form || form.steps.length === 0) {
        return ctx.badRequest('No form steps found');
      }

      // Convert layout widths into Tailwind grid classes
      const widthClassMap = {
        12: 'col-span-full',
        8: 'col-span-8',
        6: 'col-span-6',
        4: 'col-span-4',
      };

      // Transform the form data
      const formattedSteps = form.steps.map((step) => {
        const layouts = step.layouts;
        return {
          step: step.id,
          fields: layouts.lg.map((fieldLayout) => {
            const fieldData = fieldLayout.field;

            return {
              name: fieldData.name,
              type: fieldData.type,
              label: fieldData.label,
              placeholder: fieldData.placeholder || '',
              classnames: {
                lg: widthClassMap[fieldLayout.w] || 'col-span-full',
                md:
                  widthClassMap[layouts.md.find((f) => f.i === fieldLayout.i)?.w] ||
                  'col-span-full',
                sm:
                  widthClassMap[layouts.sm.find((f) => f.i === fieldLayout.i)?.w] ||
                  'col-span-full',
              },
              options: fieldData.options || [],
              validation: { required: fieldData.config?.required },
            };
          }),
        };
      });

      if (formattedSteps.length === 1) {
        const fields = formattedSteps.flat().pop();
        delete fields.step;

        return (ctx.body = fields);
      }

      ctx.body = { steps: formattedSteps, count: formattedSteps.length };
    } catch (error) {
      ctx.throw(500, 'Error fetching form configuration', { error });
    }
  },
}));
