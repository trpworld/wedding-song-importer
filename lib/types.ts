export interface SongItem {
  ritualName: string;
  url: string;
  notes?: string;
}

export interface Submission {
  id: string;
  client_name: string;
  event_date: string;
  phone?: string;
  general_notes?: string;
  songs: SongItem[];
  status: 'pending' | 'New' | 'Downloading' | 'Completed' | 'Error';
  is_downloaded: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BengaliRitual {
  id: string;
  name: string;
  englishTag: string;
  category: 'pre_wedding' | 'wedding_ceremony' | 'post_wedding_reception';
}

export interface RitualCategoryGroup {
  id: 'pre_wedding' | 'wedding_ceremony' | 'post_wedding_reception';
  title: string;
  subtitle: string;
  icon: string;
  rituals: BengaliRitual[];
}

export const BENGALI_RITUAL_GROUPS: RitualCategoryGroup[] = [
  {
    id: 'pre_wedding',
    title: '🌿 Pre-Wedding Rituals (বিয়ের পূর্ব মুহূর্ত)',
    subtitle: 'মেহেন্দি, আশীর্বাদ, গায়ে হলুদ ও সকালের প্রস্তুতি',
    icon: '🌿',
    rituals: [
      { id: '1', name: '💚 মেহেন্দি (Mehndi)', englishTag: 'Mehndi', category: 'pre_wedding' },
      { id: '2', name: '🙏 আশীর্বাদ (Ashirbad)', englishTag: 'Ashirbad', category: 'pre_wedding' },
      { id: '3', name: '🌅 সকালের স্পেশাল মুহূর্ত (Morning Special Moments)', englishTag: 'Morning Special', category: 'pre_wedding' },
      { id: '4', name: '🌾 বৃদ্ধি (Briddhi)', englishTag: 'Briddhi', category: 'pre_wedding' },
      { id: '5', name: '💧 জল সওয়া (Jal Sawa)', englishTag: 'Jal Sawa', category: 'pre_wedding' },
      { id: '6', name: '💛 গায়ে হলুদ (Gaye Holud)', englishTag: 'Gaye Holud', category: 'pre_wedding' },
    ],
  },
  {
    id: 'wedding_ceremony',
    title: '💍 Wedding Ceremony (বিয়ের মূল অনুষ্ঠান)',
    subtitle: 'বরযাত্রা, পান পাতা সরানো, হস্ত বন্ধন ও সিঁদুর দান',
    icon: '💍',
    rituals: [
      { id: '7', name: '🏛️ ভেন্যু ভিডিও (Venue Cinematic)', englishTag: 'Venue Cinematic', category: 'wedding_ceremony' },
      { id: '8', name: '🎺 বরযাত্রা (Barjatri / Barat)', englishTag: 'Barjatri', category: 'wedding_ceremony' },
      { id: '9', name: '🌸 বর বরণ (Bor Boron)', englishTag: 'Bor Boron', category: 'wedding_ceremony' },
      { id: '10', name: '👰 কনের স্পেশাল মুহূর্ত (Bride Special Moments)', englishTag: 'Bride Special', category: 'wedding_ceremony' },
      { id: '11', name: '👨‍👩‍👧‍👦 আত্মীয়-স্বজন / গ্রুপ ভিডিও (Relatives & Group Moments)', englishTag: 'Relatives Group', category: 'wedding_ceremony' },
      { id: '12', name: '🎁 বস্ত্র দান (Bastra Daan)', englishTag: 'Bastra Daan', category: 'wedding_ceremony' },
      { id: '13', name: '🍃 সাত পাক পান পাতা সরানো (Saat Paak & Pan Pata Sorano)', englishTag: 'Saat Paak', category: 'wedding_ceremony' },
      { id: '14', name: '❤️ হস্ত বন্ধন ও সিঁদুর দান (Hasta Bandhan & Sindoor Daan)', englishTag: 'Sindoor Daan', category: 'wedding_ceremony' },
      { id: '15', name: '✨ বিয়ের পরে দুজনের স্পেশাল মুহূর্ত (Post-Ceremony Couple Moments)', englishTag: 'Post Ceremony Couple', category: 'wedding_ceremony' },
    ],
  },
  {
    id: 'post_wedding_reception',
    title: '🌸 Post Wedding & Reception (বিদায়, ভাত কাপড় ও গ্র্যান্ড রিসেপশন)',
    subtitle: 'মেয়ে বিদায়, বধূবরণ, এন্ট্রি, ডান্স ও রিসেপশন নাইট',
    icon: '🌸',
    rituals: [
      { id: '16', name: '😢 মেয়ে বিদায় (Kanya Biday)', englishTag: 'Kanya Biday', category: 'post_wedding_reception' },
      { id: '17', name: '🏡 বধূবরণ (Bodhu Boron)', englishTag: 'Bodhu Boron', category: 'post_wedding_reception' },
      { id: '18', name: '🍚 ভাত কাপড় (Bhat Kapor)', englishTag: 'Bhat Kapor', category: 'post_wedding_reception' },
      { id: '19', name: '🎉 দুজনের ভেন্যুতে এন্ট্রি (Couple Reception Entry)', englishTag: 'Couple Entry', category: 'post_wedding_reception' },
      { id: '20', name: '👨‍👩‍👧‍👦 গ্রুপ ভিডিও (Reception Group Shots)', englishTag: 'Reception Group', category: 'post_wedding_reception' },
      { id: '21', name: '🍽️ খাবার ব্যাচ (Dinner / Buffet Highlights)', englishTag: 'Dinner Highlights', category: 'post_wedding_reception' },
      { id: '22', name: '💃 ডান্স / নাচানাচি (Dance & Party Beats)', englishTag: 'Dance Beats', category: 'post_wedding_reception' },
      { id: '23', name: '🎭 অডিয়েন্স / অতিথিদের মুহূর্ত (Guests & Audience Candids)', englishTag: 'Guests Candids', category: 'post_wedding_reception' },
      { id: '24', name: '💕 দুজনের স্পেশাল মুহূর্ত (Couple Romantic Moments)', englishTag: 'Couple Romantic', category: 'post_wedding_reception' },
      { id: '25', name: '🌙 বাসর ঘর (Bashor Ghor)', englishTag: 'Bashor Ghor', category: 'post_wedding_reception' },
    ],
  },
];

export const DEFAULT_RITUALS = BENGALI_RITUAL_GROUPS.flatMap(g => g.rituals.map(r => r.name));
