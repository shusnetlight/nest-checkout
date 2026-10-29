// Vercel serverless function: forwards feedback from the overview board to Slack.
// The webhook URL stays server-side (env var SLACK_FEEDBACK_WEBHOOK_URL) so it can't be scraped from the client.

const MAX_LENGTH = 2000

interface FeedbackBody {
  message?: unknown
  nest?: unknown
  sessionId?: unknown
}

function str(value: unknown, max = 100): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request): Promise<Response> {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL
  if (!webhookUrl) {
    return Response.json({ error: 'Feedback is not configured' }, { status: 500 })
  }

  let body: FeedbackBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = str(body.message, MAX_LENGTH)
  if (!message) {
    return Response.json({ error: 'Message is required' }, { status: 400 })
  }

  // Feedback is anonymous by design — no name is collected or forwarded
  const nest = str(body.nest) || 'Unknown nest'
  const sessionId = str(body.sessionId, 20)

  // Workflow Builder webhooks (/triggers/) expect flat text variables;
  // classic incoming webhooks (/services/) expect a message payload.
  const isWorkflowTrigger = webhookUrl.includes('/triggers/')
  const payload = isWorkflowTrigger
    ? { message, nest, session: sessionId || '-' }
    : {
        text: 'New Nest Checkout feedback',
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: '💬 New Nest Checkout feedback' } },
          { type: 'section', text: { type: 'plain_text', text: message } },
          {
            type: 'context',
            elements: [{ type: 'mrkdwn', text: `*Nest:* ${nest}${sessionId ? `  ·  *Session:* ${sessionId}` : ''}` }],
          },
        ],
      }

  const slackRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!slackRes.ok) {
    return Response.json({ error: 'Could not deliver feedback' }, { status: 502 })
  }
  return Response.json({ ok: true })
}
