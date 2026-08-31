import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  const updates = [
    { name: 'Food & Restaurants', icon: 'fa-solid fa-utensils' },
    { name: 'Retail & Shopping', icon: 'fa-solid fa-bag-shopping' },
    { name: 'Health & Wellness', icon: 'fa-solid fa-notes-medical' },
    { name: 'Professional Services', icon: 'fa-solid fa-user-tie' },
    { name: 'Auto & Transport', icon: 'fa-solid fa-car' },
    { name: 'Home Services', icon: 'fa-solid fa-house-chimney' },
    { name: 'Beauty & Personal Care', icon: 'fa-solid fa-spa' },
    { name: 'Education & Tutoring', icon: 'fa-solid fa-graduation-cap' },
    { name: 'Hotels & Lodging', icon: 'fa-solid fa-hotel' },
    { name: 'Events & Entertainment', icon: 'fa-solid fa-champagne-glasses' },
    { name: 'Finance & Insurance', icon: 'fa-solid fa-building-columns' },
    { name: 'Tech & Digital Services', icon: 'fa-solid fa-laptop-code' }
  ];

  for (const up of updates) {
    const { error } = await supabase.from('categories').update({ icon: up.icon }).eq('name', up.name);
    if (error) console.error(error);
  }

  return NextResponse.json({ success: true });
}
