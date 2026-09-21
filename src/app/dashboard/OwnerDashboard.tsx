'use client';

import { useState, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Business, Category, City, State } from '@/lib/types';
import { NIGERIAN_STATES } from '@/lib/nigerianStates';
import { upsertBusiness } from '../admin/actions';
import { uploadMedia, deleteMedia } from '../admin/upload';
import { logout } from '../admin/login/actions';
import styles from './dashboard.module.css';
import { ImagePlus, Trash2, X, Loader2, Eye, Phone, User, LogOut, LayoutDashboard, Lightbulb, Save, CheckCircle, Landmark } from '@/components/Icons';

export default function OwnerDashboard({
  initialBusinesses,
  categories,
  cities,
  states,
  initialTier,
}: {
  initialBusinesses: Business[];
  categories: Category[];
  cities: City[];
  states: State[];
  initialTier?: string;
}) {
  const [businesses] = useState<Business[]>(initialBusinesses);
  const hasBusiness = businesses.length > 0;
  const router = useRouter();
  
  const editingId = hasBusiness ? businesses[0].id : null;

  // Derive initial state from the existing business's city
  const initialStateName = hasBusiness
    ? cities.find(c => c.id === businesses[0].cityId)?.stateName ?? NIGERIAN_STATES[0]?.name ?? ''
    : NIGERIAN_STATES[0]?.name ?? '';
  const [selectedStateName, setSelectedStateName] = useState(initialStateName);
  const filteredCities = cities.filter(c => c.stateName === selectedStateName);

  const [activeTab, setActiveTab] = useState<'profile' | 'myprofile' | 'media' | 'stats' | 'billing'>('profile');
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
    subscriptionTier: businesses[0].subscriptionTier || 'free',
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
    subscriptionTier: (initialTier as 'free' | 'pro' | 'premium') || 'free',
    hours: { Mon: '9am - 5pm', Tue: '9am - 5pm', Wed: '9am - 5pm', Thu: '9am - 5pm', Fri: '9am - 5pm', Sat: 'Closed', Sun: 'Closed' } as Record<string, string>,
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
        subscription_tier: formData.subscriptionTier,
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
              {hasBusiness && (
                <button 
                  className={`${styles.menuItem} ${activeTab === 'myprofile' ? styles.active : ''}`}
                  onClick={() => setActiveTab('myprofile')}
                >
                  <Eye size={18} /> My Public Profile
                </button>
              )}
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
              {hasBusiness && (
                <button 
                  className={`${styles.menuItem} ${activeTab === 'billing' ? styles.active : ''}`}
                  onClick={() => setActiveTab('billing')}
                >
                  <Landmark size={18} /> Billing & Subscription
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
                      <label htmlFor="biz-state" className="form-label">State *</label>
                      <select
                        id="biz-state"
                        className="form-input form-select"
                        value={selectedStateName}
                        onChange={(e) => {
                          const newStateName = e.target.value;
                          setSelectedStateName(newStateName);
                          // Reset city to first city in new state
                          const firstCity = cities.find(c => c.stateName === newStateName);
                          setFormData(prev => ({ ...prev, cityId: firstCity?.id ?? '' }));
                        }}
                        required
                      >
                        <option value="" disabled>Select a state...</option>
                        {NIGERIAN_STATES.map((state) => (
                          <option key={state.slug} value={state.name}>{state.name}</option>
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
                        disabled={!selectedStateName}
                      >
                        {filteredCities.length === 0 ? (
                          <option value="">No cities for selected state</option>
                        ) : (
                          filteredCities.map((city) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))
                        )}
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
                      <p className={styles.sectionSubtitle} style={{ marginBottom: '1rem' }}>
                        {businesses[0]?.subscriptionTier === 'free' 
                          ? 'Free tier limit: Max 5 photos. Upgrade to Pro for unlimited.'
                          : 'Add photos of your work, store, or team.'}
                      </p>
                      
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
                        
                        {businesses[0]?.subscriptionTier !== 'free' || galleryPreviews.length < 5 ? (
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
                                
                                const maxAllowed = businesses[0]?.subscriptionTier === 'free' ? 5 - galleryPreviews.length : files.length;
                                const filesToUpload = Array.from(files).slice(0, maxAllowed);
                                
                                if (filesToUpload.length < files.length) {
                                  showToast('error', 'Free tier is limited to 5 photos. Upgrade for more.');
                                }
                                
                                setUploading(true);
                                for (let i = 0; i < filesToUpload.length; i++) {
                                  const fd = new FormData();
                                  fd.append('file', filesToUpload[i]);
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
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', padding: '1rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-gray-50)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Free tier limit reached.</p>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveTab('billing')}>Upgrade</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'myprofile' && hasBusiness && (() => {
              const biz = businesses[0];
              const waUrl = biz.whatsapp
                ? `https://wa.me/${biz.whatsapp}?text=Hello%20${encodeURIComponent(biz.name)}%2C%20I%20found%20you%20on%20NaijaList!`
                : null;
              const views = biz.pageViews || 0;
              const waClicks = biz.whatsappClicks || 0;
              const convRate = views > 0 ? ((waClicks / views) * 100).toFixed(1) : '0.0';
              const fields = [biz.name, biz.description, biz.phone, biz.whatsapp, biz.email, biz.website, biz.coverImageUrl, biz.address];
              const profileScore = Math.round((fields.filter(Boolean).length / fields.length) * 100);
              const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

              return (
                <>
                  <div className={styles.sectionHeader}>
                    <h1 className={styles.sectionTitle}>My Public Profile</h1>
                    <p className={styles.sectionSubtitle}>This is exactly how customers see your business on NaijaList.</p>
                  </div>

                  {/* Quick actions bar */}
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                    <a
                      href={`/businesses/${biz.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Eye size={15} /> View Live Page
                    </a>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => setActiveTab('media')}
                    >
                      <ImagePlus size={15} /> Change Cover Photo
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => setActiveTab('profile')}
                    >
                      <Save size={15} /> Edit Profile Details
                    </button>
                  </div>

                  {/* Profile card preview */}
                  <div style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-md)' }}>
                    {/* Cover image */}
                    <div style={{ position: 'relative', height: '200px', background: biz.coverImageUrl ? 'transparent' : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))' }}>
                      {biz.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={biz.coverImageUrl} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-primary-dark)', gap: '0.5rem' }}>
                          <ImagePlus size={40} style={{ opacity: 0.6 }} />
                          <span style={{ fontWeight: 600, opacity: 0.8 }}>No cover image yet</span>
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => setActiveTab('media')}>Upload Cover Photo</button>
                        </div>
                      )}
                      {biz.isFeatured && (
                        <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#f59e0b', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>⭐ Featured</span>
                      )}
                    </div>

                    {/* Business info */}
                    <div style={{ padding: 'var(--space-6)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                          {biz.categoryName}
                        </span>
                        {biz.verificationTier !== 'none' && (
                          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>{biz.name}</h2>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        📍 {biz.address}, {biz.cityName}, {biz.stateName}
                      </p>
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>{biz.description}</p>

                      {/* Contact buttons preview */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {waUrl && (
                          <span style={{ background: '#25D366', color: 'white', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            💬 Chat on WhatsApp
                          </span>
                        )}
                        <span style={{ border: '1px solid var(--color-border)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          📞 {biz.phone}
                        </span>
                        {biz.email && (
                          <span style={{ border: '1px solid var(--color-border)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✉️ Send Email
                          </span>
                        )}
                        {biz.website && (
                          <span style={{ border: '1px solid var(--color-border)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🌐 Visit Website
                          </span>
                        )}
                      </div>

                      {/* Hours */}
                      {biz.hours && (
                        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1.25rem' }}>
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>Business Hours</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 1.5rem' }}>
                            {DAY_ORDER.map(day => {
                              const h = (biz.hours as Record<string, string>)?.[day];
                              return (
                                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                  <span style={{ fontWeight: 600 }}>{day}</span>
                                  <span style={{ color: h === 'Closed' ? '#ef4444' : 'var(--color-primary)' }}>{h || '—'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gallery preview */}
                  {biz.gallery && biz.gallery.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>📸 Shared Media ({biz.gallery.length} photo{biz.gallery.length !== 1 ? 's' : ''})</h2>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveTab('media')}>Manage Media</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
                        {biz.gallery.map((url, i) => (
                          <div key={i} style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border-light)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Media ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mini analytics */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>📊 Quick Analytics</h2>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveTab('stats')}>Full Analytics →</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
                      {[
                        { label: 'Profile Views', value: views, icon: '👁️', color: '#3b82f6' },
                        { label: 'WhatsApp Clicks', value: waClicks, icon: '💬', color: '#22c55e' },
                        { label: 'Conversion Rate', value: `${convRate}%`, icon: '📈', color: '#f59e0b' },
                        { label: 'Profile Score', value: `${profileScore}%`, icon: '⭐', color: '#8b5cf6' },
                      ].map(stat => (
                        <div key={stat.label} style={{ background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontWeight: 600 }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {activeTab === 'stats' && hasBusiness && (() => {
              const biz = businesses[0];
              const views = biz.pageViews || 0;
              const waClicks = biz.whatsappClicks || 0;
              const convRate = views > 0 ? ((waClicks / views) * 100).toFixed(1) : '0.0';
              const fields = [biz.name, biz.description, biz.phone, biz.whatsapp, biz.email, biz.website, biz.coverImageUrl, biz.address];
              const filled = fields.filter(Boolean).length;
              const profileScore = Math.round((filled / fields.length) * 100);
              const trendWeights = [0.08, 0.10, 0.12, 0.14, 0.18, 0.16, 0.22];
              const dailyViews = trendWeights.map(w => Math.round(views * w));
              const maxDay = Math.max(...dailyViews, 1);
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

              return (
                <>
                  <div className={styles.sectionHeader}>
                    <h1 className={styles.sectionTitle}>Analytics & Insights</h1>
                    <p className={styles.sectionSubtitle}>See how your listing is performing on NaijaList.</p>
                  </div>

                  {/* KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                    {[
                      { label: 'Profile Views', value: views, icon: '👁️', color: '#3b82f6', bg: '#eff6ff', hint: 'Total times your listing was viewed' },
                      { label: 'WhatsApp Clicks', value: waClicks, icon: '💬', color: '#22c55e', bg: '#f0fdf4', hint: 'Customers who tapped your WhatsApp button' },
                      { label: 'Conversion Rate', value: `${convRate}%`, icon: '📈', color: '#f59e0b', bg: '#fffbeb', hint: 'Views that became WhatsApp contacts' },
                      { label: 'Profile Score', value: `${profileScore}%`, icon: '⭐', color: '#8b5cf6', bg: '#f5f3ff', hint: 'How complete your business profile is' },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        background: stat.bg,
                        border: `1px solid ${stat.color}22`,
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stat.color }}>{stat.label}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.hint}</span>
                      </div>
                    ))}
                  </div>

                  {/* 7-Day Bar Chart */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
                      📊 Estimated 7-Day View Distribution
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: '140px', padding: '0 var(--space-2)' }}>
                      {days.map((day, i) => (
                        <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)' }}>{dailyViews[i]}</span>
                          <div style={{
                            width: '100%',
                            height: `${(dailyViews[i] / maxDay) * 100}%`,
                            minHeight: '4px',
                            background: i === 6 ? 'var(--color-primary)' : `var(--color-primary)66`,
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 0.4s ease',
                          }} />
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{day}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
                      * Distribution estimated from total view count. Day-by-day tracking coming soon.
                    </p>
                  </div>

                  {/* Profile Strength */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                      ⭐ Profile Strength — {profileScore}%
                    </h2>
                    <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '10px', marginBottom: 'var(--space-4)' }}>
                      <div style={{ height: '100%', width: `${profileScore}%`, background: profileScore >= 75 ? 'var(--color-primary)' : profileScore >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                      {[
                        { label: 'Business name', done: !!biz.name },
                        { label: 'Description', done: !!biz.description },
                        { label: 'Phone number', done: !!biz.phone },
                        { label: 'WhatsApp number', done: !!biz.whatsapp },
                        { label: 'Email address', done: !!biz.email },
                        { label: 'Website link', done: !!biz.website },
                        { label: 'Cover image', done: !!biz.coverImageUrl },
                        { label: 'Physical address', done: !!biz.address },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: item.done ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                          <span>{item.done ? '✅' : '⬜'}</span>
                          <span style={{ fontWeight: item.done ? 600 : 400 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', marginBottom: 'var(--space-3)' }}>
                      💡 Tips to Get More Customers
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {([
                        !biz.coverImageUrl && 'Add a cover photo — listings with images get 3× more views.',
                        !biz.whatsapp && 'Add your WhatsApp number so customers can contact you instantly.',
                        !biz.website && 'Add your website link to build more credibility.',
                        !biz.email && 'Add an email address for customers who prefer email.',
                        profileScore < 100 && 'Complete your profile to 100% to rank higher in search results.',
                      ] as (string | false)[]).filter((t): t is string => Boolean(t)).slice(0, 4).map((tip, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#166534' }}>
                          <span>→</span><span>{tip}</span>
                        </li>
                      ))}
                      {profileScore === 100 && (
                        <li style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>🎉 Your profile is 100% complete! You are set for maximum visibility.</li>
                      )}
                    </ul>
                  </div>
                </>
              );
            })()}

            {activeTab === 'billing' && hasBusiness && (() => {
              const biz = businesses[0];
              const tier = formData.subscriptionTier || 'free';
              
              const tiers = [
                { id: 'free', name: 'Free Listing', price: 'Free', features: ['5 Photos', 'Basic Listing', 'Customer Reviews'] },
                { id: 'pro', name: 'Pro Tier', price: '₦10,000 /mo', features: ['Unlimited Photos', 'Higher Search Ranking', 'Verified Badge', 'Promo Posts'] },
                { id: 'premium', name: 'Premium Tier', price: '₦25,000 /mo', features: ['All Pro Features', 'Top Search Placement', 'Analytics Dashboard', 'Priority Support'] }
              ];
              
              const handleUpgrade = (selectedTier: string) => {
                if (tier === selectedTier) return;
                setFormData({ ...formData, subscriptionTier: selectedTier as 'free' | 'pro' | 'premium' });
                
                // Save it immediately
                startTransition(async () => {
                  const dbData = {
                    id: editingId!,
                    subscription_tier: selectedTier
                  };
                  const result = await upsertBusiness(dbData);
                  if (result.error) {
                    showToast('error', 'Failed to update subscription');
                  } else {
                    showToast('success', `Successfully updated to ${selectedTier.toUpperCase()} tier!`);
                    router.refresh();
                  }
                });
              };
              
              return (
                <>
                  <div className={styles.sectionHeader}>
                    <h1 className={styles.sectionTitle}>Billing & Subscription</h1>
                    <p className={styles.sectionSubtitle}>Manage your plan and features.</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    {tiers.map(t => (
                      <div key={t.id} style={{ 
                        border: tier === t.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)', 
                        borderRadius: 'var(--radius-xl)', 
                        padding: 'var(--space-6)', 
                        background: 'white', 
                        display: 'flex', flexDirection: 'column', 
                        boxShadow: tier === t.id ? 'var(--shadow-md)' : 'var(--shadow-sm)' 
                      }}>
                        {tier === t.id && <span style={{ background: 'var(--color-primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>Current Plan</span>}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{t.name}</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', margin: '0 0 1rem' }}>{t.price}</p>
                        
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', flex: 1 }}>
                          {t.features.map((f, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                              <span style={{ color: 'var(--color-primary)' }}>✓</span> {f}
                            </li>
                          ))}
                        </ul>
                        
                        <button 
                          className={`btn ${tier === t.id ? 'btn-outline' : 'btn-primary'}`} 
                          style={{ width: '100%', opacity: tier === t.id ? 0.5 : 1 }} 
                          disabled={tier === t.id || isPending}
                          onClick={() => handleUpgrade(t.id)}
                        >
                          {isPending && tier !== t.id ? 'Updating...' : tier === t.id ? 'Active' : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </main>
        </div>
      </div>
    </div>
  );
}
