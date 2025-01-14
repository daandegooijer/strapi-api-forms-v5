export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'POST',
        path: '/submission/post',
        handler: 'submission.post',
      },
      // {
      //   method: 'GET',
      //   path: '/fields/:formId',
      //   handler: 'form.fields',
      // },
    ],
  },
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/forms',
        handler: 'form.find',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'GET',
        path: '/submissions',
        handler: 'submission.find',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      //     {
      //       method: 'GET',
      //       path: '/submissions/export/:formId',
      //       handler: 'submission.export',
      //       config: {
      //         policies: ['admin::isAuthenticatedAdmin'],
      //       },
      //     },
      //     {
      //       method: 'GET',
      //       path: '/submission/:id',
      //       handler: 'submission.get',
      //       config: {
      //         policies: ['admin::isAuthenticatedAdmin'],
      //       },
      //     },
      //     {
      //       method: 'GET',
      //       path: '/form/:id/submissions',
      //       handler: 'form.submissions',
      //       config: {
      //         policies: ['admin::isAuthenticatedAdmin'],
      //       },
      //     },
      //     {
      //       method: 'GET',
      //       path: '/form/:id/message',
      //       handler: 'form.message',
      //       config: {
      //         policies: ['admin::isAuthenticatedAdmin'],
      //       },
      //     },
      {
        method: 'POST',
        path: '/forms',
        handler: 'form.create',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'GET',
        path: '/forms/:documentId',
        handler: 'form.findOne',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'PUT',
        path: '/forms/:documentId',
        handler: 'form.update',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'DELETE',
        path: '/forms/:documentId',
        handler: 'form.delete',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      //     {
      //       method: 'PUT',
      //       path: '/notifications/update/:id',
      //       handler: 'notification.updateNotification',
      //       config: {
      //         policies: ['admin::isAuthenticatedAdmin'],
      //       },
      //     },
    ],
  },
};
