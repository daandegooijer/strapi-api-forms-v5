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
  async afterCreate(event) {
    const { result, params } = event;

    if (!result.id) {
      throw new ForbiddenError('No form');
    }

    strapi.log.info('afterCreate');

    const defaultEmail =
      await strapi.plugins['email'].services.email.getProviderSettings().settings.defaultFrom;

    const tableRows = result.steps
      .map((step) => {
        if (!step.layouts.lg) {
          return '';
        }

        return step.layouts.lg.map((block) => {
          const { field } = block;

          if (field.type === 'file') {
            return '';
          }

          return `<tr><td><strong>${field.label}</strong></td><td>{{${field.name}}}</td></tr>`;
        });
      })
      .join('');

    const message = `<table>
              <tbody>
           ${tableRows}
              </tbody>
            </table>
                `;
    const notification = await strapi.entityService.create('plugin::api-forms.notification', {
      data: {
        form: result.id,
        enabled: true,
        identifier: 'notification',
        service: 'emailService',
        from: defaultEmail,
        to: defaultEmail,
        message: message,
        subject: `New submission from API form: ${result.title}`,
      },
    });

    const confirmation = await strapi.entityService.create('plugin::api-forms.notification', {
      data: {
        form: result.id,
        enabled: false,
        identifier: 'confirmation',
        service: 'emailService',
        from: defaultEmail,
        to: '',
        subject: `Thank you for your submission on form: ${result.title}`,
        message: message,
      },
    });

    return [confirmation, notification];
  },
};
