import nodemailer from 'nodemailer';
import twilioClient from 'twilio';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { notifications, users } from '../db/schema/index.js';

// ── Transports ───────────────────────────────────────────────────────────────

function getEmailTransporter() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT) || 587;
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;

  if (!host || !user || !pass) {
    return null; // Not configured
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // true for 465, false for other ports
    auth: { user, pass },
  });
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  let from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    return null; // Not configured
  }

  if (!from.startsWith('whatsapp:')) {
    from = `whatsapp:${from}`;
  }

  return {
    client: twilioClient(sid, token),
    from,
  };
}

// ── Notification Core ─────────────────────────────────────────────────────────

/**
 * Creates a notification in the DB and triggers external dispatches (Email/WhatsApp) if config is present.
 */
export async function sendNotification({ userId, title, message, type = 'general' }) {
  const db = getDb();

  // 1. Insert into database
  console.log(`[Notification] Creating in DB for User ${userId}: [${title}] ${message}`);
  const [notif] = await db.insert(notifications).values({
    userId,
    title,
    message,
    type,
    read: false,
  }).returning();

  // 2. Fetch User contact info
  const [user] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId));
  if (!user) return notif;

  // 3. Dispatch Email via Brevo API or SMTP
  const apiKey = process.env.BREVO_API_KEY;
  if (apiKey) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support.heed@gmail.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Heed Support';
    
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: user.email, name: user.name }],
          subject: `AssetFlow Alert: ${title}`,
          textContent: `Hello ${user.name},\n\nThis is an automated alert from AssetFlow:\n\n${message}\n\nBest regards,\nThe ${senderName} Team`
        })
      });
      if (response.ok) {
        console.log('[Email] API Dispatch successful');
      } else {
        const errText = await response.text();
        console.error('[Email] API Dispatch failed:', errText);
      }
    } catch (err) {
      console.error('[Email] API Dispatch failed:', err.message);
    }
  } else {
    const transporter = getEmailTransporter();
    if (transporter) {
      const fromEmail = process.env.BREVO_EMAIL_FROM || 'no-reply@assetflow.com';
      const mailOptions = {
        from: `"AssetFlow Notifications" <${fromEmail}>`,
        to: user.email,
        subject: `AssetFlow Alert: ${title}`,
        text: `Hello ${user.name},\n\nThis is an automated alert from AssetFlow:\n\n${message}\n\nBest regards,\nThe AssetFlow Team`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Dispatch successful: ${info.messageId}`);
      } catch (err) {
        console.error('[Email] Dispatch failed:', err.message);
      }
    } else {
      console.log('[Email] Skip (BREVO_SMTP not fully configured)');
    }
  }

  // 4. Dispatch WhatsApp via Twilio
  const twilio = getTwilioClient();
  let testWhatsAppTo = process.env.TWILIO_WHATSAPP_TO;
  if (twilio && testWhatsAppTo) {
    if (!testWhatsAppTo.startsWith('whatsapp:')) {
      testWhatsAppTo = `whatsapp:${testWhatsAppTo}`;
    }
    const whatsappBody = `*AssetFlow Alert*\n\n*${title}*\n${message}`;

    try {
      const msg = await twilio.client.messages.create({
        body: whatsappBody,
        from: twilio.from,
        to: testWhatsAppTo,
      });
      console.log(`[WhatsApp] Dispatch successful: ${msg.sid}`);
    } catch (err) {
      console.error('[WhatsApp] Dispatch failed:', err.message);
    }
  } else {
    console.log('[WhatsApp] Skip (TWILIO_WHATSAPP not fully configured)');
  }

  return notif;
}

// ── API Service Functions ─────────────────────────────────────────────────────

export async function listUserNotifications(userId, { limit = 50, offset = 0 } = {}) {
  const db = getDb();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(id, userId) {
  const db = getDb();
  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();

  if (!updated) {
    const error = new Error('Notification not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }
  return updated;
}

export async function markAllNotificationsRead(userId) {
  const db = getDb();
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return { success: true };
}
