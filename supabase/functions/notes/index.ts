import { createHandler } from './handler.js'

Deno.serve(createHandler({
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  turnstileSecret: Deno.env.get('TURNSTILE_SECRET_KEY'),
  devTurnstileSecret: Deno.env.get('TURNSTILE_DEV_SECRET_KEY'),
  origins: Deno.env.get('ALLOWED_ORIGINS'),
  hostnames: Deno.env.get('TURNSTILE_HOSTNAMES'),
}))
