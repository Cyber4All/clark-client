import { environment } from '@env/environment';

export const CHATBOT_ROUTE = {
  CHAT() {
    /**
     * Sends a prompt to LLM
     * @method POST
     * @returns a message response from BedRock LLM
     */
    return `${environment.apiURL}/chat`;
  }
};
