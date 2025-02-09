/**
 *  controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::api-forms.form', ({ strapi }) => ({
  async findOne(ctx) {
    const data = await strapi.documents('plugin::api-forms.form').findOne(ctx.params);
    return { data };
  },

  async settings(ctx) {
    return { data: { settings: strapi.config.get('plugin::api-forms') } };
  },
  async generate(ctx) {
    const { data } = ctx.request.body;

    if (!data.prompt || typeof data.prompt !== 'string') {
      return ctx.badRequest('Prompt must be a valid string of text.');
    }

    //@ts-ignore
    const { ai } = strapi.config.get('plugin::api-forms');
    //@ts-ignore
    const { apiEndpoint, apiKey, model, temperature } = ai;

    const systemPrompt = `
        You are a form generator. Your job is to create structured JSON schemas for multi-step forms based on user description.
        Each form must use this structure:
        {
          steps: [{id: number, layouts: {lg: [{i: string, x: number, y: number, w: number, h: number, field: {type: string, label: string, name: string, placeholder: string}}]}}],
          title: string,
          successMessage: string,
          errorMessage: string,
          active: boolean,
          dateFrom: string,
          dateTill: string
        }.
        Use clear keys and valid values for form configuration.
      `;

    if (!apiKey) {
      return ctx.badRequest('OpenAI API key is not configured. Please set it in plugin settings.');
    }

    try {
      // Prepare request to OpenAI API
      const openAIResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: data.prompt,
            },
          ],
          temperature: temperature || 0.7,
        }),
      });

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        //@ts-ignore
        throw new Error(`OpenAI request failed: ${errorData.error.message}`);
      }

      //@ts-ignore
      const { choices } = await openAIResponse.json();
      const aiOutput = choices[0]?.message?.content;
      console.log(aiOutput);

      const generatedFormJson = JSON.parse(aiOutput);

      const validFormState = {
        steps: adjustLayouts(generatedFormJson.steps || []), // Adjust steps,
        title: generatedFormJson.title || 'Untitled Form',
        currentStep: 0,
        successMessage: generatedFormJson.successMessage || 'Form submitted successfully!',
        errorMessage: generatedFormJson.errorMessage || 'Please fix the errors and try again.',
        active: true,
        dateFrom: '',
        dateTill: '',
      };

      if (validFormState.steps.length === 0) {
        throw new Error('No form steps found');
      }

      const form = await strapi
        .documents('plugin::api-forms.form')
        .create({ data: validFormState });

      return ctx.send(form);
    } catch (error) {
      console.error('Error generating form:', error);
      return ctx.internalServerError(
        'Failed to generate the form. Please check the AI key or the prompt format.'
      );
    }
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

const adjustLayouts = (steps: any[]) => {
  return steps.map((step) => {
    const defaultLayouts = {
      lg: [],
      md: [],
      sm: [],
    };

    for (const point of ['lg', 'md', 'sm']) {
      // Use existing layouts or initialize empty array
      defaultLayouts[point] = (step.layouts[point] || step.layouts.breakpoint || []).map(
        (layout) => ({
          ...layout,
          w: 12, // Ensure 'w' is always set to 12
        })
      );
    }

    // Fill in missing breakpoints (if md or sm is empty, copy from lg)
    if (defaultLayouts['md'].length === 0) {
      defaultLayouts['md'] = defaultLayouts['lg'].map((layout) => ({
        ...layout,
        x: 0, // Reset positions for the new breakpoint
        y: 0,
      }));
    }

    if (defaultLayouts['sm'].length === 0) {
      defaultLayouts['sm'] = defaultLayouts['lg'].map((layout) => ({
        ...layout,
        x: 0, // Reset positions for the new breakpoint
        y: 0,
      }));
    }

    return {
      ...step,
      layouts: defaultLayouts, // Replace layouts with updated breakpoints
    };
  });
};
