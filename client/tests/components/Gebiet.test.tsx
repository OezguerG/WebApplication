import { render, screen, waitFor } from '@testing-library/react';
import { gebiete, themen } from '../../src/backend/testdata';
import { Gebiet } from '../../src/components/output/Gebiet';
import { GebietResource } from '../../src/Resources';
import * as api from '../../src/backend/api';
import { LoginContextProvider } from '../../src/components/LoginContext.Provider';
import { MemoryRouter } from 'react-router-dom';
import { NavigationContextProvider } from '../../src/components/NavigationContext.Provider';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../src/components/ErrorBoundary'

test('Daten werden angezeigt', async () => {
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Gebiet gebiet={gebiete[0]} />
                    </ErrorBoundary>
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );

    await waitFor(() => {
        const elementsTitel = screen.getAllByText(gebiete[0].name, { exact: false });
        expect(elementsTitel.length).toBeGreaterThan(0);
    });
});

test('Themen werden auch angezeigt', async () => {
    const mockGetAlleGebiete = vi.spyOn(api, 'getAlleGebiete').mockResolvedValueOnce(gebiete);
    const mockGetAlleGebiete2 = vi.spyOn(api, 'getAlleThemen').mockResolvedValueOnce(themen);
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Gebiet gebiet={gebiete[0]} />
                    </ErrorBoundary>
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );
    await waitFor(() => {
        const elementsTitel = screen.getAllByText(gebiete[0].name, { exact: false });
        expect(elementsTitel.length).toBeGreaterThan(0);


        const elementsTitel2 = screen.getAllByText(themen[0].titel, { exact: false });
        expect(elementsTitel2.length).toBeGreaterThan(0);
    });

    mockGetAlleGebiete.mockRestore();
    mockGetAlleGebiete2.mockRestore();
});


test('Daten werden geladen "loading ..."', async () => {
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Gebiet gebiet={gebiete[0]} />
                    </ErrorBoundary>
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );

    const elementsTitel = screen.getAllByText("Keine Themen zu diesem Gebiet gefunden :(", { exact: false });
    expect(elementsTitel.length).toBeGreaterThan(0);

});

test('Keine Themen zu Gebiet gefunden', async () => {
    const gebiet1: GebietResource[] = [
        {
            id: "2321",
            name: "Transfiguration",
            beschreibung: "sehr aufregend",
            public: false,
            closed: true,
            verwalter: "501",
            verwalterName: "Minerva McGonagall",
            createdAt: "01.10.2024"
        }
    ]
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Gebiet gebiet={gebiete[0]} />
                    </ErrorBoundary>
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );

    await waitFor(() => {
        const elementsTitel = screen.getAllByText(gebiet1[0].name, { exact: false });
        expect(elementsTitel.length).toBeGreaterThan(0);
    });
});