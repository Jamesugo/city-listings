import styles from './OwnerDashboard.module.css';

interface OwnerDashboardProps {
  businessName: string;
  subscriptionTier: string;
  pageViews: number;
  whatsappClicks: number;
  callClicks: number;
}

export default function OwnerDashboard({
  businessName,
  subscriptionTier,
  pageViews,
  whatsappClicks,
  callClicks,
}: OwnerDashboardProps) {
  const totalLeads = whatsappClicks + callClicks;

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div>
          <h2 className={styles.dashboardTitle}>📊 Owner Dashboard</h2>
          <p className={styles.dashboardSubtitle}>Analytics for <strong>{businessName}</strong></p>
        </div>
        <span className={`${styles.tierBadge} ${styles[subscriptionTier]}`}>
          {subscriptionTier === 'pro' ? '⚡ Pro' : subscriptionTier === 'premium' ? '👑 Premium' : '🆓 Free'}
        </span>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👁️</div>
          <div className={styles.metricValue}>{pageViews.toLocaleString()}</div>
          <div className={styles.metricLabel}>Profile Views</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💬</div>
          <div className={styles.metricValue}>{whatsappClicks.toLocaleString()}</div>
          <div className={styles.metricLabel}>WhatsApp Clicks</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📞</div>
          <div className={styles.metricValue}>{callClicks.toLocaleString()}</div>
          <div className={styles.metricLabel}>Call Clicks</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🎯</div>
          <div className={styles.metricValue}>{totalLeads.toLocaleString()}</div>
          <div className={styles.metricLabel}>Total Leads</div>
        </div>
      </div>

      {subscriptionTier === 'free' && (
        <div className={styles.upgradeBar}>
          <p>
            <strong>Upgrade to Pro</strong> — Get boosted placement, 5 photos, 3 videos, promo posts, and detailed analytics.
          </p>
        </div>
      )}
    </div>
  );
}
