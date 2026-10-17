'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#B98C2D',
            light: '#F9F5EC',
            dark: '#826017',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#D2AA2D',
            light: '#FAF7F0',
            dark: '#9E7420',
        },
    },
    typography: {
        fontFamily: 'var(--font-sans), var(--font-poppins), system-ui, sans-serif',
    },
});

export default function ThemeRegistry({ children }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}
