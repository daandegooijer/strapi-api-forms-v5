export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'POST',
        path: '/submission/post',
        handler: 'submission.post',
      },
      {
        method: 'GET',
        path: '/form/:id',
        handler: 'form.getFormConfig',
      },
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
      {
        method: 'GET',
        path: '/submissions/export/:id',
        handler: 'submission.export',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
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
      {
        method: 'GET',
        path: '/notifications/:documentId',
        handler: 'notification.findOne',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'PUT',
        path: '/notifications/update/:id',
        handler: 'notification.update',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'POST',
        path: '/notifications/test/:id',
        handler: 'notification.test',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
    ],
  },
};
