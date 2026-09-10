import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the NaijaList team. We are here to help.',
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="contact-heading">
        <div className="container">
          <h1 id="contact-heading" className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>We'd love to hear from you. Reach out to our team.</p>
        </div>
      </section>

      <section className={`container ${styles.content}`}>
        <div className={styles.grid}>
          {/* Contact Details */}
          <div className={styles.contactDetails}>
            <h2>Get In Touch</h2>
            <p className={styles.intro}>
              Have a question about a listing? Need help verifying your business? Just want to say hello? Our team is always ready to assist.
            </p>
            
            <div className={styles.contactMethods}>
              <div className={styles.method}>
                <span className={styles.iconWrapper}>
                  <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                </span>
                <div>
                  <strong>WhatsApp</strong>
                  <p>+234 (0) 800 000 0000</p>
                </div>
              </div>
              <div className={styles.method}>
                <span className={styles.iconWrapper}>
                  <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                </span>
                <div>
                  <strong>Email</strong>
                  <p>hello@naijalist.com.ng</p>
                </div>
              </div>
              <div className={styles.method}>
                <span className={styles.iconWrapper}>
                  <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                </span>
                <div>
                  <strong>Office</strong>
                  <p>Independence Layout, Enugu, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formContainer}>
            <form className={styles.form} aria-label="Contact form">
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Full Name</label>
                <input type="text" id="name" name="name" className="form-input" placeholder="e.g. Chinedu Okafor" required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input type="email" id="email" name="email" className="form-input" placeholder="chinedu@example.com" required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.label}>Subject</label>
                <select id="subject" name="subject" className="form-input" required>
                  <option value="">Select a topic</option>
                  <option value="support">General Support</option>
                  <option value="business">Business Listing Help</option>
                  <option value="verification">Verification Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea id="message" name="message" className="form-input" rows={5} placeholder="How can we help you?" required></textarea>
              </div>
              <button type="button" className={`btn btn-primary ${styles.submitBtn}`}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
