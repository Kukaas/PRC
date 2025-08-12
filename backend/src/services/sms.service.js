import twilio from "twilio";
import { ENV } from "../connections/env.js";

// Initialize Twilio client if credentials are present
let twilioClient = null;
try {
  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
  }
} catch (err) {
  console.error("Twilio init error:", err);
}

const normalizePhilippineNumberToE164 = (raw) => {
  if (!raw) return null;
  let digits = String(raw).trim();

  // Remove spaces, dashes, parentheses
  digits = digits.replace(/[^+\d]/g, "");

  // Already E.164 with +63...
  if (digits.startsWith("+")) return digits;

  // Local 09xxxxxxxxx -> +639xxxxxxxxx
  if (digits.startsWith("09")) {
    return "+63" + digits.slice(1);
  }

  // Local 9xxxxxxxxx -> assume mobile without leading 0
  if (/^9\d{9}$/.test(digits)) {
    return "+63" + digits;
  }

  // 0xxxxxxxxxx (11 digits starting with 0)
  if (/^0\d{10}$/.test(digits)) {
    return "+63" + digits.slice(1);
  }

  // Fallback: if looks like 10-15 digits, just prefix +
  if (/^\d{10,15}$/.test(digits)) {
    return "+" + digits;
  }

  return null;
};

// Convert "HH:MM" 24-hour time to "h:MM AM/PM"; if already includes AM/PM, return as-is
const formatTo12Hour = (timeString) => {
  if (!timeString || /am|pm/i.test(timeString)) return timeString;
  try {
    const [hStr, mStr = '00'] = String(timeString).split(":");
    const hour = parseInt(hStr, 10);
    if (Number.isNaN(hour)) return timeString;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = ((hour % 12) || 12).toString();
    const minutes = mStr.padStart(2, '0');
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

const buildTrainingMessage = ({
  volunteerName,
  trainingDate,
  trainingTime,
  trainingLocation,
  exactLocation,
  notifiedByName,
}) => {
  const formattedDate = new Date(trainingDate).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = formatTo12Hour(trainingTime);
  return [
    `Dear ${volunteerName},`,
    "",
    `This is Philippine Red Cross Marinduque Chapter. You are invited to train at ${trainingLocation}${exactLocation ? `, ${exactLocation}` : ''} on ${formattedDate} at ${formattedTime}.`,
    "",
    "Best regards,",
    `${notifiedByName}`,
  ].join("\n");
};

export const sendTrainingNotificationSMS = async ({
  toPhoneNumber,
  volunteerName,
  trainingDate,
  trainingTime,
  trainingLocation,
  exactLocation,
  notifiedByName,
}) => {
  if (!twilioClient) {
    console.warn("Twilio client not configured. Skipping SMS.");
    return false;
  }

  const to = normalizePhilippineNumberToE164(toPhoneNumber);
  if (!to) {
    console.warn("Invalid recipient phone number for SMS:", toPhoneNumber);
    return false;
  }

  const body = buildTrainingMessage({
    volunteerName,
    trainingDate,
    trainingTime,
    trainingLocation,
    exactLocation,
    notifiedByName,
  });

  const fromNumber = ENV.TWILIO_MESSAGING_SERVICE_SID
    ? undefined
    : (ENV.TWILIO_PHONE_NUMBER || ENV.TWILIO_VIRTUAL_NUMBER);

  try {
    const resp = await twilioClient.messages.create({
      body,
      to,
      ...(ENV.TWILIO_MESSAGING_SERVICE_SID
        ? { messagingServiceSid: ENV.TWILIO_MESSAGING_SERVICE_SID }
        : { from: fromNumber }),
    });
    return !!resp?.sid;
  } catch (error) {
    console.error("Twilio SMS error:", error?.message || error);
    return false;
  }
};

// Optional: WhatsApp via Twilio Sandbox (requires user opt-in)
// Uses ACCOUNT_SID/AUTH_TOKEN from ENV and a WhatsApp from number
// e.g., whatsapp:+14155238886 (sandbox)
export const sendTrainingNotificationWhatsApp = async ({
  toPhoneNumber,
  volunteerName,
  trainingDate,
  trainingTime,
  trainingLocation,
  exactLocation,
  notifiedByName,
  accountSid,
  authToken,
  whatsappFrom,
}) => {
  try {
    // lazy import twilio to avoid dependency if not installed
    const { default: twilio } = await import('twilio');
    const client = twilio(accountSid, authToken);

    const body = buildTrainingMessage({
      volunteerName,
      trainingDate,
      trainingTime,
      trainingLocation,
      exactLocation,
      notifiedByName,
    });

    // Convert recipient to E.164 and to WhatsApp address
    const to = normalizePhilippineNumberToE164(toPhoneNumber);
    if (!to) return false;

    const resp = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${to}`,
      body,
    });
    return !!resp?.sid;
  } catch (err) {
    console.error('WhatsApp send error:', err?.message || err);
    return false;
  }
};

// Generic WhatsApp text sender (Twilio)
export const sendWhatsAppText = async ({
  toPhoneNumber,
  body,
  accountSid,
  authToken,
  whatsappFrom,
}) => {
  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(accountSid, authToken);

    const to = normalizePhilippineNumberToE164(toPhoneNumber);
    if (!to) return false;

    const resp = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${to}`,
      body,
    });
    return !!resp?.sid;
  } catch (err) {
    console.error('WhatsApp generic send error:', err?.message || err);
    return false;
  }
};


