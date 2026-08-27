import type { Metadata } from 'next';
import UpdatePasswordForm from './UpdatePasswordForm';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Update Password — NaijaList',
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className={styles.page}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <UpdatePasswordForm error={error} message={message} />
      </div>
    </div>
  );
}
