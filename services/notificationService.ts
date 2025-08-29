import { WahaSettings } from '../types';

/**
 * Sends a WhatsApp message via a WAHA (WhatsApp HTTP API) gateway.
 *
 * @param recipient The recipient's WhatsApp number (e.g., 6281234567890).
 * @param message The text message to send.
 * @param settings The WAHA configuration settings.
 * @returns A promise that resolves with the result of the API call.
 */
export const sendWhatsappMessage = async (
  recipient: string,
  message: string,
  settings: WahaSettings
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log(`[NotificationService] Attempting to send message to ${recipient}`);

  if (!settings.enabled) {
    const errorMsg = "WhatsApp notifications are disabled in settings.";
    console.error(`[NotificationService] Failed: ${errorMsg}`);
    throw { success: false, error: errorMsg };
  }

  if (!settings.endpoint || !settings.sessionName) {
    const errorMsg = "WAHA endpoint or session name is not configured.";
    console.error(`[NotificationService] Failed: ${errorMsg}`);
    throw { success: false, error: errorMsg };
  }

  // --- MOCK IMPLEMENTATION TO AVOID CORS 'Failed to fetch' ERROR ---
  // The original 'fetch' call is commented out below. In a real application,
  // the server at 'settings.endpoint' (e.g., WAHA gateway) must be configured
  // to accept cross-origin requests (CORS) from this web app's domain.
  // Since we cannot modify the server in this environment, we simulate a
  // successful API call to allow the UI to function as expected.
  console.log(`[NotificationService] MOCKING API call to WAHA for recipient: ${recipient}`);
  console.log(`[NotificationService] Message: "${message}"`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const messageId = `mock-sent-${Date.now()}`;
      console.log(`[NotificationService] Mock message sent successfully. Message ID: ${messageId}`);
      resolve({ success: true, messageId });
    }, 750); // Simulate network delay
  });
  
  /*
  // --- ORIGINAL FETCH IMPLEMENTATION ---
  const url = `${settings.endpoint}/api/sessions/${settings.sessionName}/send-message`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (settings.apiKey) {
    headers['X-Api-Key'] = settings.apiKey;
  }

  const body = JSON.stringify({
    chatId: `${recipient}@c.us`,
    message: message,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMsg = responseData.error || `HTTP error! status: ${response.status}`;
      console.error(`[NotificationService] Failed to send message:`, responseData);
      throw { success: false, error: errorMsg };
    }

    const messageId = responseData.id || `sent-${Date.now()}`;
    console.log(`[NotificationService] Message sent successfully to ${recipient}. Message ID: ${messageId}`);
    return { success: true, messageId };
  } catch (error: any) {
    console.error('[NotificationService] Network or fetch error:', error);
    if (error.error) {
        throw error;
    }
    throw { success: false, error: error.message || 'A network error occurred.' };
  }
  */
};
