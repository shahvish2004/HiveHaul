// Email notifications via Resend REST API.
// Gracefully skips all sends if RESEND_API_KEY is not configured — never blocks workflow.

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'HiveHaul <notifications@hivehaul.ca>'
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'shah.vish2004@yahoo.com'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const hasKey = Boolean(RESEND_API_KEY)
  console.log(`[Email] send: hasKey=${hasKey} from="${FROM_EMAIL}" to="${payload.to}" subject="${payload.subject}"`)

  if (!hasKey) {
    console.warn('[Email] Skipped — RESEND_API_KEY is not set or empty')
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    })

    const responseBody = await res.text()
    if (!res.ok) {
      console.error(`[Email] Send failed: status=${res.status} body=${responseBody}`)
    } else {
      console.log(`[Email] Sent OK: status=${res.status} body=${responseBody}`)
    }
  } catch (err) {
    console.error('[Email] Network error:', err)
  }
}

function wrap(content: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
      ${content}
      <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0"/>
      <p style="color:#94a3b8;font-size:12px;margin:0">
        HiveHaul — Transport &amp; Moving Services<br/>
        This is an automated message. Do not reply to this email.
      </p>
    </div>
  `
}

export async function sendCustomerRequestReceived(job: {
  job_number: string
  client_name: string
  client_email: string
  service_type: string
}): Promise<void> {
  console.log(`[Email] sendCustomerRequestReceived: job=${job.job_number} to="${job.client_email}" hasKey=${Boolean(RESEND_API_KEY)}`)
  await sendEmail({
    to: job.client_email,
    subject: `Request Received – ${job.job_number}`,
    html: wrap(`
      <p>Hi ${job.client_name},</p>
      <p>Thank you for submitting your request with HiveHaul. We've received it and will review it shortly.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Job Number</td><td style="font-weight:600">${job.job_number}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Service</td><td>${job.service_type}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Status</td><td>Under Review</td></tr>
      </table>
      <p>You'll hear from us once we've reviewed your request. If you have any questions, please contact us directly.</p>
      <p>— The HiveHaul Team</p>
    `),
  })
}

export async function sendManagerNewJobAlert(job: {
  job_number: string
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  pickup_address: string
  dropoff_address: string
}): Promise<void> {
  console.log(`[Email] sendManagerNewJobAlert: job=${job.job_number} to="${MANAGER_EMAIL}" from="${FROM_EMAIL}" hasKey=${Boolean(RESEND_API_KEY)}`)
  await sendEmail({
    to: MANAGER_EMAIL,
    subject: `New Job Request – ${job.job_number}`,
    html: wrap(`
      <p><strong>A new job request has been submitted.</strong></p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Job</td><td style="font-weight:600">${job.job_number}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Customer</td><td>${job.client_name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Email</td><td>${job.client_email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Phone</td><td>${job.client_phone}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Service</td><td>${job.service_type}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Pickup</td><td>${job.pickup_address}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:14px">Drop-off</td><td>${job.dropoff_address}</td></tr>
      </table>
      <p>Log in to the manager dashboard to review this request.</p>
    `),
  })
}

type StatusMessageFn = (job: { job_number: string; client_name: string }, ext: Record<string, any>) => { subject: string; body: string }

const STATUS_TEMPLATES: Partial<Record<string, StatusMessageFn>> = {
  'Under Review': (job) => ({
    subject: `Your Request Is Under Review – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>Your request <strong>${job.job_number}</strong> is now under review. We'll be in touch shortly with next steps.</p>`,
  }),
  Approved: (job) => ({
    subject: `Request Approved – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>Good news — your request <strong>${job.job_number}</strong> has been approved. We'll reach out soon to confirm the details.</p>`,
  }),
  'Deposit Requested': (job, ext) => ({
    subject: `Deposit Required – ${job.job_number}`,
    body: `
      <p>Hi ${job.client_name},</p>
      <p>A deposit is required to confirm your booking for <strong>${job.job_number}</strong>.</p>
      ${ext.deposit_amount ? `<p><strong>Amount:</strong> $${ext.deposit_amount} CAD</p>` : ''}
      ${ext.deposit_instructions ? `<p><strong>Instructions:</strong><br/>${String(ext.deposit_instructions).replace(/\n/g, '<br/>')}</p>` : ''}
      <p>Please send the deposit at your earliest convenience to confirm your booking.</p>
    `,
  }),
  'Deposit Received': (job) => ({
    subject: `Deposit Confirmed – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>We've confirmed receipt of your deposit for job <strong>${job.job_number}</strong>. We'll contact you shortly to schedule your service.</p>`,
  }),
  Scheduled: (job) => ({
    subject: `Job Scheduled – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>Your HiveHaul service for job <strong>${job.job_number}</strong> has been scheduled. We'll be in touch with the specific date and time details.</p>`,
  }),
  'In Progress': (job) => ({
    subject: `Service In Progress – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>Your HiveHaul service for job <strong>${job.job_number}</strong> is now in progress.</p>`,
  }),
  Completed: (job) => ({
    subject: `Service Completed – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>Your HiveHaul service for job <strong>${job.job_number}</strong> has been completed. Thank you for choosing HiveHaul!</p><p>If you have any questions or feedback, feel free to reach out.</p>`,
  }),
  Cancelled: (job, ext) => ({
    subject: `Job Cancelled – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>Your job <strong>${job.job_number}</strong> has been cancelled.${ext.cancellation_reason ? ` Reason: ${ext.cancellation_reason}` : ''}</p><p>If you have any questions, please contact us directly.</p>`,
  }),
  Declined: (job, ext) => ({
    subject: `Request Declined – ${job.job_number}`,
    body: `<p>Hi ${job.client_name},</p><p>We're sorry, but we're unable to accommodate your request <strong>${job.job_number}</strong> at this time.${ext.decline_reason ? ` Reason: ${ext.decline_reason}` : ''}</p><p>Please contact us if you have any questions or would like to discuss alternatives.</p>`,
  }),
}

export async function sendCustomerStatusNotification(
  job: { job_number: string; client_name: string; client_email: string },
  newStatus: string,
  extendedInfo: Record<string, any> = {}
): Promise<void> {
  console.log(`[Email] sendCustomerStatusNotification: job=${job.job_number} to="${job.client_email}" status="${newStatus}" hasKey=${Boolean(RESEND_API_KEY)}`)

  const templateFn = STATUS_TEMPLATES[newStatus]
  if (!templateFn) {
    console.log(`[Email] No template for status "${newStatus}" — skipping`)
    return
  }

  const { subject, body } = templateFn(job, extendedInfo)
  await sendEmail({
    to: job.client_email,
    subject,
    html: wrap(`${body}<p>— The HiveHaul Team</p>`),
  })
}
