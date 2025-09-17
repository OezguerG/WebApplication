import { render, screen } from '@testing-library/react';
import { themen } from '../../src/backend/testdata';
import { Thema } from '../../src/components/output/Thema';
import { MemoryRouter } from 'react-router-dom';
import { NavigationContextProvider } from '../../src/components/NavigationContext.Provider';
import { LoginContextProvider } from '../../src/components/LoginContext.Provider';
test('Daten werden angezeigt', () => {
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <Thema thema={themen[0]} />
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );
    const elementsTitel = screen.getAllByText(themen[0].titel, { exact: false });
    expect(elementsTitel.length).toBeGreaterThan(0);
});

test('Thema wird hinzugefügt', () => {
    render(
        <MemoryRouter>
            <LoginContextProvider>
                <NavigationContextProvider>
                    <Thema thema={themen[0]} />
                </NavigationContextProvider>
            </LoginContextProvider>
        </MemoryRouter>
    );
    const elementsTitel = screen.getAllByText(themen[0].titel, { exact: false });
    expect(elementsTitel.length).toBeGreaterThan(0);
});
