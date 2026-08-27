'use client';

import { useFormStatus } from 'react-dom';
import { updatePassword } from './actions';
import styles from '../page.module.css';
import { Lock, Loader2 } from '@/components/Icons';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      formAction={updatePassword} 
      className="btn btn-primary" 
      disabled={pending}
      style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={18} /> 
          Updating Password...
        </>
      ) : (
        'Update Password'
      )}
    </button>
  );
}

export default function UpdatePasswordForm({ error, message }: { error?: string; message?: string }) {
  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginCard}>
        <div className={styles.loginIcon} aria-hidden="true">
          <Lock className={styles.iconElement} size={28} />
        </div>
        <h1 className={styles.loginTitle}>Set New Password</h1>
        <p className={styles.loginDesc}>
          Please enter your new password below.
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
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">New Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            required
            minLength={6}
            autoComplete="new-password"
            style={{ padding: '0.75rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="form-input"
            required
            minLength={6}
            autoComplete="new-password"
            style={{ padding: '0.75rem' }}
          />
        </div>
        
        <SubmitButton />
      </form>
    </div>
  );
}
