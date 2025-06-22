import { Hono } from 'hono';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import { handleWebhookEvent } from './webhooks.service';
import { ApiError } from '../../lib/errors';
import { env } from '../../config';

const webhooks = new Hono();

// This is a public endpoint, but we verify the webhook signature
webhooks.post('/clerk', async (c) => {
    const payloadString = await c.req.text();
    const svixHeaders = {
        'svix-id': c.req.header('svix-id')!,
        'svix-timestamp': c.req.header('svix-timestamp')!,
        'svix-signature': c.req.header('svix-signature')!,
    };

    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        throw new ApiError(400, 'Webhook Error: Invalid signature');
    }

    try {
        await handleWebhookEvent(evt);
        return c.json({ success: true });
    } catch (error) {
        console.error('Error handling webhook event:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new ApiError(500, `Webhook handling failed: ${errorMessage}`);
    }
});

export default webhooks; 