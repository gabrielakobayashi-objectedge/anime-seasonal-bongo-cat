import { faker } from '@faker-js/faker';

export interface MockReview {
  reviewer_name: string;
  rating: number;
  comment: string;
}

export function generateMockReview(_title: string): MockReview {
  return {
    reviewer_name: faker.internet.username(),
    rating: faker.number.int({ min: 1, max: 10 }),
    comment: faker.lorem.sentence(),
  };
}
