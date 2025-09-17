import { render, screen, waitFor } from '@testing-library/react';
import { gebiete } from '../../src/backend/testdata';
import { themen } from '../../src/backend/testdata';
import * as api from '../../src/backend/api';
import { GebietDescription } from '../../src/components/output/GebietDescription';
import { NavigationContextProvider } from '../../src/components/NavigationContext.Provider';
import { MemoryRouter } from 'react-router-dom';
import { LoginContextProvider } from '../../src/components/LoginContext.Provider';

test('Daten werden angezeigt ohne Themen', async () => {
    const mockGetAlleGebiete = vi.spyOn(api, 'getAlleGebiete').mockResolvedValueOnce(gebiete);
    const mockGetAlleGebiete2 = vi.spyOn(api, 'getAlleThemen').mockResolvedValueOnce(themen);
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <GebietDescription gebiet={gebiete[0]} />
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );
    await waitFor(() => {
        const elementsTitel = screen.getAllByText(gebiete[0].name, { exact: false });
        expect(elementsTitel.length).toBeGreaterThan(0);


        const elementsTitel2 = screen.queryAllByText(themen[0].titel, { exact: false });
        expect(elementsTitel2).toHaveLength(0);
    });

    mockGetAlleGebiete.mockRestore();
    mockGetAlleGebiete2.mockRestore();
});
