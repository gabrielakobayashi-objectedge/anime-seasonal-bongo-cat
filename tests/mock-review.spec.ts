import { test, expect } from '@playwright/test';
import { generateMockReview } from '../utils/mockReview';

test.describe('generateMockReview', () => {
  test('returns object with reviewer_name, rating, and comment', () => {
    const review = generateMockReview('Naruto');

    expect(review).toHaveProperty('reviewer_name');
    expect(review).toHaveProperty('rating');
    expect(review).toHaveProperty('comment');
  });

  test('reviewer_name is a non-empty string', () => {
    const review = generateMockReview('Bleach');

    expect(typeof review.reviewer_name).toBe('string');
    expect(review.reviewer_name.length).toBeGreaterThan(0);
  });

  test('rating is an integer between 1 and 10 inclusive', () => {
    const review = generateMockReview('One Piece');

    expect(typeof review.rating).toBe('number');
    expect(Number.isInteger(review.rating)).toBe(true);
    expect(review.rating).toBeGreaterThanOrEqual(1);
    expect(review.rating).toBeLessThanOrEqual(10);
  });

  test('comment is a non-empty string', () => {
    const review = generateMockReview('Attack on Titan');

    expect(typeof review.comment).toBe('string');
    expect(review.comment.length).toBeGreaterThan(0);
  });

  test('two calls for the same title produce different output', () => {
    const reviews = Array.from({ length: 10 }, () => generateMockReview('Demon Slayer'));
    const unique = new Set(reviews.map((r) => JSON.stringify(r)));

    expect(unique.size).toBeGreaterThan(1);
  });
});
