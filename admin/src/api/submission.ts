//@ts-nocheck
import fetchInstance from '../utils/fetch';
import { SubmissionResponse, SubmissionsResponse } from '../utils/types';
import { stringify } from 'qs';

const submissionRequests = {
  getSubmissions: async (token: string, queryFilter?: object): Promise<SubmissionsResponse> => {
    const data = await fetchInstance(
      `submissions?${stringify({ pagination: { page: queryFilter.page, pageSize: queryFilter.pageSize } })}`,
      token,
      'GET',
      null,

      null,
      true
    );
  },

  getSubmission: async (token: string, id: string): Promise<SubmissionResponse> => {
    const data = await fetchInstance(`submission/${id}`, token, 'GET', null, null, true);

    return data.json();
  },
};

export default submissionRequests;
