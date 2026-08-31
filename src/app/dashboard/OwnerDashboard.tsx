'use client';

import { useState, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Business, Category, City } from '@/lib/types';
import { upsertBusiness } from '../admin/actions';
import { uploadMedia, deleteMedia } from '../admin/upload';
import { logout } from '../admin/login/actions';
import styles from './dashboard.module.css';
import { ImagePlus, Trash2, X, Loader2, Eye, Phone, User, LogOut, LayoutDashboard, Lightbulb, Save, CheckCircle } from '@/components/Icons';

export default function OwnerDashboard({
  initialBusinesses,
  categories,
  cities,
}: {
  initialBusinesses: Business[];
  categories: Category[];
  cities: City[];
}) {
  const [businesses] = useState<Business[]>(initialBusinesses);
  const hasBusiness = businesses.length > 0;
  const router = useRouter();
  
  const editingId = hasBusiness ? businesses[0].id : null;
  const [activeTab, setActiveTab] = useState<'profile' | 'media' | 'stats'>('profile');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };
  
  const [coverPreview, setCoverPreview] = useState<string | null>(
    hasBusiness ? businesses[0].coverImageUrl || null : null
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    hasBusiness ? businesses[0].gallery || [] : []
  );
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const defaultFormData = hasBusiness ? {
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
    hours: (businesses[0].hours as Record<string, string>) || { Mon: '9am - 5pm', Tue: '9am - 5pm', Wed: '9am - 5pm', Thu: '9am - 5pm', Fri: '9am - 5pm', Sat: 'Closed', Sun: 'Closed' },
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
    hours: { Mon: '9am - 5pm', Tue: '9am - 5pm', Wed: '9am - 5pm', Thu: '9am - 5pm', Fri: '9am - 5pm', Sat: 'Closed', Sun: 'Closed' },
  };

  const [formData, setFormData] = useState(defaultFormData);
  
  const slugify = (text: string): string =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
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
        hours: formData.hours,
      };

      const result = await upsertBusiness(dbData);
      
      if (result.error) {
        showToast('error', 'Error saving profile: ' + result.error);
      } else {
        showToast('success', `Profile saved successfully!`);
        if (!editingId) {
          // It was created, need to refresh to get ID for media
          router.refresh();
        }
      }
    });
  }, [editingId, formData, router]);

  return (
    <div className={styles.page}>
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
          {toast.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.35rem' }} /> : <X size={16} style={{ marginRight: '0.35rem' }} />} {toast.msg}
        </div>
      )}

      <div className="container">
        <div className={styles.dashboardContainer}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>My Dashboard</h2>
            <nav className={styles.sidebarMenu}>
              <button 
                className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Business Profile
              </button>
              <button 
                className={`${styles.menuItem} ${activeTab === 'media' ? styles.active : ''}`}
                onClick={() => setActiveTab('media')}
              >
                <ImagePlus size={18} /> Media & Gallery
              </button>
              {hasBusiness && (
                <button 
                  className={`${styles.menuItem} ${activeTab === 'stats' ? styles.active : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  <LayoutDashboard size={18} /> Analytics & Stats
                </button>
              )}
              <hr style={{ margin: 'var(--space-2) 0', border: '0', borderTop: '1px solid var(--color-border-light)' }} />
              {hasBusiness && (
                <a 
                  href={`/businesses/${businesses[0].slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.menuItem}
                >
                  <Eye size={18} /> View Public Profile
                </a>
              )}
              <form action={logout}>
                <button type="submit" className={styles.menuItem} style={{ width: '100%', color: 'var(--color-error)' }}>
                  <LogOut size={18} /> Log out
                </button>
              </form>
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {activeTab === 'profile' && (
              <>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.sectionTitle}>Business Profile</h1>
                  <p className={styles.sectionSubtitle}>Update your business information and contact details.</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label htmlFor="biz-name" className="form-label">Business Name *</label>
                      <input
                        id="biz-name"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
                        required minLength={3}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="biz-slug" className="form-label">URL Slug</label>
                      <input
                        id="biz-slug"
                        className="form-input"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        disabled={hasBusiness} // prevent changing once created to avoid broken links
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
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                    <div className={`form-group ${styles.fullWidth}`}>
                      <label htmlFor="biz-address" className="form-label">Address *</label>
                      <input
                        id="biz-address"
                        className="form-input"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
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
                        placeholder="2348012345678 (no +)"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="biz-email" className="form-label">Email Address</label>
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
                    <div className={`form-group ${styles.fullWidth}`}>
                      <label htmlFor="biz-description" className="form-label">Business Description *</label>
                      <textarea
                        id="biz-description"
                        className="form-input form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        minLength={20}
                        rows={5}
                      />
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className={styles.sectionHeader} style={{ marginTop: 'var(--space-8)' }}>
                    <h2 className={styles.sectionTitle} style={{ fontSize: '1.25rem' }}>Business Hours</h2>
                    <p className={styles.sectionSubtitle}>Set your availability for each day (e.g. &quot;9am - 5pm&quot; or &quot;Closed&quot;).</p>
                  </div>
                  
                  <div className={styles.formGrid}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div className="form-group" key={day}>
                        <label htmlFor={`hours-${day}`} className="form-label">{day}</label>
                        <input
                          id={`hours-${day}`}
                          className="form-input"
                          value={formData.hours[day as keyof typeof formData.hours]}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            hours: { ...formData.hours, [day]: e.target.value } 
                          })}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={isPending}>
                      {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {editingId ? 'Save Profile' : 'Create Profile'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'media' && (
              <>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.sectionTitle}>Media & Gallery</h1>
                  <p className={styles.sectionSubtitle}>Upload photos to showcase your business to customers.</p>
                </div>
                
                {!editingId ? (
                  <div style={{ padding: '2rem', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-primary-dark)' }}>
                    <Lightbulb size={24} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600 }}>Create your business profile first!</p>
                    <p style={{ opacity: 0.8 }}>You need to fill out and save your profile details before you can upload media.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                      <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cover Image</label>
                      <p className={styles.sectionSubtitle} style={{ marginBottom: '1rem' }}>This is the main image displayed on your profile and in search results.</p>
                      
                      {coverPreview ? (
                        <div className={styles.mediaPreview} style={{ maxWidth: '300px' }}>
                          <img src={coverPreview} alt="Cover" />
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
                            <Trash2 size={24} /> <span>Remove Cover Image</span>
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
                            else if (res.error) showToast('error', res.error);
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
                              else if (res.error) showToast('error', res.error);
                              setUploading(false);
                            }}
                          />
                          <div className={styles.dropzoneContent}>
                            {uploading ? <Loader2 size={32} className="animate-spin" /> : <ImagePlus size={32} />}
                            <p>{uploading ? 'Uploading...' : 'Click or drag to upload cover image'}</p>
                            <small>Max 50MB • JPG, PNG, WebP</small>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Gallery Images</label>
                      <p className={styles.sectionSubtitle} style={{ marginBottom: '1rem' }}>Add up to 10 photos of your work, store, or team.</p>
                      
                      <div className={styles.mediaGrid}>
                        {galleryPreviews.map((url, i) => (
                          <div key={i} className={styles.mediaPreview}>
                            {url.match(/\.(mp4|webm|mov)$/i) ? (
                              <video src={url} controls />
                            ) : (
                              <img src={url} alt={`Gallery ${i + 1}`} />
                            )}
                            <button
                              type="button"
                              className={styles.deleteOverlay}
                              disabled={uploading}
                              onClick={async () => {
                                setUploading(true);
                                await deleteMedia(url, editingId, 'gallery');
                                setGalleryPreviews(prev => prev.filter(g => g !== url));
                                setUploading(false);
                              }}
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>
                        ))}
                        
                        <div
                          className={styles.dropzone}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px', padding: '1rem' }}
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
                                else if (res.error) showToast('error', res.error);
                              }
                              setUploading(false);
                            }}
                          />
                          <div className={styles.dropzoneContent}>
                            {uploading ? <Loader2 size={24} className="animate-spin" /> : <ImagePlus size={24} />}
                            <p style={{ fontSize: '0.85rem' }}>{uploading ? '...' : 'Add More'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'stats' && hasBusiness && (
              <>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.sectionTitle}>Analytics</h1>
                  <p className={styles.sectionSubtitle}>See how your business listing is performing on NaijaList.</p>
                </div>
                
                <div className={styles.statsRow}>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{businesses[0].pageViews || 0}</span>
                    <span className={styles.statLabel}><Eye size={16} /> Profile Views</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{businesses[0].whatsappClicks || 0}</span>
                    <span className={styles.statLabel}><Phone size={16} /> WhatsApp Clicks</span>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
