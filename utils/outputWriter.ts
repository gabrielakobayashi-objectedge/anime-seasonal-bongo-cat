import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import type { AnimeEntry } from '../pages/NavigationPage';
import type { MockReview } from './mockReview';

export interface AnimeResult extends AnimeEntry {
  mock_user_review: MockReview;
}

export async function writeAnimeResults(outputPath: string, results: AnimeResult[]): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
}
