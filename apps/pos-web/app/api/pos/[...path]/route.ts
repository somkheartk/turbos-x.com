import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001/api';

type Context = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: Context): Promise<NextResponse> {
  const { path } = await ctx.params;
  const url = `${BACKEND}/pos/${path.join('/')}${req.nextUrl.search}`;

  const init: RequestInit = { method: req.method };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
    init.headers = { 'Content-Type': 'application/json' };
  }

  const upstream = await fetch(url, init);
  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET    = proxy;
export const POST   = proxy;
export const PATCH  = proxy;
export const DELETE = proxy;
