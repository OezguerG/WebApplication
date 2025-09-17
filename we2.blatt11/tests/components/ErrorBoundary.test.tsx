import { render, screen, waitFor } from '@testing-library/react';
import { Bomb } from './Bomb';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../src/components/ErrorBoundary'
import { MemoryRouter } from 'react-router-dom';
import { LoginContextProvider } from '../../src/components/LoginContext.Provider';



test('Fehler wird angezeigt', async () => {

    render(
        <MemoryRouter>
            <LoginContextProvider>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Bomb />
                </ErrorBoundary>
            </LoginContextProvider>
        </MemoryRouter>
    );
    await waitFor(() => {
        const elementsTitel = screen.getAllByText("Caboom", { exact: false });
        expect(elementsTitel.length).toBeGreaterThan(0);
    })

});