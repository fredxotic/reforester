import { useEffect, useRef, useState, useCallback } from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Shared hook for Google OAuth initialization, script loading, and button rendering.
 *
 * @param {Object} options
 * @param {string} options.buttonId - DOM element id where the Google button is rendered
 * @param {string} [options.buttonText='continue_with'] - Google button text variant
 * @param {(response: object) => Promise<void>} options.onCredential - Callback receiving the Google credential response
 * @returns {{ googleLoading: boolean, googleError: string|null, triggerPrompt: () => void }}
 */
export function useGoogleOAuth({ buttonId, buttonText = 'continue_with', onCredential }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [buttonRendered, setButtonRendered] = useState(false);
  const initializedRef = useRef(false);
  const buttonRenderedRef = useRef(false);
  // Store callback in a ref so the Google SDK always calls the latest version
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    initializedRef.current = false;
    buttonRenderedRef.current = false;
    setButtonRendered(false);

    const handleResponse = async (response) => {
      if (!response.credential) {
        setGoogleError('No credential received from Google');
        return;
      }
      setGoogleLoading(true);
      setGoogleError(null);
      try {
        await onCredentialRef.current(response);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Google OAuth callback error:', err);
        }
        // Let the consumer handle specific error mapping
        throw err;
      } finally {
        setGoogleLoading(false);
      }
    };

    const renderButton = () => {
      if (!initializedRef.current || buttonRenderedRef.current) return;
      try {
        const container = document.getElementById(buttonId);
        if (container && window.google) {
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: buttonText,
            shape: 'rectangular',
            logo_alignment: 'left',
          });
          buttonRenderedRef.current = true;
          setButtonRendered(true);
        }
      } catch {
        if (import.meta.env.DEV) {
          console.error('Google button render failed');
        }
      }
    };

    const initialize = () => {
      if (initializedRef.current || !window.google) return;

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setGoogleError('Google Sign-In is not configured properly.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'use',
          ux_mode: 'popup',
        });
        initializedRef.current = true;
        renderButton();
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Google OAuth initialization failed:', err);
        }
        setGoogleError('Failed to initialize Google Sign-In.');
      }
    };

    // If already loaded
    if (window.google) {
      initialize();
      return;
    }

    // Check if another instance already appended the script
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', initialize);
      return () => existing.removeEventListener('load', initialize);
    }

    // Load the script
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => {
      setGoogleError('Failed to load Google Sign-In. Please try another method.');
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script — other components may need it
    };
  }, [buttonId, buttonText]);

  const triggerPrompt = useCallback(() => {
    if (!initializedRef.current) {
      setGoogleError('Google Sign-In is still loading. Please wait...');
      return;
    }
    try {
      window.google.accounts.id.prompt();
    } catch {
      setGoogleError('Failed to start Google Sign-In');
    }
  }, []);

  return { googleLoading, googleError, triggerPrompt, buttonRendered };
}
