'use client';

import { Provider } from 'react-redux';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import store from './store/store';

export default function ClientLayout({ children }) {
    return (
        <Provider store={store}>
            <ThemeRegistry>
                <div className='text-black'>
                    {children}
                </div>
            </ThemeRegistry>
        </Provider>
    );
}
