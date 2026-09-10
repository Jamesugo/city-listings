import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about NaijaList, business verification, and getting listed.',
};

const faqs = [
  {
    question: "Is it free to list my business on NaijaList?",
    answer: "Yes! A basic business listing on NaijaList is completely free. We want to help as many local businesses as possible get discovered online."
  },
  {
    question: "How do I get my business verified?",
    answer: "We offer verification to build trust. You can verify your phone number via WhatsApp easily. For full verification, you can provide your CAC registration details through your dashboard."
  },
  {
    question: "How do customers contact me?",
    answer: "Customers can contact you directly via the WhatsApp number you provide on your profile. Just one tap and they are chatting with you!"
  },
  {
    question: "Can I update my business details later?",
    answer: "Absolutely. Once you create an account and list your business, you can log in to your dashboard at any time to update your address, hours, photos, and services."
  },
  {
    question: "Why should I use NaijaList instead of social media?",
    answer: "While social media is great, NaijaList is specifically built for intent-driven search. When people come here, they are actively looking for a service to hire or a place to visit in their city. Plus, we organize everything neatly by category."
  }
];

export default function FAQPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="faq-heading">
        <div className="container">
          <h1 id="faq-heading" className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>Everything you need to know about NaijaList.</p>
        </div>
      </section>

      <section className={`container ${styles.content}`}>
        <div className={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <h3 className={styles.question}>{faq.question}</h3>
              <p className={styles.answer}>{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className={styles.contactPrompt}>
          <p>Still have questions?</p>
          <Link href="/contact" className="btn btn-secondary">
            Contact Support
          </Link>
        </div>
      </section>
    </>
  );
}
