import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        // Immediate execution
        try {
            if (token) {
                if (window.opener) {
                    console.log('Bridge: Sending success to parent...');
                    window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, "*");
                }
            } else {
                if (window.opener) {
                    window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE' }, "*");
                }
            }
        } catch (err) {
            console.error('Handshake failed:', err);
        }

        // Wait just 100ms to ensure message dispatch
        const timer = setTimeout(() => {
            window.close();
        }, 100);

        return () => clearTimeout(timer);
    }, [token]);

    // Return null so nothing is displayed as requested
    return null;
}
