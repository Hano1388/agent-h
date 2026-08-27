import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app';

const { runAgentMock } = vi.hoisted(() => ({
  runAgentMock: vi.fn(),
}));

vi.mock('@/searchAgent/runAgent', () => ({
  runAgent: runAgentMock,
}));

describe('POST /search', () => {
  beforeEach(() => {
    runAgentMock.mockReset();
  });

  it('returns 200 with agent answer for valid input', async () => {
    runAgentMock.mockResolvedValue({
      answer: 'Here are some colleges.',
      sources: ['https://example.com/colleges'],
      mode: 'web',
    });

    const app = createApp();
    const response = await request(app)
      .post('/search')
      .send({ q: 'Top 10 colleges in Kurdistan' })
      .expect(200);

    expect(response.body).toEqual({
      answer: 'Here are some colleges.',
      sources: ['https://example.com/colleges'],
      mode: 'web',
    });
    expect(runAgentMock).toHaveBeenCalledWith({ q: 'Top 10 colleges in Kurdistan' });
  });

  it('returns 500 when query is too short', async () => {
    const app = createApp();
    const response = await request(app).post('/search').send({ q: 'hi' }).expect(500);

    expect(response.body.error).toContain('at least 5 characters');
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('returns 500 when the agent throws', async () => {
    runAgentMock.mockRejectedValue(new Error('Agent failed'));

    const app = createApp();
    const response = await request(app)
      .post('/search')
      .send({ q: 'What is TypeScript?' })
      .expect(500);

    expect(response.body.error).toBe('Agent failed');
  });
});
