'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const GoogleSignInButton: React.FC<{ onSuccess?: () => void; onError?: (err: string) => void }> = ({
  onSuccess,
  onError
}) => {
  const { googleLogin } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) return;

    function initGsi() {
      if ((window as any).google?.accounts?.id) {
        setScriptLoaded(true);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular'
            });
          }
        } catch (e) {
          console.error('Google GSI init error:', e);
        }
      }
    }

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      initGsi();
    }

    // Interval check in case script takes a moment
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id && !scriptLoaded) {
        initGsi();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [clientId]);

  async function handleCredentialResponse(response: any) {
    if (response && response.credential) {
      try {
        await googleLogin(response.credential);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        if (onError) onError(err.message || 'Google authentication failed');
      }
    }
  }

  const handleCustomButtonClick = () => {
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      if (onError) onError('Google Sign-In is initializing. Please try again in a moment.');
    }
  };

  if (!clientId) {
    return (
      <div
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #334155',
          background: 'rgba(255, 255, 255, 0.04)',
          color: '#94a3b8',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <GoogleLogoSvg />
        <span>Google Sign-In (Add NEXT_PUBLIC_GOOGLE_CLIENT_ID)</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Official Google GSI Button Container */}
      <div ref={googleBtnRef} style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }} />

      {/* Fallback Custom Styled Google Button if GSI iframe fails to render */}
      {!scriptLoaded && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #334155',
            background: '#ffffff',
            color: '#1f2937',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <GoogleLogoSvg />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
};

const GoogleLogoSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);
