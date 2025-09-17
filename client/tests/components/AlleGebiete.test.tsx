import { render, screen, waitFor } from '@testing-library/react';
import { AlleGebiete } from '../../src/components/AlleGebiete';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../src/components/ErrorBoundary'
import { vi } from 'vitest';
import * as api from '../../src/backend/api';
import { gebiete } from '../../src/backend/testdata';
import { GebietResource } from '../../src/Resources';
import {  MemoryRouter } from 'react-router-dom';
import { LoginContextProvider } from '../../src/components/LoginContext.Provider';
import { NavigationContextProvider } from '../../src/components/NavigationContext.Provider';


test('zeigt Ladezustand, wenn Gebiete noch geladen werden', async () => {

  const mockGetAlleGebiete = vi.spyOn(api, 'getAlleGebiete').mockResolvedValueOnce([] as GebietResource[]);

  render(
    <MemoryRouter >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AlleGebiete />
      </ErrorBoundary>
    </MemoryRouter >
  );

  const elementsTitel = screen.getAllByText('Gebiete werden geladen...', { exact: false });

  expect(elementsTitel.length).toBeGreaterThan(0);

  mockGetAlleGebiete.mockRestore();
});


test('zeigt Gebiete an, wenn sie erfolgreich geladen wurden', async () => {
  const mockGetAlleGebiete = vi.spyOn(api, 'getAlleGebiete').mockResolvedValueOnce(gebiete);

  render(
    <MemoryRouter>
      <LoginContextProvider>
        <NavigationContextProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AlleGebiete />
          </ErrorBoundary>
        </NavigationContextProvider>
      </LoginContextProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    const elementsTitel = screen.getAllByText('Transfiguration', { exact: false });
    const elementsTitel2 = screen.getAllByText('Defense Against the Dark Arts', { exact: false });

    expect(elementsTitel.length).toBeGreaterThan(0);
    expect(elementsTitel2.length).toBeGreaterThan(0);
  });

  mockGetAlleGebiete.mockRestore();
});

test('zeigt Fehlermeldung an, wenn beim Laden ein Fehler auftritt', async () => {
  const mockGetAlleGebiete = vi.spyOn(api, 'getAlleGebiete').mockRejectedValue(new Error("Fehler"));

  render(
    <MemoryRouter>
      <LoginContextProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AlleGebiete />
        </ErrorBoundary>
      </LoginContextProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    const elementsTitel = screen.getAllByText('Fehler', { exact: false });

    expect(elementsTitel.length).toBeGreaterThan(0);
  });

  mockGetAlleGebiete.mockRestore();
});