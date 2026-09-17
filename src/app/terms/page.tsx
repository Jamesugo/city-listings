import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for NaijaList.',
};

export default function TermsOfServicePage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="terms-heading">
        <div className="container">
          <h1 id="terms-heading" className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Please read these terms carefully before using our platform.</p>
        </div>
      </section>

      <section className={`container ${styles.content}`}>
        <div className={styles.textSection}>
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using NaijaList, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            NaijaList provides a business directory service that allows users to discover, review, and contact local businesses in Nigeria. Business owners can create accounts to list their businesses and interact with customers.
          </p>

          <h2>3. User Accounts</h2>
          <ul>
            <li>You must provide accurate, complete, and current information when creating an account.</li>
            <li>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</li>
            <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
          </ul>

          <h2>4. Content and Business Listings</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting content, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service.
          </p>

          <h2>5. Prohibited Uses</h2>
          <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>To post fraudulent, misleading, or unauthorized business listings.</li>
            <li>To impersonate or attempt to impersonate NaijaList, a NaijaList employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
          </ul>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall NaijaList, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us via our Contact Support page.
          </p>
        </div>
      </section>
    </>
  );
}
