'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { login, signup, resetPassword, signInWithGoogle } from './actions';
import styles from '../page.module.css';
import { Lock, Sparkles, Loader2 } from '@/components/Icons';

function SubmitButton({ mode }: { mode: 'login' | 'signup' | 'forgot' }) {
  const { pending } = useFormStatus();
  
  const action = mode === 'login' ? login : mode === 'signup' ? signup : resetPassword;
  const loadingText = mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending Link...';
  const text = mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link';

  return (
    <button 
      formAction={action} 
      className="btn btn-primary" 
      disabled={pending}
      style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={18} /> 
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
}

export default function LoginForm({ error, message }: { error?: string; message?: string }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const router = useRouter();
  const pathname = usePathname();
  
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  const toggleMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    if (error || message) {
      router.replace(pathname); // Clears the query params
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginCard}>
        <div className={styles.loginIcon} aria-hidden="true">
          {isLogin ? <Lock className={styles.iconElement} size={28} /> : <Sparkles className={styles.iconElement} size={28} />}
        </div>
        <h1 className={styles.loginTitle}>
          {isLogin ? 'Welcome Back' : isSignup ? 'Create an Account' : 'Reset Password'}
        </h1>
        <p className={styles.loginDesc}>
          {isLogin ? 'Sign in to manage your business listings.' : isSignup ? 'Join NaijaList to discover or list your business.' : 'Enter your email and we will send you a reset link.'}
        </p>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {!isForgot && (
          <>
            <button
              formAction={signInWithGoogle}
              formNoValidate
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }}></div>
              <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH EMAIL</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }}></div>
            </div>
          </>
        )}
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            required
            autoComplete="off"
            style={{ padding: '0.75rem' }}
          />
        </div>
        
        {!isForgot && (
          <div className="form-group" style={{ marginBottom: isLogin ? '0.5rem' : '1.5rem' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              required={!isForgot}
              minLength={6}
              autoComplete="new-password"
              style={{ padding: '0.75rem' }}
            />
          </div>
        )}

        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setMode('forgot'); if (error || message) router.replace(pathname); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0' }}
            >
              Forgot Password?
            </button>
          </div>
        )}
        
        {isForgot && <div style={{ marginBottom: '1.5rem' }} />}
        
        <SubmitButton mode={mode} />
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
          {isSignup ? "Already have an account? " : isForgot ? "Remember your password? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => { setMode(isSignup || isForgot ? 'login' : 'signup'); if (error || message) router.replace(pathname); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: '0.25rem' }}
          >
            {isSignup || isForgot ? 'Log in instead' : 'Sign up for free'}
          </button>
        </div>
      </form>
    </div>
  );
}
