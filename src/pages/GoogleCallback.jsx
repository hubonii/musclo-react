import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token && window.opener) {
            // Talk to the parent window (they are now on the same domain!)
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, window.location.origin);
            // Close the popup after a split second
            setTimeout(() => window.close(), 100);
        } else if (!token) {
            if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE' }, window.location.origin);
            }
            setTimeout(() => window.close(), 100);
        }
    }, [token]);

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            flexDirection: 'column',
            fontFamily: 'sans-serif',
            background: '#f8fafc'
        }}>
            <div style={{ color: '#EA580C', fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>
                Finishing Login...
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
                Sending you back to Musclo.tech
            </div>
        </div>
    );
}
