import { api } from './api';

export interface SubscribeResponse {
  ok: boolean;
  alreadySubscribed?: boolean;
  reactivated?: boolean;
}

export const NewsletterService = {
  subscribe(email: string, sourceTag: string = 'footer') {
    return api.post<SubscribeResponse>('/newsletter/subscribe', { email, sourceTag });
  },
};
