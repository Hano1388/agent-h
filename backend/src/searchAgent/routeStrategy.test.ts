import { describe, expect, it } from 'vitest';
import { routeStrategy, routerStep } from './routeStrategy';

describe('routeStrategy', () => {
  it('routes "top 10" style queries to web', () => {
    expect(routeStrategy('Top 10 colleges in Kurdistan Region of Iraq')).toBe(
      'web',
    );
  });

  it('routes queries mentioning recent years to web', () => {
    expect(routeStrategy('Best laptops released in 2025')).toBe('web');
  });

  it('routes short general knowledge queries to direct', () => {
    expect(routeStrategy('What is HTTP?')).toBe('direct');
  });

  it('routes long queries to web', () => {
    const longQuery = 'a'.repeat(101);
    expect(routeStrategy(longQuery)).toBe('web');
  });
});

describe('routerStep', () => {
  it('returns q and mode from invoke', async () => {
    const result = await routerStep.invoke({
      q: 'Top 10 colleges in Kurdistan',
    });

    expect(result).toEqual({
      q: 'Top 10 colleges in Kurdistan',
      mode: 'web',
    });
  });

  it('throws when query is too short', async () => {
    await expect(routerStep.invoke({ q: 'hi' })).rejects.toThrow();
  });
});
