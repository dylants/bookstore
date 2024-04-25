/**
 * @jest-environment jsdom
 */

import AppContext, { AppContextType } from '@/app/AppContext';
import useAppContext from '@/lib/hooks/useAppContext';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

describe('useAppContext', () => {
  it('should return context when it exists', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContext.Provider value={{ foo: 'bar' } as unknown as AppContextType}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current).toEqual({ foo: 'bar' });
  });

  it('should throw error when no context exists', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      renderHook(() => useAppContext()),
    ).toThrowErrorMatchingInlineSnapshot(
      `"useAppContext used outside of provider"`,
    );
  });
});
