import { render, screen, waitFor } from '@testing-library/react';
import { withErrorBoundary } from 'react-error-boundary';
import { MemoryRouter } from 'react-router';
import App from '../../src/App';

import { LoginStatus, mockFetch } from './mockFetch';
import { LoginContextProvider } from '../../src/components/LoginContext.Provider';

// 1000 is the default anyway
const MAX_TIMEOUT_FOR_FETCH_TESTS = Number.parseInt(import.meta.env.MAX_TIMEOUT_FOR_FETCH_TESTS || "1000");

function waitForLonger(callback: () => void | Promise<void>) {
    return waitFor(callback, { timeout: MAX_TIMEOUT_FOR_FETCH_TESTS });
}

const orgLog = console.log;
const orgError = console.error;
beforeEach(() => {
    console.log = () => { };
    console.error = () => { };
    mockFetch();
});
afterEach(() => {
    console.log = orgLog;
    console.error = orgError;
});

const AppWithErrorBoundary = withErrorBoundary(App, {
    onError: (err) => { throw err; },
    fallback: <div />
});

test('App', async () => {
    render(<MemoryRouter initialEntries={["/"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);

    await waitForLonger(() => {
        const title = screen.getAllByText(/McGonagall/i);
        expect(title.length).toBeGreaterThanOrEqual(2);
    });
});

test('Prefs', async () => {
    const loginStatus = new LoginStatus(true, false);
    mockFetch(loginStatus);
    
    render(<MemoryRouter initialEntries={["/prefs"]}>
        <LoginContextProvider>
            <AppWithErrorBoundary />
        </LoginContextProvider>
    </MemoryRouter>);

    await waitForLonger(() => {
        const title = screen.getAllByText(/Globale/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});

test('Admin', async () => {
    const loginStatus = new LoginStatus(true, false);
    mockFetch(loginStatus);
    
    render(<MemoryRouter initialEntries={["/admin"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);

    await waitForLonger(() => {
        const title = screen.getAllByText(/Prof/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});

test('Login', async () => {
    render(<MemoryRouter initialEntries={["/login"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);

    await waitForLonger(() => {
        const title = screen.getAllByText(/login/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});

test('Login', async () => {
    render(<MemoryRouter initialEntries={["/login"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);

    await waitForLonger(() => {
        const title = screen.getAllByText(/login/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});

test('Gebiet 101', async () => {
    render(<MemoryRouter initialEntries={["/gebiet/101"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);
    await waitForLonger(() => {
        const title = screen.getAllByText(/Transfiguration/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});

test('Thema', async () => {
    render(<MemoryRouter initialEntries={["/thema/201"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);

    await waitForLonger(() => {
        const title = screen.getAllByText(/Verwandlungen in Wölfe/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});



test('Invalid Gebiet-ID', async () => {
    render(<MemoryRouter initialEntries={["/gebiet/abc"]}>
        <AppWithErrorBoundary />
    </MemoryRouter>);
    await waitForLonger(() => {
        // Der konkrete Text hängt natürlich von Ihrer Implementierung ab.
        // Hauptsache, man kann erkennen, dass es sich um einen Fehler handelt.
        const title = screen.getAllByText(/error/i);
        expect(title.length).toBeGreaterThanOrEqual(1);
    });
});
