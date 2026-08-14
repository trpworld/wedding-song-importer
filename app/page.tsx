'use client';

import { useState, useEffect } from 'react';
import { BENGALI_RITUAL_GROUPS, BengaliRitual, SongItem } from '@/lib/types';
import {
  CheckCircle2,
  Clipboard,
  Plus,
  Trash2,
  Calendar,
  User,
  Music,
  Send,
  Sparkles,
  AlertCircle,
  Clock,
  Heart,
  Phone,
  FileText,
  MessageSquareHeart,
  Info,
  Edit2,
  Globe,
} from 'lucide-react';

interface FormSongTrack {
  id: string;
  url: string;
}

interface FormRitualCard {
  id: string;
  ritualName: string;
  englishTag: string;
  category: string;
  songs: FormSongTrack[];
  notes: string;
  isCollapsed?: boolean;
}

const TRANSLATIONS = {
  bn: {
    headerTitle: 'বিবাহের গান নির্বাচন ফর্ম',
    headerSubtitle: 'আপনার প্রতিটি শুভ মুহূর্তকে নিখুঁত সঙ্গীতে সাজান',
    studioTag: 'স্টুডিও আইডি:',
    langBtn: '🇬🇧 English',
    coupleSectionTitle: 'বর ও কনের বিবরণ (Couple Information)',
    coupleNameLabel: 'বরের নাম ও কনের নাম',
    coupleNamePlaceholder: 'যেমন: রাহুল ও পূজা',
    eventDateLabel: 'বিয়ের তারিখ (Event Date)',
    phoneLabel: 'ফোন / হোয়াটসঅ্যাপ নম্বর',
    phonePlaceholder: 'উদাহরণ: 9876543210',
    generalNotesLabel: 'সামগ্রিক বিশেষ নির্দেশাবলী (ঐচ্ছিক)',
    generalNotesPlaceholder: 'সম্পাদকের জন্য আপনার কোনো বিশেষ অনুরোধ বা থিম নোট...',
    instructionTitle: '📌 নির্দেশনা (Instructions):',
    instructionStep1: '১. ইউটিউব / স্পোটিফাই বা অডিও লিংকের ইউআরএল কপি করে বক্সে পেস্ট করুন।',
    instructionStep2: '২. যদি কোনো নির্দিষ্ট সময় থেকে গান বাজাতে চান, টাইমস্ট্যাম্প (যেমন: 01:25) নোটে উল্লেখ করুন।',
    instructionStep3: '৩. কোনো পর্ব বাদ দিতে চাইলে খালি রাখুন।',
    preWeddingCategory: '💛 Pre-Wedding Ceremonies (আইবুড়ো ভাত, গায়ে হলুদ & মেহেন্দি)',
    weddingCategory: '💍 Wedding Ceremony & Rituals (মূল বিবাহ অনুষ্ঠান)',
    postWeddingCategory: '🌸 Post Wedding & Reception (বিদায়, ভাত কাপড় ও রিসেপশন)',
    customCategory: '✨ কাস্টম পর্ব (Custom Rituals)',
    addSongBtn: '+ আরও গান যোগ করুন',
    notesLabel: '✂️ কাট নোটস / বিশেষ টাইমস্ট্যাম্প (ঐচ্ছিক):',
    notesPlaceholder: 'যেমন: "০২:১৫ সেকেন্ড থেকে শুরু করুন" অথবা "রিফ্রেন পার্টটা ব্যাকগ্রাউন্ডে দিন"...',
    addCustomRitualBtn: '➕ নতুন কোনো পর্ব যোগ করুন',
    customRitualModalTitle: 'নতুন পর্ব যোগ করুন',
    customRitualNamePlaceholder: 'পর্বের নাম (যেমন: সংগীত নাইট, রিং এক্সচেঞ্জ)',
    cancelBtn: 'বাতিল',
    confirmAddBtn: 'যোগ করুন',
    submitBtn: '✨ গান জমা দিন',
    submittingBtn: 'জমা দেওয়া হচ্ছে...',
    addedBadge: 'যুক্ত হয়েছে',
    editBtn: 'পরিবর্তন',
    removeBtn: 'গান বাদ দিন',
    successTitle: 'আপনার গানের তালিকা সফলভাবে সাবমিট হয়েছে! 🎉',
    successSub: 'ধন্যবাদ! আপনাদের পছন্দের গানগুলো আমাদের Wedding Film Editing টিমের কাছে নিরাপদে পৌঁছে গেছে। ❤️',
    submitAnotherBtn: '🔄 নতুন ফর্ম জমা দিন',
    validationError: 'অনুগ্রহ করে বর-কনের নাম এবং অন্তত একটি বৈধ ইউটিউব/অডিও গান যুক্ত করুন।',
  },
  en: {
    headerTitle: 'Wedding Song Selection Form',
    headerSubtitle: 'Curate the perfect soundtrack for every special moment of your wedding',
    studioTag: 'Studio ID:',
    langBtn: '🇮🇳 বাংলা',
    coupleSectionTitle: 'Groom & Bride Details',
    coupleNameLabel: 'Groom & Bride Name',
    coupleNamePlaceholder: 'e.g. Rahul & Puja',
    eventDateLabel: 'Event Date',
    phoneLabel: 'Phone / WhatsApp Number',
    phonePlaceholder: 'e.g. 9876543210',
    generalNotesLabel: 'General Special Instructions (Optional)',
    generalNotesPlaceholder: 'Any general theme notes or specific requests for the editor...',
    instructionTitle: '📌 Instructions:',
    instructionStep1: '1. Copy & paste your YouTube / Spotify / Audio link into the box.',
    instructionStep2: '2. Mention specific timestamps (e.g. 01:25) in notes if needed.',
    instructionStep3: '3. Leave unneeded ritual boxes empty.',
    preWeddingCategory: '💛 Pre-Wedding Ceremonies (Aiburobhat, Gaye Holud & Mehendi)',
    weddingCategory: '💍 Wedding Ceremony & Rituals (Main Marriage Ceremony)',
    postWeddingCategory: '🌸 Post Wedding & Reception (Biday, Bhat Kapor & Reception Night)',
    customCategory: '✨ Custom Ceremonies',
    addSongBtn: '+ Add Another Song',
    notesLabel: '✂️ Cut Notes / Timestamp Requests (Optional):',
    notesPlaceholder: 'e.g. "Start from 02:15 timestamp" or "Use instrumental loop in background"...',
    addCustomRitualBtn: '➕ Add Custom Ritual',
    customRitualModalTitle: 'Add Custom Ritual',
    customRitualNamePlaceholder: 'Ritual Name (e.g. Sangeet Night, Ring Exchange)',
    cancelBtn: 'Cancel',
    confirmAddBtn: 'Add Ritual',
    submitBtn: '✨ Submit Playlist',
    submittingBtn: 'Submitting Playlist...',
    addedBadge: 'Song Added',
    editBtn: 'Edit',
    removeBtn: 'Clear Song',
    successTitle: 'Your songs have been submitted! 🎉',
    successSub: 'Thank you! We have received your selected tracks. They will be imported into Premiere Pro as editing begins.',
    submitAnotherBtn: '🔄 Submit Another Playlist',
    validationError: 'Please provide Groom & Bride Name and at least one valid song link.',
  },
};

export default function ClientSubmissionPage({ studioId = 'trpworld' }: { studioId?: string } = {}) {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('wedding_form_lang');
    if (savedLang === 'en' || savedLang === 'bn') {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    localStorage.setItem('wedding_form_lang', nextLang);
  };

  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [phone, setPhone] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  // Initialize form state with default rituals
  const [rituals, setRituals] = useState<FormRitualCard[]>(() =>
    BENGALI_RITUAL_GROUPS.flatMap((group) =>
      group.rituals.map((r) => ({
        id: `ritual-${r.id}`,
        ritualName: r.name,
        englishTag: r.englishTag,
        category: r.category,
        songs: [{ id: `song-${r.id}-1`, url: '' }],
        notes: '',
        isCollapsed: false,
      }))
    )
  );

  useEffect(() => {
    async function loadStudioTemplate() {
      try {
        const res = await fetch(`/api/templates?studioId=${encodeURIComponent(studioId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const customCards: FormRitualCard[] = json.data.map((r: any, idx: number) => ({
            id: `ritual-custom-${r.id || idx}`,
            ritualName: r.name,
            englishTag: r.englishTag || 'Custom',
            category: r.category || 'wedding_ceremony',
            songs: [{ id: `song-custom-${r.id || idx}-1`, url: '' }],
            notes: '',
            isCollapsed: false,
          }));
          setRituals(customCards);
        }
      } catch (e) {
        console.error('Error fetching studio template:', e);
      }
    }
    loadStudioTemplate();
  }, [studioId]);

  const [customRitualName, setCustomRitualName] = useState('');
  const [showAddRitualModal, setShowAddRitualModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  // Validate URL pattern
  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Handle URL change with smart auto-collapsing
  const handleUrlChange = (ritualId: string, songId: string, url: string) => {
    const trimmed = url.trim();
    const isUrlValid = isValidUrl(trimmed);

    setRituals((prev) =>
      prev.map((card) => {
        if (card.id === ritualId) {
          const updatedSongs = card.songs.map((s) => (s.id === songId ? { ...s, url } : s));
          return {
            ...card,
            songs: updatedSongs,
            isCollapsed: isUrlValid ? true : card.isCollapsed,
          };
        }
        return card;
      })
    );
  };

  // Handle Paste from Clipboard
  const handlePaste = async (ritualId: string, songId: string) => {
    setClipboardNotice(null);
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setClipboardNotice('Clipboard read not supported. Please paste manually.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUrlChange(ritualId, songId, text.trim());
      }
    } catch (err) {
      console.warn('Clipboard permission error:', err);
      setClipboardNotice('Clipboard access denied. Please paste manually.');
    }
  };

  // Add another song to a ritual card
  const handleAddSongToRitual = (ritualId: string) => {
    setRituals((prev) =>
      prev.map((card) => {
        if (card.id === ritualId) {
          return {
            ...card,
            songs: [...card.songs, { id: `song-${Date.now()}-${card.songs.length + 1}`, url: '' }],
            isCollapsed: false,
          };
        }
        return card;
      })
    );
  };

  // Remove a song from a ritual card
  const handleRemoveSongFromRitual = (ritualId: string, songId: string) => {
    setRituals((prev) =>
      prev.map((card) => {
        if (card.id === ritualId && card.songs.length > 1) {
          const filtered = card.songs.filter((s) => s.id !== songId);
          const hasRemainingValidSong = filtered.some((s) => isValidUrl(s.url));
          return {
            ...card,
            songs: filtered,
            isCollapsed: hasRemainingValidSong,
          };
        }
        return card;
      })
    );
  };

  // Handle Notes change
  const handleNotesChange = (ritualId: string, notes: string) => {
    setRituals((prev) =>
      prev.map((card) => (card.id === ritualId ? { ...card, notes } : card))
    );
  };

  // Edit Control (Expands collapsed card)
  const handleEditCard = (ritualId: string) => {
    setRituals((prev) =>
      prev.map((card) => (card.id === ritualId ? { ...card, isCollapsed: false } : card))
    );
  };

  // Clear / Remove Control (Resets card and expands)
  const handleClearCard = (ritualId: string) => {
    setRituals((prev) =>
      prev.map((card) => {
        if (card.id === ritualId) {
          return {
            ...card,
            songs: [{ id: `song-${card.id}-reset`, url: '' }],
            notes: '',
            isCollapsed: false,
          };
        }
        return card;
      })
    );
  };

  // Delete custom ritual card
  const handleDeleteRitual = (ritualId: string) => {
    setRituals((prev) => prev.filter((card) => card.id !== ritualId));
  };

  // Add custom ritual card
  const handleAddCustomRitual = () => {
    if (!customRitualName.trim()) return;
    const newCard: FormRitualCard = {
      id: `custom-${Date.now()}`,
      ritualName: `✨ ${customRitualName.trim()}`,
      englishTag: customRitualName.trim(),
      category: 'post_wedding_reception',
      songs: [{ id: `song-custom-${Date.now()}`, url: '' }],
      notes: '',
      isCollapsed: false,
    };
    setRituals((prev) => [...prev, newCard]);
    setCustomRitualName('');
    setShowAddRitualModal(false);
  };

  // Calculate total valid songs filled across all rituals
  const totalValidSongs = rituals.reduce((acc, card) => {
    return acc + card.songs.filter((s) => isValidUrl(s.url)).length;
  }, 0);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim()) {
      setErrorMessage(t.validationError);
      return;
    }
    if (!eventDate) {
      setErrorMessage(t.validationError);
      return;
    }

    const validSongsPayload: SongItem[] = [];

    rituals.forEach((card) => {
      const validTracks = card.songs.filter((s) => isValidUrl(s.url));
      validTracks.forEach((track, index) => {
        const trackTitle =
          validTracks.length > 1
            ? `${card.ritualName} (Track ${index + 1})`
            : card.ritualName;

        validSongsPayload.push({
          ritualName: trackTitle,
          url: track.url.trim(),
          notes: card.notes.trim(),
        });
      });
    });

    if (validSongsPayload.length === 0) {
      setErrorMessage(t.validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studio_id: studioId,
          client_name: clientName.trim(),
          event_date: eventDate,
          phone: phone.trim(),
          general_notes: generalNotes.trim(),
          songs: validSongsPayload,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to submit playlist');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Display Title depending on Language
  const getRitualDisplayTitle = (card: FormRitualCard) => {
    if (lang === 'en') {
      return card.englishTag || card.ritualName;
    }
    return card.ritualName;
  };

  // Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 py-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-6 animate-bounce shadow-2xl">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold gradient-text mb-3">
          {t.successTitle}
        </h1>
        <p className="text-slate-300 max-w-lg mb-6 text-sm sm:text-base leading-relaxed">
          {t.successSub}
        </p>

        <div className="glass-card p-6 rounded-2xl max-w-md w-full mb-8 text-left border-amber-500/30 shadow-xl space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-amber-400 font-semibold pb-2 border-b border-white/10 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Summary
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p className="flex justify-between">
              <span className="text-slate-400">{t.coupleNameLabel}:</span>
              <strong className="text-white font-medium">{clientName}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">{t.eventDateLabel}:</span>
              <strong className="text-white font-medium">{eventDate}</strong>
            </p>
            {phone && (
              <p className="flex justify-between">
                <span className="text-slate-400">{t.phoneLabel}:</span>
                <strong className="text-amber-300 font-medium">{phone}</strong>
              </p>
            )}
            <p className="flex justify-between items-center">
              <span className="text-slate-400">Total Songs Submitted:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                {totalValidSongs} Tracks
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setClientName('');
            setEventDate('');
            setPhone('');
            setGeneralNotes('');
            setRituals(
              BENGALI_RITUAL_GROUPS.flatMap((group) =>
                group.rituals.map((r) => ({
                  id: `ritual-${r.id}`,
                  ritualName: r.name,
                  englishTag: r.englishTag,
                  category: r.category,
                  songs: [{ id: `song-${r.id}-1`, url: '' }],
                  notes: '',
                  isCollapsed: false,
                }))
              )
            );
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-lg hover:scale-105"
        >
          {t.submitAnotherBtn}
        </button>
      </div>
    );
  }

  // Render Ritual Section Cards
  const renderRitualsGroup = (categoryKey: string, categoryTitle: string) => {
    const categoryRituals = rituals.filter((r) => r.category === categoryKey);
    if (categoryRituals.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-amber-300 pb-2 border-b border-amber-500/20 flex items-center justify-between">
          <span>{categoryTitle}</span>
          <span className="text-xs font-normal text-slate-400">
            ({categoryRituals.filter((r) => r.songs.some((s) => isValidUrl(s.url))).length} / {categoryRituals.length} Filled)
          </span>
        </h2>

        <div className="space-y-3">
          {categoryRituals.map((card) => {
            const validTracks = card.songs.filter((s) => isValidUrl(s.url));
            const hasValidSong = validTracks.length > 0;
            const isCollapsed = card.isCollapsed && hasValidSong;

            if (isCollapsed) {
              // Collapsed Slim Summary Bar
              return (
                <div
                  key={card.id}
                  className="glass-card p-4 rounded-xl border-emerald-500/40 bg-emerald-950/10 flex items-center justify-between gap-3 shadow-md hover:border-emerald-500/60 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-white truncate">
                          {getRitualDisplayTitle(card)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          {t.addedBadge} ({validTracks.length})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                        {validTracks[0]?.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditCard(card.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-all flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t.editBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearCard(card.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.removeBtn}</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Expanded Card View
            return (
              <div
                key={card.id}
                className={`glass-card p-5 sm:p-6 rounded-2xl border-white/10 transition-all ${
                  hasValidSong ? 'border-amber-500/40 bg-amber-950/5' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-medium text-sm sm:text-base text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{getRitualDisplayTitle(card)}</span>
                  </h3>
                  {card.id.startsWith('custom-') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRitual(card.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {card.songs.map((songTrack, index) => (
                    <div key={songTrack.id} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={songTrack.url}
                          onChange={(e) => handleUrlChange(card.id, songTrack.id, e.target.value)}
                          className="w-full px-4 py-2.5 pr-20 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => handlePaste(card.id, songTrack.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all flex items-center gap-1"
                        >
                          <Clipboard className="w-3 h-3" />
                          <span>Paste</span>
                        </button>
                      </div>

                      {card.songs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSongFromRitual(card.id, songTrack.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddSongToRitual(card.id)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addSongBtn}</span>
                    </button>
                  </div>

                  {/* Cut Notes Field */}
                  <div className="pt-2 border-t border-white/5">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t.notesLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.notesPlaceholder}
                      value={card.notes}
                      onChange={(e) => handleNotesChange(card.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32 space-y-8 max-w-4xl mx-auto px-3 sm:px-6 pt-4">
      {/* Top Header & Language Switcher */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-amber-500/30 relative overflow-hidden text-center sm:text-left shadow-2xl">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t.studioTag} <strong className="text-white font-bold">{studioId}</strong></span>
          </div>

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.langBtn}</span>
          </button>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold gradient-text tracking-tight mb-3">
          🎬 {t.headerTitle}
        </h1>

        <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4">
          {t.headerSubtitle} ❤️
        </p>

        {/* Instructions Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm space-y-1.5 text-left">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-sm">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{t.instructionTitle}</span>
          </div>
          <ul className="space-y-1 text-slate-300 text-xs sm:text-sm leading-relaxed pl-1">
            <li>{t.instructionStep1}</li>
            <li>{t.instructionStep2}</li>
            <li>{t.instructionStep3}</li>
          </ul>
        </div>
      </div>

      {clipboardNotice && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{clipboardNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Couple Information Section */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border-white/10 relative">
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> {t.coupleSectionTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> {t.coupleNameLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t.coupleNamePlaceholder}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> {t.eventDateLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> {t.phoneLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> {t.generalNotesLabel}
            </label>
            <textarea
              rows={2}
              placeholder={t.generalNotesPlaceholder}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500 resize-none"
            />
          </div>
        </div>

        {/* Ritual Categories */}
        {renderRitualsGroup('pre_wedding', t.preWeddingCategory)}
        {renderRitualsGroup('wedding_ceremony', t.weddingCategory)}
        {renderRitualsGroup('post_wedding_reception', t.postWeddingCategory)}

        {/* Add Custom Ritual Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setShowAddRitualModal(true)}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-amber-300 font-medium text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 hover:scale-105"
          >
            <span>{t.addCustomRitualBtn}</span>
          </button>
        </div>

        {/* Submit Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">Total Filled Songs:</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <Music className="w-4 h-4" /> {totalValidSongs} Tracks
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:via-rose-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>{t.submittingBtn}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t.submitBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Add Custom Ritual Modal */}
      {showAddRitualModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl max-w-sm w-full space-y-4 border-amber-500/40 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-amber-300">
              {t.customRitualModalTitle}
            </h3>
            <input
              type="text"
              placeholder={t.customRitualNamePlaceholder}
              value={customRitualName}
              onChange={(e) => setCustomRitualName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRitualModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition-all"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleAddCustomRitual}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold transition-all hover:bg-amber-400"
              >
                {t.confirmAddBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
