import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

const headers = {
  'Content-Type': 'application/json',
};

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const response = await fetch(`${BASE_URL}/ask-agent`, {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers,
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
