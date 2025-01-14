const { ForbiddenError } = require('@strapi/utils').errors;

function isJSON(str) {
  try {
    let newJson = JSON.parse(str);
    return (typeof newJson === 'object' && newJson !== str) || false;
  } catch (e) {
    return false;
  }
}

export default {
  async afterUpdate(event) {
    const { result, params } = event;

    if (!result.id) {
      throw new ForbiddenError('No form');
    }

    strapi.log.info('afterCreate');

    const defaultEmail =
      await strapi.plugins['email'].services.email.getProviderSettings().settings.defaultFrom;

    const message = result.steps.map((step) => {
      if (!step.layouts.lg) {
        return '';
      }

      return step.layouts.lg.map((block) => {
        const { field } = block;

        if (field.type === 'file') {
          return '';
        }

        return (
          '**' +
          field.label +
          '**: **' +
          field.name +
          '**<!--rehype:style=font-size: 12px;color: white; background: #4945ff;padding:4px; padding-right: 16px;padding-left: 16px;border-radius: 4px;-->  \n'
        );
      });
    });

    console.log(message);

    // const message = fields.map((field) => {
    //   if (field.type === 'file') {
    //     return '';
    //   }

    //   return (
    //     '**' +
    //     field.label +
    //     '**: **' +
    //     field.name +
    //     '**<!--rehype:style=font-size: 12px;color: white; background: #4945ff;padding:4px; padding-right: 16px;padding-left: 16px;border-radius: 4px;-->  \n'
    //   );
    // });

    // strapi.log.info('messages:');
    // strapi.log.info(message.join('\n').toString());

    // const notification = await strapi.entityService.create('plugin::api-forms.notification', {
    //   data: {
    //     form: result.id,
    //     enabled: true,
    //     identifier: 'notification',
    //     service: 'emailService',
    //     from: defaultEmail,
    //     to: defaultEmail,
    //     message: message.join('\n').toString(),
    //     subject: 'New submission from API form: ' + result.title,
    //   },
    // });

    // const confirmation = await strapi.entityService.create('plugin::api-forms.notification', {
    //   data: {
    //     form: result.id,
    //     enabled: false,
    //     identifier: 'confirmation',
    //     service: 'emailService',
    //     from: defaultEmail,
    //     to: '',
    //     subject: '',
    //     message: message.join('\n').toString(),
    //   },
    // });

    // return [confirmation, notification];
  },
};
