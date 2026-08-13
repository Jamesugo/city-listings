'use client';

import { useState, useCallback } from 'react';
import { BUSINESSES, CATEGORIES, CITIES } from '@/lib/data';
import type { Business } from '@/lib/types';
import styles from './page.module.css';

// Simple admin secret check — replaced with Supabase Auth in Phase 2
const ADMIN_SECRET = 'naijalist2026';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Business list state
  const [businesses] = useState<Business[]>(BUSINESSES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: CATEGORIES[0]?.id ?? '',
    cityId: CITIES[0]?.id ?? '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    description: '',
    isFeatured: false,
    isActive: true,
    verificationTier: 'none' as 'none' | 'phone' | 'cac',
  });

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Invalid admin password');
    }
  }, [password]);

  const slugify = (text: string): string =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      categoryId: CATEGORIES[0]?.id ?? '',
      cityId: CITIES[0]?.id ?? '',
      address: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      description: '',
      isFeatured: false,
      isActive: true,
      verificationTier: 'none',
    });
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleEdit = useCallback((biz: Business) => {
    setFormData({
      name: biz.name,
      slug: biz.slug,
      categoryId: biz.categoryId,
      cityId: biz.cityId,
      address: biz.address,
      phone: biz.phone,
      whatsapp: biz.whatsapp ?? '',
      email: biz.email ?? '',
      website: biz.website ?? '',
      description: biz.description,
      isFeatured: biz.isFeatured,
      isActive: biz.isActive,
      verificationTier: biz.verificationTier,
    });
    setEditingId(biz.id);
    setShowForm(true);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // In Phase 1, changes are displayed only — no persistent storage without Supabase.
    // This demonstrates the admin CRUD UI; wire to API routes once Supabase is connected.
    alert(
      editingId
        ? `Business "${formData.name}" updated! (In-memory only — wire Supabase to persist.)`
        : `Business "${formData.name}" created! (In-memory only — wire Supabase to persist.)`
    );
    resetForm();
  }, [editingId, formData.name, resetForm]);

  // ----------------------------------------------------------------
  // Login screen
  // ----------------------------------------------------------------
  if (!authed) {
    return (
      <div className={styles.loginWrapper}>
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <div className={styles.loginIcon}>🔐</div>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <p className={styles.loginDesc}>Enter the admin password to manage listings.</p>
          {authError && <p className={styles.loginError}>{authError}</p>}
          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">Password</label>
            <input
              type="password"
              id="admin-password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} id="admin-login-btn">
            Log In
          </button>
          <p className={styles.loginHint}>Hint: naijalist2026</p>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Admin Dashboard
  // ----------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Admin Dashboard</h1>
              <p className={styles.subtitle}>Manage NaijaList business listings</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className="btn btn-primary"
                onClick={() => { resetForm(); setShowForm(true); }}
                id="admin-add-btn"
              >
                ➕ Add Business
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAuthed(false)} id="admin-logout-btn">
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{businesses.length}</span>
            <span className={styles.statLabel}>Total Listings</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{businesses.filter(b => b.isActive).length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{businesses.filter(b => b.isFeatured).length}</span>
            <span className={styles.statLabel}>Featured</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{businesses.filter(b => b.verificationTier !== 'none').length}</span>
            <span className={styles.statLabel}>Verified</span>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              {editingId ? '✏️ Edit Business' : '➕ Add New Business'}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label htmlFor="biz-name" className="form-label">Business Name *</label>
                  <input
                    id="biz-name"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
                    required
                    placeholder="e.g. Mama Ngozi's Kitchen"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-slug" className="form-label">URL Slug</label>
                  <input
                    id="biz-slug"
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-from-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-category" className="form-label">Category *</label>
                  <select
                    id="biz-category"
                    className="form-input form-select"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="biz-city" className="form-label">City *</label>
                  <select
                    id="biz-city"
                    className="form-input form-select"
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    required
                  >
                    {CITIES.map((city) => (
                      <option key={city.id} value={city.id}>📍 {city.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="biz-address" className="form-label">Address *</label>
                  <input
                    id="biz-address"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="e.g. 14 Ogui Road, Enugu"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-phone" className="form-label">Phone *</label>
                  <input
                    id="biz-phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+2348012345678"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-whatsapp" className="form-label">WhatsApp Number</label>
                  <input
                    id="biz-whatsapp"
                    className="form-input"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="2348012345678 (no +)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-email" className="form-label">Email</label>
                  <input
                    id="biz-email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-website" className="form-label">Website</label>
                  <input
                    id="biz-website"
                    type="url"
                    className="form-input"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="biz-description" className="form-label">Description *</label>
                  <textarea
                    id="biz-description"
                    className="form-input form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Describe the business, services offered, etc."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-verification" className="form-label">Verification</label>
                  <select
                    id="biz-verification"
                    className="form-input form-select"
                    value={formData.verificationTier}
                    onChange={(e) => setFormData({ ...formData, verificationTier: e.target.value as 'none' | 'phone' | 'cac' })}
                  >
                    <option value="none">Not verified</option>
                    <option value="phone">📱 Phone verified</option>
                    <option value="cac">🏛️ CAC registered</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Options</label>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      ⭐ Featured
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      ✅ Active
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className="btn btn-primary" id="admin-save-btn">
                  {editingId ? '💾 Update Business' : '➕ Create Business'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={resetForm} id="admin-cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings table */}
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>All Listings ({businesses.length})</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz) => (
                  <tr key={biz.id} className={!biz.isActive ? styles.inactive : undefined}>
                    <td>
                      <div className={styles.bizCell}>
                        <strong>{biz.name}</strong>
                        {biz.isFeatured && <span className={styles.featuredPill}>⭐</span>}
                      </div>
                    </td>
                    <td>{biz.categoryName}</td>
                    <td>{biz.cityName}</td>
                    <td>
                      <span className={`badge ${biz.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {biz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        biz.verificationTier === 'cac' ? 'badge-green' :
                        biz.verificationTier === 'phone' ? 'badge-blue' : 'badge-gray'
                      }`}>
                        {biz.verificationTier === 'none' ? 'None' :
                         biz.verificationTier === 'phone' ? '📱 Phone' : '🏛️ CAC'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEdit(biz)}
                          aria-label={`Edit ${biz.name}`}
                        >
                          ✏️
                        </button>
                        <a
                          href={`/businesses/${biz.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          aria-label={`View ${biz.name}`}
                        >
                          👁️
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
