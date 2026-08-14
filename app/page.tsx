'use client';

import { useState } from 'react';
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
}

export default function ClientSubmissionPage({ studioId = 'trpworld' }: { studioId?: string } = {}) {
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [phone, setPhone] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  // Initialize form state with 25 Bengali rituals
  const [rituals, setRituals] = useState<FormRitualCard[]>(() =>
    BENGALI_RITUAL_GROUPS.flatMap((group) =>
      group.rituals.map((r) => ({
        id: `ritual-${r.id}`,
        ritualName: r.name,
        englishTag: r.englishTag,
        category: r.category,
        songs: [{ id: `song-${r.id}-1`, url: '' }],
        notes: '',
      }))
    )
  );

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

  // Handle URL change for a specific song in a ritual card
  const handleUrlChange = (ritualId: string, songId: string, url: string) => {
    setRituals((prev) =>
      prev.map((card) => {
        if (card.id === ritualId) {
          return {
            ...card,
            songs: card.songs.map((s) => (s.id === songId ? { ...s, url } : s)),
          };
        }
        return card;
      })
    );
  };

  // Handle Paste from Clipboard for a specific song input
  const handlePaste = async (ritualId: string, songId: string) => {
    setClipboardNotice(null);
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setClipboardNotice('Clipboard read not supported on this browser. Please paste manually.');
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
          return {
            ...card,
            songs: card.songs.filter((s) => s.id !== songId),
          };
        }
        return card;
      })
    );
  };

  // Handle Notes change for a ritual card
  const handleNotesChange = (ritualId: string, notes: string) => {
    setRituals((prev) =>
      prev.map((card) => (card.id === ritualId ? { ...card, notes } : card))
    );
  };

  // Delete custom ritual
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
      setErrorMessage('অনুগ্রহ করে বরের ও কনের নাম (Client / Couple Name) লিখুন।');
      return;
    }
    if (!eventDate) {
      setErrorMessage('অনুগ্রহ করে আপনার বিয়ের / ইভেন্টের তারিখ নির্বাচন করুন।');
      return;
    }

    // Flatten valid songs for backend compatibility
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
      setErrorMessage('কমপক্ষে ১টি ভ্যালিড YouTube / Audio গান লিংক শেয়ার করুন।');
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
        throw new Error(json.error || 'গান সাবমিট করতে সমস্যা হয়েছে');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'সাবমিট করার সময় একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 py-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-6 animate-bounce shadow-2xl">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold gradient-text mb-3">
          আপনার গানের তালিকা সফলভাবে সাবমিট হয়েছে! 🎉
        </h1>
        <p className="text-slate-300 max-w-lg mb-6 text-sm sm:text-base leading-relaxed">
          ধন্যবাদ <span className="text-amber-300 font-semibold">{clientName}</span>! আপনাদের পছন্দের গানগুলো আমাদের Wedding Film Editing টিমের কাছে নিরাপদে পৌঁছে গেছে। ❤️
        </p>

        <div className="glass-card p-6 rounded-2xl max-w-md w-full mb-8 text-left border-amber-500/30 shadow-xl space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-amber-400 font-semibold pb-2 border-b border-white/10 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> সাবমিশন সামারি (Submission Details)
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p className="flex justify-between">
              <span className="text-slate-400">বরের ও কনের নাম:</span>
              <strong className="text-white font-medium">{clientName}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">বিয়ের তারিখ:</span>
              <strong className="text-white font-medium">{eventDate}</strong>
            </p>
            {phone && (
              <p className="flex justify-between">
                <span className="text-slate-400">যোগাযোগের নম্বর:</span>
                <strong className="text-amber-300 font-medium">{phone}</strong>
              </p>
            )}
            <p className="flex justify-between items-center">
              <span className="text-slate-400">মোট সাবমিট হওয়া গান:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                {totalValidSongs} টি ট্র্যাক
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
                }))
              )
            );
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-lg hover:scale-105"
        >
          নতুন কোনো রিকোয়েস্ট সাবমিট করুন
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 space-y-8">
      {/* Bengali Header & Welcome Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-amber-500/30 relative overflow-hidden text-center sm:text-left">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 mb-4 text-xs font-semibold text-amber-300 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Cinematic Wedding Film Music Curator</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold gradient-text tracking-tight mb-3">
          🎬 Wedding Film Music Selection Form
        </h1>

        <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4">
          Hello 😊 আপনাদের Wedding Film-টিকে আরও সুন্দর ও ব্যক্তিগত করে তুলতে নিচের প্রতিটি রিচুয়ালের জন্য আপনাদের পছন্দের YouTube Song Link শেয়ার করুন। ❤️
        </p>

        {/* Instructions Banner Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm space-y-2 text-left">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-sm">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>📌 নির্দেশনা (Instructions):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm leading-relaxed pl-1">
            <li>প্রতিটি অংশের জন্য চাইলে একাধিক গান দিতে পারবেন (<strong>+ Add Song</strong>)।</li>
            <li>
              কোনো নির্দিষ্ট অংশ কেটে বাদ দেওয়া বা স্পেশাল টাইমিং পছন্দ থাকলে (যেমন: <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">Start 0:15 - End 1:30</code>) নিচে স্পেশাল নোটস বক্সে লিখে দিন।
            </li>
          </ul>
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Couple & Event Details */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border-white/10 relative">
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> বরের ও কনের বিবরণ (Couple Information)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> বরের নাম ও কনের নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Rahul & Ananya"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> ইভেন্টের তারিখ (Event Date) <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> ফোন / হোয়াটসঅ্যাপ (Phone / WhatsApp)
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210 (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Clipboard warning / notice */}
        {clipboardNotice && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{clipboardNotice}</span>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Categorized Ritual Sections (25 Traditional Bengali Rituals) */}
        {BENGALI_RITUAL_GROUPS.map((group) => {
          const groupRituals = rituals.filter((r) => r.category === group.id);

          return (
            <div key={group.id} className="space-y-4">
              {/* Category Header */}
              <div className="px-1 border-b border-white/10 pb-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-300 flex items-center gap-2">
                  <span>{group.icon}</span>
                  <span>{group.title}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {group.subtitle}
                </p>
              </div>

              {/* Ritual Cards */}
              <div className="space-y-4">
                {groupRituals.map((card) => {
                  const cardHasValidSong = card.songs.some((s) => isValidUrl(s.url));

                  return (
                    <div
                      key={card.id}
                      className={`glass-card p-4 sm:p-5 rounded-2xl transition-all duration-200 relative ${
                        cardHasValidSong
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : 'border-white/10'
                      }`}
                    >
                      {/* Card Top Title & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base sm:text-lg text-slate-100">
                            {card.ritualName}
                          </span>
                          {cardHasValidSong && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Link Added
                            </span>
                          )}
                        </div>

                        {card.id.startsWith('custom-') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRitual(card.id)}
                            title="Remove ritual"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Song Track Inputs for this Ritual Card */}
                      <div className="space-y-3">
                        {card.songs.map((songTrack, sIdx) => {
                          const validTrack = isValidUrl(songTrack.url);
                          return (
                            <div key={songTrack.id} className="space-y-1.5">
                              {card.songs.length > 1 && (
                                <span className="text-[11px] font-semibold text-amber-300/90 block">
                                  Song {sIdx + 1}:
                                </span>
                              )}
                              <div className="relative flex items-center">
                                <input
                                  type="url"
                                  placeholder={`YouTube / Audio link (যেমন: https://youtu.be/...) ${
                                    card.songs.length > 1 ? `#${sIdx + 1}` : ''
                                  }`}
                                  value={songTrack.url}
                                  onChange={(e) =>
                                    handleUrlChange(card.id, songTrack.id, e.target.value)
                                  }
                                  className={`w-full pl-3 pr-28 py-2.5 rounded-xl glass-input text-sm ${
                                    validTrack ? 'border-emerald-500/50 focus:border-emerald-400' : ''
                                  }`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  {card.songs.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSongFromRitual(card.id, songTrack.id)}
                                      title="Remove song"
                                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handlePaste(card.id, songTrack.id)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                                  >
                                    <Clipboard className="w-3.5 h-3.5" /> Paste
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Add Another Song Button */}
                        <div className="flex justify-start">
                          <button
                            type="button"
                            onClick={() => handleAddSongToRitual(card.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Another Song (+গান যোগ করুন)
                          </button>
                        </div>

                        {/* Special Editing Notes Box per Ritual */}
                        <div className="pt-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs text-slate-300 font-medium">
                              স্পেশাল এডিটিং নোটস (Special Timings & Cuts Instructions):
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="কোন অংশটা কাটতে হবে বা স্পেশাল কোনো নির্দেশনা থাকলে লিখুন (যেমন: 0:25 থেকে শুরু করুন / এই ড্রপটা রাখুন)..."
                            value={card.notes}
                            onChange={(e) => handleNotesChange(card.id, e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add Custom Ritual Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setShowAddRitualModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>অন্যান্য বা কাস্টম রিচুয়াল যোগ করুন (+ Add Custom Ritual)</span>
          </button>
        </div>

        {/* Overall General Project Notes Box */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border-white/10 space-y-2">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-amber-200 flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-rose-400" /> সার্বিক নির্দেশনা ও শুভেচ্ছা (General Project Notes & Wishes)
          </h3>
          <p className="text-xs text-slate-400">
            আমাদের ওয়েডিং ফিল্ম এডিটিং টিমের জন্য আপনার কোনো বিশেষ পছন্দ, মোট গানের মেজাজ বা বার্তা থাকলে নিচে জানাতে পারেন।
          </p>
          <textarea
            rows={3}
            placeholder="আপনার সার্বিক চিন্তা বা অতিরিক্ত কোনো বার্তা এখানে লিখুন..."
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Heartfelt Bengali Footer Message */}
        <div className="text-center py-4 px-3 glass-card rounded-2xl border-amber-500/20 bg-amber-500/5">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif">
            আপনাদের পছন্দের গানগুলো আমাদের Wedding Film-কে আরও সুন্দর, আবেগপূর্ণ এবং সম্পূর্ণ আপনাদের মতো করে তুলতে সাহায্য করবে। ❤️
            <br />
            <span className="text-amber-300 font-semibold mt-1 inline-block">ধন্যবাদ। 🙏</span>
          </p>
        </div>
      </form>

      {/* Add Custom Ritual Modal */}
      {showAddRitualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-2xl max-w-sm w-full border-amber-500/40 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-amber-200 mb-2">
              কাস্টম রিচুয়াল যোগ করুন (Add Custom Ritual)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              আপনার ইভেন্টের বিশেষ কোনো অংশের নাম লিখুন (যেমন: "ককটেল পার্টি 🍸" / "ফার্স্ট ডান্স 💃")।
            </p>
            <input
              type="text"
              autoFocus
              placeholder="যেমন: প্রি-ওয়েডিং শুট 🎬"
              value={customRitualName}
              onChange={(e) => setCustomRitualName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustomRitual();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddRitualModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                বাতিল করুন (Cancel)
              </button>
              <button
                type="button"
                onClick={handleAddCustomRitual}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
              >
                যোগ করুন (Add)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#0f0a15]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">যুক্ত হওয়া গান</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-amber-400">
                {totalValidSongs}
              </span>
              <span className="text-xs text-slate-400">টি গান সিলেক্ট করা হয়েছে</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || totalValidSongs === 0 || !clientName || !eventDate}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-xl ${
              isSubmitting || totalValidSongs === 0 || !clientName || !eventDate
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'gradient-btn text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>সাবমিট হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>📤 সাবমিট করুন (Submit Playlist)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
