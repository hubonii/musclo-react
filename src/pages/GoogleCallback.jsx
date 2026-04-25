import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const handleHandshake = () => {
            try {
                if (token) {
                    if (window.opener) {
                        console.log('Bridge: Sending success to parent...');
                        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, "*");
                        // Short delay then close
                        setTimeout(() => window.close(), 200);
                    } else {
                        console.warn('Bridge: No opener found. Trying localStorage fallback...');
                        // Fallback: If we can't talk to parent, just save token and let user click a button
                        localStorage.setItem('musclo-token', token);
                    }
                }
            } catch (err) {
                console.error('Handshake failed:', err);
            }
        };

        handleHandshake();
    }, [token]);

    const handleManualDone = () => {
        window.close();
        if (window.opener) {
            window.opener.location.reload();
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            flexDirection: 'column',
            fontFamily: 'sans-serif',
            background: '#f8fafc',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{ color: '#EA580C', fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>
                {token ? 'Login Successful!' : 'Authenticating...'}
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '300px' }}>
                {token 
                    ? 'We have securely synced your account. This window should close automatically.' 
                    : 'Please wait while we verify your credentials...'}
            </p>
            {token && (
                <button 
                    onClick={handleManualDone}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#EA580C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Return to Musclo.tech
                </button>
            )}
        </div>
    );
}
