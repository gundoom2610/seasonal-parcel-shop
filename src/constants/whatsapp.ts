// WhatsApp constants for easy configuration
export const WHATSAPP_NUMBER = '628122208580'; // Replace with actual WhatsApp number
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const createWhatsAppUrl = (message: string, imageUrl?: string) => {
  let url = `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
  
  if (imageUrl) {
    url += `&media=${encodeURIComponent(imageUrl)}`;
  }
  
  return url;
};