//@ts-nocheck
import fetchInstance from '../utils/fetch';
import { NotificationRequest } from '../utils/types';

const notificationRequests = {
  update: async (id: any, formData?: object): Promise<NotificationRequest> => {
    const data = await fetchInstance(`notifications/update/${id}`, 'PUT', null, formData, true);

    return data.json();
  },
};

export default notificationRequests;
