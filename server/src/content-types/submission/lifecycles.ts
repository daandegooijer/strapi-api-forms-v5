const { ForbiddenError } = require('@strapi/utils').errors;

export default {
  async beforeCreate(event) {
    const { result, params } = event;

    if (!params.data.submission) {
      throw new ForbiddenError('No submission');
    }

    const submission = JSON.parse(params.data.submission);

    if ('honeypot' in submission && submission.honeypot !== '') {
      throw new ForbiddenError('Honeypot filled');
    }

    delete submission.honeypot;

    params.data.submission = JSON.stringify(submission);

    return;
  },

  async afterCreate(event) {
    const { result, params } = event;

    if (!result) {
      throw new ForbiddenError('No submission');
    }

    const form = await strapi.entityService.findOne('plugin::api-forms.form', params.data.form, {
      populate: { notifications: true, files: true },
    });

    if (!form || !form.notifications) {
      return;
    }

    //@ts-ignore
    const enabledNotifications = form.notifications.filter((handler) => handler.enabled);

    if (!enabledNotifications) {
      return;
    }

    enabledNotifications.forEach(async (handler) => {
      if (!handler.service) {
        return;
      }

      const response = await strapi
        .plugin('api-forms')
        .service('notification')
        .process(handler, result, form);

      return {
        ...response,
        handler,
        result: 'success',
      };
    });
  },
};
