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

        // Close instantly
        window.close();
        
        // Fallback for some browsers that block immediate close
        const timer = setTimeout(() => {
            window.close();
        }, 500);

        return () => clearTimeout(timer);
    }, [token]);

    // Return null so nothing is displayed as requested
    return null;
}
