import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsApp = async (message) => {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: process.env.ADMIN_WHATSAPP_NUMBER,
    body: message
  });
};
