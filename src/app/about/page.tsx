import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about NaijaList, Nigeria\'s premier local business directory.',
};

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="about-heading">
        <div className="container">
          <h1 id="about-heading" className={styles.title}>About NaijaList</h1>
          <p className={styles.subtitle}>Connecting Nigerians with trusted local businesses, one listing at a time.</p>
        </div>
      </section>

      <section className={`container ${styles.content}`}>
        <div className={styles.grid}>
          <div className={styles.textSection}>
            <h2>Our Mission</h2>
            <p>
              At NaijaList, our mission is simple: to make it incredibly easy for anyone in Nigeria, starting right here in Enugu State, to find verified and trusted local businesses. We believe that small and medium-sized enterprises (SMEs) are the backbone of our economy, and our platform is designed to give them the visibility they deserve.
            </p>
            
            <h2>Why Choose Us?</h2>
            <p>
              We know how frustrating it can be to search for a reliable mechanic, a trusted clinic, or a great local restaurant, only to find outdated information. That's why we emphasize verified listings. With direct WhatsApp integration, you can contact businesses with just one tap.
            </p>

            <h2>For Business Owners</h2>
            <p>
              Getting listed on NaijaList means reaching more customers in your local area. We provide a beautiful, easy-to-use profile for your business where you can showcase your services, collect reviews, and grow your reputation. 
            </p>

            <div className={styles.ctaWrapper}>
              <Link href="/list-business" className="btn btn-primary">
                List Your Business Today
              </Link>
            </div>
          </div>
          
          <div className={styles.imageSection}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.icon}>
                <i className="fa-solid fa-store" aria-hidden="true"></i>
              </span>
              <p>Discover & Connect</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
