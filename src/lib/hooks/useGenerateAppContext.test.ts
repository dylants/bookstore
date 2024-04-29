/**
 * @jest-environment jsdom
 */

import useGenerateAppContext from '@/lib/hooks/useGenerateAppContext';
import { renderHook, waitFor } from '@testing-library/react';

const mockGetFormats = jest.fn();
jest.mock('../actions/format', () => ({
  getFormats: (...args: unknown[]) => mockGetFormats(...args),
}));
const mockGetGenres = jest.fn();
jest.mock('../actions/genre', () => ({
  getGenres: (...args: unknown[]) => mockGetGenres(...args),
}));
const mockGetInventoryAdjustmentReasons = jest.fn();
jest.mock('../inventory-adjustment/reason', () => ({
  getInventoryAdjustmentReasons: (...args: unknown[]) =>
    mockGetInventoryAdjustmentReasons(...args),
}));

describe('useGenerateAppContext', () => {
  it('perform correctly', async () => {
    const FORMATS = ['format1', 'format2'];
    const GENRES = ['genre1', 'genre2'];
    const REASONS = ['reason1', 'reason2'];

    mockGetFormats.mockResolvedValue(FORMATS);
    mockGetGenres.mockResolvedValue(GENRES);
    mockGetInventoryAdjustmentReasons.mockResolvedValue(REASONS);

    const { result } = renderHook(() => useGenerateAppContext());

    // initially null on first render
    expect(result.current).toEqual(null);

    // after async completes, is populated with context
    await waitFor(() => {
      expect(result.current).toEqual({
        formats: FORMATS,
        genres: GENRES,
        inventoryAdjustmentReasons: REASONS,
      });
    });
  });
});
