'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#C53261',
            light: '#FFF5F8',
            dark: '#87143A',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#C5A059',
            light: '#FCF4F7',
            dark: '#A8224E',
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
