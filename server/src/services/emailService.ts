import { EmailLog } from '../models/EmailLog.js'
import { newId } from '../utils/id.js'

export async function queueEmail(opts: {
  templateId?: string
  to: string
  subject: string
  body: string
  payload?: Record<string, unknown>
}) {
  const log = await EmailLog.create({
    logId: newId('email_'),
    templateId: opts.templateId ?? '',
    to: opts.to,
    subject: opts.subject,
    body: opts.body,
    payload: opts.payload ?? {},
    status: 'queued',
  })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    await EmailLog.updateOne({ logId: log.logId }, { status: 'skipped', error: 'No RESEND_API_KEY' })
    return { sent: false, logId: log.logId }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'MediaConnect UAE <onboarding@resend.dev>',
        to: opts.to,
        subject: opts.subject,
        html: opts.body.replace(/\n/g, '<br>'),
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      await EmailLog.updateOne({ logId: log.logId }, { status: 'failed', error: err })
      return { sent: false, logId: log.logId }
    }
    await EmailLog.updateOne(
      { logId: log.logId },
      { status: 'sent', sentAt: new Date().toISOString() },
    )
    return { sent: true, logId: log.logId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'send failed'
    await EmailLog.updateOne({ logId: log.logId }, { status: 'failed', error: msg })
    return { sent: false, logId: log.logId }
  }
}

export function renderTemplate(body: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v),
    body,
  )
}
