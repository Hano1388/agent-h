import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const q = typeof body.q === 'string' ? body.q.trim() : '';

    if (q.length < 5) {
      return NextResponse.json(
        { error: 'Query must be at least 5 characters long' },
        { status: 400 },
      );
    }

    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Search request failed' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
