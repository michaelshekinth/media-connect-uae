import { AdminUser } from '../models/AdminUser.js'
import { queueEmail } from './emailService.js'

export async function notifyAdmins(opts: {
  subject: string
  body: string
  templateId?: string
}) {
  const admins = await AdminUser.find()
  const adminUrl = process.env.ADMIN_URL ?? 'https://super-admin-seven-beta.vercel.app'

  await Promise.all(
    admins.map((admin) =>
      queueEmail({
        templateId: opts.templateId ?? 'admin_alert',
        to: admin.email,
        subject: opts.subject,
        body: `${opts.body}\n\nAdmin portal: ${adminUrl}`,
      }),
    ),
  )
}
