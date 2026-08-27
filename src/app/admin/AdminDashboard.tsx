'use client';

import { useState, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Business, Category, City } from '@/lib/types';
import { upsertBusiness, deleteBusiness, toggleFeatured } from './actions';
import { uploadMedia, deleteMedia } from './upload';
import { logout } from './login/actions';
import styles from './page.module.css';
import { Plus, Edit, ImagePlus, Trash2, X, Loader2, Star, CheckCircle, Phone, Landmark, Eye, Edit2, Lightbulb, Save } from '@/components/Icons';

export default function AdminDashboard({
  initialBusinesses,
  categories,
  cities,
  userRole,
}: {
  initialBusinesses: Business[];
  categories: Category[];
  cities: City[];
  userRole: string;
}) {
  // Business list state
  const [businesses] = useState<Business[]>(initialBusinesses);
  const isOwner = userRole !== 'admin';
  const hasBusiness = businesses.length > 0;
  const router = useRouter();
  
  // Auto-open form for owners
  const [editingId, setEditingId] = useState<string | null>(isOwner && hasBusiness ? businesses[0].id : null);
  const [showForm, setShowForm] = useState(isOwner ? true : false);
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics'>('listings');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };
  
  // Media state
  const [coverPreview, setCoverPreview] = useState<string | null>(
    isOwner && hasBusiness ? businesses[0].coverImageUrl || null : null
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    isOwner && hasBusiness ? businesses[0].gallery || [] : []
  );
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const defaultFormData = isOwner && hasBusiness ? {
    name: businesses[0].name,
    slug: businesses[0].slug,
    categoryId: businesses[0].categoryId,
    cityId: businesses[0].cityId,
    address: businesses[0].address,
    phone: businesses[0].phone,
    whatsapp: businesses[0].whatsapp ?? '',
    email: businesses[0].email ?? '',
    website: businesses[0].website ?? '',
    description: businesses[0].description,
    isFeatured: businesses[0].isFeatured,
    isActive: businesses[0].isActive,
    verificationTier: businesses[0].verificationTier,
  } : {
    name: '',
    slug: '',
    categoryId: categories[0]?.id ?? '',
    cityId: cities[0]?.id ?? '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    description: '',
    isFeatured: false,
    isActive: true,
    verificationTier: 'none' as 'none' | 'phone' | 'cac',
  };

  const [formData, setFormData] = useState(defaultFormData);

  const slugify = (text: string): string =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      categoryId: categories[0]?.id ?? '',
      cityId: cities[0]?.id ?? '',
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
    
    startTransition(async () => {
      // Map formData to DB columns
      const dbData = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name,
        slug: formData.slug,
        category_id: formData.categoryId,
        city_id: formData.cityId,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        website: formData.website,
        description: formData.description,
        is_featured: formData.isFeatured,
        is_active: formData.isActive,
        verification_tier: formData.verificationTier,
      };

      const result = await upsertBusiness(dbData);
      
      if (result.error) {
        showToast('error', 'Error saving business: ' + result.error);
      } else {
        showToast('success', `"${formData.name}" saved successfully!`);
        resetForm();
        router.refresh();
      }
    });
  }, [editingId, formData, resetForm, router]);

  const handleDelete = useCallback((id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate "${name}"? It will be hidden from public listings.`)) return;
    startTransition(async () => {
      const result = await deleteBusiness(id);
      if (result.error) {
        showToast('error', result.error);
      } else {
        showToast('success', `"${name}" has been deactivated.`);
        router.refresh();
      }
    });
  }, [router]);

  const handleToggleFeatured = useCallback((id: string, current: boolean, name: string) => {
    startTransition(async () => {
      const result = await toggleFeatured(id, current);
      if (result.error) {
        showToast('error', result.error);
      } else {
        showToast('success', `"${name}" ${current ? 'unfeatured' : 'featured'}.`);
        router.refresh();
      }
    });
  }, [router]);

  // ----------------------------------------------------------------
  // Admin Dashboard
  // ----------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#15803d' : '#b91c1c',
          boxShadow: 'var(--shadow-lg)', fontWeight: 600, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>{isOwner ? 'Business Dashboard' : 'Admin Dashboard'}</h1>
              <p className={styles.subtitle}>{isOwner ? 'Manage your business listing' : 'Manage NaijaList business listings'}</p>
            </div>
            <div className={styles.headerActions}>
              {!isOwner && (
                <button
                  className="btn btn-primary"
                  onClick={() => { resetForm(); setShowForm(true); }}
                  id="admin-add-btn"
                >
                  <Plus size={16} /> Add Business
                </button>
              )}
              <form action={logout}>
                <button type="submit" className="btn btn-ghost btn-sm" id="admin-logout-btn">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats (Owners only) */}
        {isOwner && hasBusiness && (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{businesses[0].pageViews || 0}</span>
              <span className={styles.statLabel}><Eye size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> Profile Views</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{businesses[0].whatsappClicks || 0}</span>
              <span className={styles.statLabel}><Phone size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> WhatsApp Clicks</span>
            </div>
          </div>
        )}

        {/* Stats (Admins only) */}
        {!isOwner && (
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
        )}

        {/* Form */}
        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              {editingId ? '<Edit size={20} /> Edit Business' : '<Plus size={24} /> Add New Business'}
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
                    minLength={3}
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
                    {categories.map((cat) => (
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
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}> {city.name}</option>
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
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    pattern="^\+?[0-9\s\-()]{7,15}$"
                    title="Enter a valid phone number, e.g., +2348012345678"
                    placeholder="+2348012345678"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="biz-whatsapp" className="form-label">WhatsApp Number</label>
                  <input
                    id="biz-whatsapp"
                    type="tel"
                    className="form-input"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    pattern="^[0-9]{10,15}$"
                    title="Enter a valid WhatsApp number without +, e.g., 2348012345678"
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
                    minLength={20}
                    rows={4}
                    placeholder="Describe the business, services offered, etc."
                  />
                </div>

                {/* ---- Media Upload Section ---- */}
                {editingId && (
                  <>
                    {/* Cover Image */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Cover Image</label>
                      {coverPreview ? (
                        <div className={styles.coverPreview}>
                          <img src={coverPreview} alt="Cover" className={styles.coverImg} />
                          <button
                            type="button"
                            className={styles.deleteOverlay}
                            disabled={uploading}
                            onClick={async () => {
                              setUploading(true);
                              await deleteMedia(coverPreview, editingId, 'cover');
                              setCoverPreview(null);
                              setUploading(false);
                            }}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          className={styles.dropzone}
                          onClick={() => coverInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dropzoneActive); }}
                          onDragLeave={(e) => e.currentTarget.classList.remove(styles.dropzoneActive)}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove(styles.dropzoneActive);
                            const file = e.dataTransfer.files[0];
                            if (!file) return;
                            setUploading(true);
                            const fd = new FormData();
                            fd.append('file', file);
                            fd.append('businessId', editingId);
                            fd.append('mediaType', 'cover');
                            const res = await uploadMedia(fd);
                            if (res.url) setCoverPreview(res.url);
                            else if (res.error) alert(res.error);
                            setUploading(false);
                          }}
                        >
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploading(true);
                              const fd = new FormData();
                              fd.append('file', file);
                              fd.append('businessId', editingId);
                              fd.append('mediaType', 'cover');
                              const res = await uploadMedia(fd);
                              if (res.url) setCoverPreview(res.url);
                              else if (res.error) alert(res.error);
                              setUploading(false);
                            }}
                          />
                          <div className={styles.dropzoneContent}>
                            <span style={{ fontSize: '2rem' }}><ImagePlus size={32} /></span>
                            <p>{uploading ? 'Uploading...' : 'Click or drag to upload a cover image'}</p>
                            <small>Max 50MB • JPG, PNG, WebP</small>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gallery */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Gallery ({galleryPreviews.length} items)</label>
                      <div className={styles.galleryGrid}>
                        {galleryPreviews.map((url, i) => (
                          <div key={i} className={styles.galleryItem}>
                            {url.match(/\.(mp4|webm|mov)$/i) ? (
                              <video src={url} className={styles.galleryThumb} controls />
                            ) : (
                              <img src={url} alt={`Gallery ${i + 1}`} className={styles.galleryThumb} />
                            )}
                            <button
                              type="button"
                              className={styles.galleryDelete}
                              disabled={uploading}
                              onClick={async () => {
                                setUploading(true);
                                await deleteMedia(url, editingId, 'gallery');
                                setGalleryPreviews(prev => prev.filter(g => g !== url));
                                setUploading(false);
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        {/* Add more button */}
                        <div
                          className={styles.galleryAdd}
                          onClick={() => galleryInputRef.current?.click()}
                        >
                          <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files) return;
                              setUploading(true);
                              for (let i = 0; i < files.length; i++) {
                                const fd = new FormData();
                                fd.append('file', files[i]);
                                fd.append('businessId', editingId);
                                fd.append('mediaType', 'gallery');
                                const res = await uploadMedia(fd);
                                if (res.url) setGalleryPreviews(prev => [...prev, res.url!]);
                                else if (res.error) alert(res.error);
                              }
                              setUploading(false);
                            }}
                          />
                          <span style={{ fontSize: '1.5rem' }}>{uploading ? '<Loader2 size={24} className="animate-spin" />' : '<Plus size={24} />'}</span>
                          <small>Add photos/videos</small>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!editingId && isOwner && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ padding: '1.5rem', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-primary-dark)' }}>
                      <Lightbulb size={20} /> Save your business first, then you can upload images and videos!
                    </div>
                  </div>
                )}

                {/* Admin-only options */}
                {!isOwner && (
                  <>
                    <div className="form-group">
                      <label htmlFor="biz-verification" className="form-label">Verification</label>
                      <select
                        id="biz-verification"
                        className="form-input form-select"
                        value={formData.verificationTier}
                        onChange={(e) => setFormData({ ...formData, verificationTier: e.target.value as 'none' | 'phone' | 'cac' })}
                      >
                        <option value="none">Not verified</option>
                        <option value="phone"><Phone size={16} /> Phone verified</option>
                        <option value="cac"><Landmark size={16} /> CAC registered</option>
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
                          <Star size={16} /> Featured
                        </label>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          />
                          <CheckCircle size={16} /> Active
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="submit" className="btn btn-primary" id="admin-save-btn" disabled={isPending}>
                  {isPending ? 'Saving...' : editingId ? '<Save size={16} /> Update Business' : '<Plus size={16} /> Create Business'}
                </button>
                {!isOwner && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm} id="admin-cancel-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab switcher (Admins only) */}
        {!isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border-light)', paddingBottom: '0' }}>
            <button
              className={`btn btn-sm ${activeTab === 'listings' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('listings')}
              id="tab-listings"
              style={{ borderRadius: '0.5rem 0.5rem 0 0', marginBottom: '-2px', borderBottom: activeTab === 'listings' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
            >
              📋 Listings ({businesses.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('analytics')}
              id="tab-analytics"
              style={{ borderRadius: '0.5rem 0.5rem 0 0', marginBottom: '-2px', borderBottom: activeTab === 'analytics' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
            >
              📊 Analytics
            </button>
          </div>
        )}

        {/* Analytics tab (Admins only) */}
        {!isOwner && activeTab === 'analytics' && (
          <div className={styles.tableCard}>
            <h2 className={styles.tableTitle}>Analytics Overview</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>City</th>
                    <th style={{ textAlign: 'right' }}>👁 Page Views</th>
                    <th style={{ textAlign: 'right' }}>💬 WA Clicks</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...businesses].sort((a, b) => (b.pageViews || 0) - (a.pageViews || 0)).map((biz) => (
                    <tr key={biz.id} className={!biz.isActive ? styles.inactive : undefined}>
                      <td><strong>{biz.name}</strong>{biz.isFeatured && <span className={styles.featuredPill}>⭐</span>}</td>
                      <td>{biz.cityName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{(biz.pageViews || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>{(biz.whatsappClicks || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${biz.isActive ? 'badge-green' : 'badge-gray'}`}>
                          {biz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings table (Admins only) */}
        {!isOwner && activeTab === 'listings' && (
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
                           biz.verificationTier === 'phone' ? '<Phone size={14} /> Phone' : '<Landmark size={14} /> CAC'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleEdit(biz)}
                            aria-label={`Edit ${biz.name}`}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleToggleFeatured(biz.id, biz.isFeatured, biz.name)}
                            aria-label={biz.isFeatured ? `Unfeature ${biz.name}` : `Feature ${biz.name}`}
                            title={biz.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                            style={{ color: biz.isFeatured ? 'var(--color-accent)' : undefined }}
                          >
                            <Star size={16} />
                          </button>
                          <a
                            href={`/businesses/${biz.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            aria-label={`View ${biz.name}`}
                            title="View public page"
                          >
                            <Eye size={16} />
                          </a>
                          {biz.isActive && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDelete(biz.id, biz.name)}
                              aria-label={`Deactivate ${biz.name}`}
                              title="Deactivate (soft delete)"
                              style={{ color: 'var(--color-error)' }}
                              disabled={isPending}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
