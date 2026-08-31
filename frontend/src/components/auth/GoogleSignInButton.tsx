'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

export const GoogleSignInButton: React.FC<{ onSuccess?: () => void; onError?: (err: string) => void }> = ({
  onSuccess,
  onError
}) => {
  const { googleLogin } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services script if not present
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else if ((window as any).google?.accounts?.id) {
      initializeGoogle();
    }

    function initializeGoogle() {
      if (!(window as any).google?.accounts?.id || !googleBtnRef.current) return;

      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });

      (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular'
      });
    }

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
  }, [clientId, googleLogin, onSuccess, onError]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color, #334155)',
          background: 'rgba(255,255,255,0.03)',
          color: '#64748b',
          fontSize: '0.9rem',
          cursor: 'not-allowed'
        }}
      >
        Google Sign-In (Set NEXT_PUBLIC_GOOGLE_CLIENT_ID)
      </button>
    );
  }

  return <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
};
