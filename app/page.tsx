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
  Phone,
  FileText,
  Globe,
  ChevronDown,
  ChevronUp,
  Edit2,
  RotateCcw,
  Sparkle
} from 'lucide-react';

interface ClientFormProps {
  studioId?: string;
}

export interface CustomRitualItem {
  id: string;
  name: string;
  englishTag: string;
  category?: string;
}

// Translations Object
const TRANSLATIONS = {
  bn: {
    title: "বিবাহের সঙ্গীত নির্দেশিকা",
    subtitle: "আপনার স্পেশাল দিনের প্রতিটি মুহূর্তের জন্য পছন্দের গান নির্বাচন করুন",
    studioLabel: "স্টুডিও:",
    coupleInfoTitle: "১. দম্পতি ও অনুষ্ঠানের বিবরণ",
    clientNameLabel: "বরের নাম ও কনের নাম *",
    clientNamePlaceholder: "উদাঃ রাহুল এবং প্রিয়া",
    eventDateLabel: "অনুষ্ঠানের তারিখ *",
    phoneLabel: "ফোন / হোয়াটসঅ্যাপ নম্বর *",
    phonePlaceholder: "উদাঃ +91 98765 43210",
    generalNotesLabel: "বিশেষ নির্দেশনা (ঐচ্ছিক)",
    generalNotesPlaceholder: "সম্পাদনা বা সঙ্গীত প্লেলিস্ট সম্পর্কিত যেকোনো বিশেষ নোট লিখুন...",
    ritualSectionTitle: "২. শুভ অনুষ্ঠানের গান নির্বাচন (২৪টি আচার)",
    ritualSectionSubtitle: "প্রতিটি পর্বের জন্য ইউটিউব গান বা অডিও লিংক পেস্ট করুন",
    phase1Title: "🌿 প্রাক-বিবাহ ও প্রস্তুতি পর্ব (Pre-Wedding & Preparations)",
    phase2Title: "🌸 মূল বিয়ের দিনের আচার (Wedding Day Rituals)",
    phase3Title: "🥂 রিসেপশন ও বিদায় পর্ব (Reception & Post-Wedding)",
    addSongBtn: "+ আরও গান যোগ করুন",
    urlPlaceholder: "ইউটিউব বা অডিও লিংক পেস্ট করুন (e.g. https://youtu.be/...)",
    notesPlaceholder: "প্লেলিস্ট টাইমকোড বা স্পেশাল কাট নোট লিখুন (e.g. 01:20 থেকে বাজান)",
    submitBtn: "✨ সঙ্গীত নির্দেশিকা জমা দিন",
    submittingBtn: "জমা হচ্ছে...",
    successTitle: "🎉 অভিনন্দন! আপনার সঙ্গীত প্লেলিস্ট সফলভাবে জমা নেওয়া হয়েছে।",
    successMsg: "আমাদের এডিটিং টিম খুব শীঘ্রই আপনার নিবেদিত প্লেলিস্ট অনুযায়ী কাজটি শুরু করবে।",
    submitAnotherBtn: "অন্য নতুন তালিকা জমা দিন",
    validationError: "অনুগ্রহ করে আপনার নাম, অনুষ্ঠানের তারিখ এবং অন্তত ১টি গানের লিংক পূরণ করুন!",
    draftRestored: "✨ আপনার পূর্বের খসড়া তথ্য সফলভাবে পুনরুদ্ধার করা হয়েছে!",
    editBtn: "✏️ পরিবর্তন করুন",
    removeBtn: "🗑️ বাদ দিন",
    collapsedSongsAdded: "গান যোগ করা হয়েছে"
  },
  en: {
    title: "Wedding Soundtrack Guide",
    subtitle: "Select your favorite tracks for every precious moment of your special day",
    studioLabel: "Studio:",
    coupleInfoTitle: "1. Couple & Event Information",
    clientNameLabel: "Groom & Bride Names *",
    clientNamePlaceholder: "e.g. Rahul & Priya",
    eventDateLabel: "Wedding Event Date *",
    phoneLabel: "Phone / WhatsApp Number *",
    phonePlaceholder: "e.g. +91 98765 43210",
    generalNotesLabel: "Special Editing Instructions (Optional)",
    generalNotesPlaceholder: "Any general notes or style instructions for the editor...",
    ritualSectionTitle: "2. Wedding Ritual Soundtrack Selection",
    ritualSectionSubtitle: "Paste YouTube or audio link for each ritual section",
    phase1Title: "🌿 Phase 1: Pre-Wedding & Preparations",
    phase2Title: "🌸 Phase 2: Wedding Day Rituals",
    phase3Title: "🥂 Phase 3: Reception & Post-Wedding",
    addSongBtn: "+ Add Another Track",
    urlPlaceholder: "Paste YouTube or Audio Link (e.g. https://youtu.be/...)",
    notesPlaceholder: "Timing instructions or cut notes (e.g. Start at 01:20)",
    submitBtn: "✨ Submit Soundtrack Guide",
    submittingBtn: "Submitting...",
    successTitle: "🎉 Success! Your Wedding Soundtrack Guide is Submitted.",
    successMsg: "Our editing team will organize and import your tracks into Premiere Pro.",
    submitAnotherBtn: "Submit Another Form",
    validationError: "Please fill in Couple Names, Event Date, and at least 1 Song URL!",
    draftRestored: "✨ Your saved draft information has been restored!",
    editBtn: "✏️ Edit",
    removeBtn: "🗑️ Remove",
    collapsedSongsAdded: "Song(s) Added"
  }
};

export default function ClientForm({ studioId = 'trpworld' }: ClientFormProps) {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Form States
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [phone, setPhone] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [ritualSongs, setRitualSongs] = useState<Record<string, SongItem[]>>({});

  // Dynamic Studio Template & Rituals
  const [activeRituals, setActiveRituals] = useState<CustomRitualItem[]>([]);

  // Accordion & Collapse States
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});
  const [phaseCollapsed, setPhaseCollapsed] = useState<Record<string, boolean>>({
    phase1: false,
    phase2: false,
    phase3: false
  });

  // UI Flow States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDraftRestoredToast, setShowDraftRestoredToast] = useState(false);

  const t = TRANSLATIONS[lang];

  // 1. Language Preference Hydration
  useEffect(() => {
    const savedLang = localStorage.getItem('wedding_form_lang') as 'bn' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    localStorage.setItem('wedding_form_lang', nextLang);
  };

  // 2. Fetch Custom Studio Template or Fallback
  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/templates?studioId=${encodeURIComponent(studioId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setActiveRituals(json.data);
          return;
        }
      } catch (e) {}

      // Default 24 Bengali Rituals Fallback
      const defaultList: CustomRitualItem[] = BENGALI_RITUAL_GROUPS.flatMap((g, gIdx) =>
        g.rituals.map((r, rIdx) => ({
          id: `r-${gIdx}-${rIdx}`,
          name: r.name,
          englishTag: r.englishTag,
          category: g.id
        }))
      );
      setActiveRituals(defaultList);
    }
    loadTemplate();
  }, [studioId]);

  // 3. STEP 1: Auto-Draft Persistence (localStorage Hydration)
  const DRAFT_KEY = `wedding_form_draft_${studioId || 'default'}`;

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.eventDate) setEventDate(parsed.eventDate);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.generalNotes) setGeneralNotes(parsed.generalNotes);
        if (parsed.ritualSongs && typeof parsed.ritualSongs === 'object') {
          setRitualSongs(parsed.ritualSongs);
          
          // Auto-collapse cards that already have valid URLs
          const newCollapsed: Record<string, boolean> = {};
          Object.entries(parsed.ritualSongs).forEach(([rName, songArr]) => {
            const list = songArr as SongItem[];
            if (list.some(s => s.url && s.url.trim().length > 0)) {
              newCollapsed[rName] = true;
            }
          });
          setCollapsedCards(newCollapsed);
        }
        setShowDraftRestoredToast(true);
        setTimeout(() => setShowDraftRestoredToast(false), 4500);
      }
    } catch (e) {}
  }, [studioId, DRAFT_KEY]);

  // Auto-save state on change
  useEffect(() => {
    if (submitted) return;
    try {
      const draftPayload = {
        clientName,
        eventDate,
        phone,
        generalNotes,
        ritualSongs
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
    } catch (e) {}
  }, [clientName, eventDate, phone, generalNotes, ritualSongs, DRAFT_KEY, submitted]);

  // Helpers for Song Items
  const getSongsForRitual = (ritualName: string): SongItem[] => {
    return ritualSongs[ritualName] || [{ ritualName, url: '', notes: '' }];
  };

  const updateSong = (ritualName: string, index: number, field: 'url' | 'notes', value: string) => {
    const current = [...getSongsForRitual(ritualName)];
    if (!current[index]) {
      current[index] = { ritualName, url: '', notes: '' };
    }
    current[index][field] = value;

    setRitualSongs(prev => ({ ...prev, [ritualName]: current }));

    // STEP 3: Smart Auto-Collapse on valid paste
    if (field === 'url' && value.trim().length > 10) {
      setCollapsedCards(prev => ({ ...prev, [ritualName]: true }));
    }
  };

  const addSongField = (ritualName: string) => {
    const current = [...getSongsForRitual(ritualName)];
    current.push({ ritualName, url: '', notes: '' });
    setRitualSongs(prev => ({ ...prev, [ritualName]: current }));
    setCollapsedCards(prev => ({ ...prev, [ritualName]: false }));
  };

  const removeSongField = (ritualName: string, index: number) => {
    const current = [...getSongsForRitual(ritualName)];
    current.splice(index, 1);
    const updated = current.length === 0 ? [{ ritualName, url: '', notes: '' }] : current;
    setRitualSongs(prev => ({ ...prev, [ritualName]: updated }));
    
    if (!updated.some(s => s.url.trim().length > 0)) {
      setCollapsedCards(prev => ({ ...prev, [ritualName]: false }));
    }
  };

  const clearRitualSongs = (ritualName: string) => {
    setRitualSongs(prev => ({ ...prev, [ritualName]: [{ ritualName, url: '', notes: '' }] }));
    setCollapsedCards(prev => ({ ...prev, [ritualName]: false }));
  };

  const toggleCardCollapse = (ritualName: string) => {
    setCollapsedCards(prev => ({ ...prev, [ritualName]: !prev[ritualName] }));
  };

  const togglePhaseCollapse = (phaseKey: string) => {
    setPhaseCollapsed(prev => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
  };

  // Divide active rituals into 3 Phases
  const phase1Rituals = activeRituals.slice(0, 8);
  const phase2Rituals = activeRituals.slice(8, 17);
  const phase3Rituals = activeRituals.slice(17);

  const getPhaseSongCount = (ritualList: CustomRitualItem[]) => {
    return ritualList.reduce((acc, r) => {
      const songs = ritualSongs[r.name] || [];
      return acc + songs.filter(s => s.url && s.url.trim().length > 0).length;
    }, 0);
  };

  const isValidAudioOrVideoUrl = (urlStr: string): boolean => {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    if (trimmed.length < 5) return false;
    const pattern = /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be|vimeo\.com|soundcloud\.com|drive\.google\.com|dropbox\.com|\S+\.(mp3|wav|m4a|aac|ogg|flac))(\/.*)?$/i;
    return pattern.test(trimmed) || trimmed.startsWith('http://') || trimmed.startsWith('https://');
  };

  // Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');

    const formattedSongs: Array<{ ritualName: string; url: string; notes: string }> = [];

    Object.entries(ritualSongs).forEach(([rName, sList]) => {
      sList.forEach(s => {
        if (s.url && isValidAudioOrVideoUrl(s.url)) {
          formattedSongs.push({
            ritualName: rName,
            url: s.url.trim(),
            notes: s.notes ? s.notes.trim() : ''
          });
        }
      });
    });

    if (!clientName.trim() || !eventDate.trim() || formattedSongs.length === 0) {
      setErrorMessage(t.validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          event_date: eventDate.trim(),
          phone: phone.trim(),
          general_notes: generalNotes.trim(),
          songs: formattedSongs
        })
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        // Clear saved draft on successful submit
        localStorage.removeItem(DRAFT_KEY);
      } else {
        setErrorMessage(data.error || 'Failed to submit playlist');
      }
    } catch (err: any) {
      setErrorMessage('Connection error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setClientName('');
    setEventDate('');
    setPhone('');
    setGeneralNotes('');
    setRitualSongs({});
    setCollapsedCards({});
    setSubmitted(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0D0E12] text-white flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-[#161820] border border-[#F472B6]/30 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#F472B6] to-[#E11D48] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#F472B6]/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t.successTitle}</h2>
          <p className="text-[#E2E8F0] mb-6 text-sm leading-relaxed">{t.successMsg}</p>
          <button
            onClick={handleResetForm}
            className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#F472B6] to-[#E11D48] hover:from-[#FB7185] hover:to-[#F472B6] text-white font-bold transition-all duration-200 shadow-lg shadow-[#F472B6]/25 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t.submitAnotherBtn}
          </button>
        </div>
      </div>
    );
  }

  // RENDER RITUAL CARD COMPONENT
  const renderRitualCard = (ritual: CustomRitualItem) => {
    const songs = getSongsForRitual(ritual.name);
    const validSongs = songs.filter(s => s.url && s.url.trim().length > 0);
    const isCollapsed = collapsedCards[ritual.name] && validSongs.length > 0;

    return (
      <div
        key={ritual.id}
        className={`bg-[#161820] border rounded-xl transition-all duration-200 ${
          validSongs.length > 0
            ? 'border-[#F472B6]/40 shadow-md shadow-[#F472B6]/5'
            : 'border-[#2A2D3A] hover:border-[#F472B6]/25'
        }`}
      >
        {/* COLLAPSED SLIM CARD VIEW */}
        {isCollapsed ? (
          <div
            onClick={() => toggleCardCollapse(ritual.name)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1E212D]/60 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#F472B6]/15 border border-[#F472B6]/30 flex items-center justify-center text-[#F472B6] text-xs font-bold">
                ✓
              </span>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">{ritual.name}</h4>
                <p className="text-[#94A3B8] text-xs truncate max-w-xs sm:max-w-md">
                  {validSongs[0].url}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                ✅ {validSongs.length} {t.collapsedSongsAdded}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardCollapse(ritual.name);
                }}
                className="text-[#E2E8F0] hover:text-[#F472B6] p-1.5 rounded-lg hover:bg-[#2A2D3A] transition-colors text-xs flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {t.editBtn}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearRitualSongs(ritual.name);
                }}
                className="text-[#94A3B8] hover:text-[#FB7185] p-1.5 rounded-lg hover:bg-[#2A2D3A] transition-colors text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* EXPANDED CARD VIEW */
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#2A2D3A] pb-3">
              <div>
                <h4 className="text-white font-bold text-base flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#F472B6]" />
                  {ritual.name}
                </h4>
                {ritual.englishTag && (
                  <span className="text-[#94A3B8] text-xs italic">
                    ({ritual.englishTag})
                  </span>
                )}
              </div>

              {validSongs.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleCardCollapse(ritual.name)}
                  className="text-xs text-[#F472B6] hover:text-[#FB7185] font-semibold bg-[#F472B6]/10 px-2.5 py-1 rounded-lg border border-[#F472B6]/20 flex items-center gap-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Collapse
                </button>
              )}
            </div>

            <div className="space-y-3">
              {songs.map((song, sIdx) => (
                <div key={sIdx} className="bg-[#1E212D] border border-[#2A2D3A] p-3 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={song.url}
                      onChange={(e) => updateSong(ritual.name, sIdx, 'url', e.target.value)}
                      placeholder={t.urlPlaceholder}
                      className="flex-1 bg-[#13151D] border border-[#333748] focus:border-[#F472B6] text-white text-sm px-3.5 py-2.5 rounded-lg outline-none transition-all duration-200 placeholder:text-[#94A3B8] min-h-[44px]"
                    />
                    {songs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSongField(ritual.name, sIdx)}
                        className="text-[#94A3B8] hover:text-[#FB7185] p-2.5 rounded-lg hover:bg-[#2A2D3A] transition-colors"
                        title="Remove track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={song.notes}
                    onChange={(e) => updateSong(ritual.name, sIdx, 'notes', e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="w-full bg-[#13151D] border border-[#333748] focus:border-[#F472B6] text-[#E2E8F0] text-xs px-3.5 py-2 rounded-lg outline-none transition-all duration-200 placeholder:text-[#94A3B8]"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => addSongField(ritual.name)}
                  className="text-xs font-semibold text-[#F472B6] hover:text-[#FB7185] flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F472B6]/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.addSongBtn}
                </button>

                {validSongs.length > 0 && (
                  <span className="text-[11px] text-[#F59E0B] font-medium">
                    🎵 {validSongs.length} track(s) ready
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#F472B6]/30 selection:text-white">
      {/* FLOATING TOAST FOR DRAFT RESTORATION */}
      {showDraftRestoredToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#161820] border border-[#F472B6] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#F472B6]" />
          <span className="text-xs font-semibold">{t.draftRestored}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER BAR & LANGUAGE SWITCHER */}
        <header className="bg-[#161820] border border-[#F472B6]/20 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#F472B6] to-[#E11D48] flex items-center justify-center shadow-lg shadow-[#F472B6]/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                {t.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#E2E8F0] mt-0.5">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-full">
              {t.studioLabel} {studioId}
            </span>

            {/* BILINGUAL LANGUAGE SWITCHER TOGGLE */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-[#1E212D] border border-[#F472B6]/40 hover:border-[#F472B6] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 shadow-md min-h-[44px]"
            >
              <Globe className="w-4 h-4 text-[#F472B6]" />
              {lang === 'bn' ? '🇮🇳 বাংলা' : '🇬🇧 English'}
            </button>
          </div>
        </header>

        {/* ERROR MESSAGE ALERT */}
        {errorMessage && (
          <div className="bg-[#E11D48]/15 border border-[#E11D48]/40 rounded-xl p-4 text-[#FB7185] text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: COUPLE & EVENT INFORMATION */}
          <section className="bg-[#161820] border border-[#F472B6]/20 rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#2A2D3A] pb-3">
              <User className="w-5 h-5 text-[#F472B6]" />
              {t.coupleInfoTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#E2E8F0] mb-2">
                  {t.clientNameLabel}
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t.clientNamePlaceholder}
                  className="w-full bg-[#1E212D] border border-[#333748] focus:border-[#F472B6] text-white text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200 placeholder:text-[#94A3B8] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E2E8F0] mb-2">
                  {t.eventDateLabel}
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#1E212D] border border-[#333748] focus:border-[#F472B6] text-white text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E2E8F0] mb-2">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-[#1E212D] border border-[#333748] focus:border-[#F472B6] text-white text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200 placeholder:text-[#94A3B8] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E2E8F0] mb-2">
                  {t.generalNotesLabel}
                </label>
                <input
                  type="text"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder={t.generalNotesPlaceholder}
                  className="w-full bg-[#1E212D] border border-[#333748] focus:border-[#F472B6] text-[#E2E8F0] text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200 placeholder:text-[#94A3B8] min-h-[44px]"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: 3-PHASE RITUAL SOUNDTRACK SELECTION */}
          <section className="space-y-6">
            <div className="bg-[#161820] border border-[#F472B6]/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F472B6]" />
                {t.ritualSectionTitle}
              </h2>
              <p className="text-xs text-[#E2E8F0] mt-1">{t.ritualSectionSubtitle}</p>
            </div>

            {/* PHASE 1 ACCORDION */}
            <div className="bg-[#161820] border border-[#F472B6]/20 rounded-2xl overflow-hidden shadow-xl">
              <div
                onClick={() => togglePhaseCollapse('phase1')}
                className="p-5 bg-gradient-to-r from-[#161820] to-[#1E212D] flex items-center justify-between cursor-pointer hover:bg-[#1E212D] transition-colors border-b border-[#2A2D3A]"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {t.phase1Title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 text-xs font-bold px-3 py-1 rounded-full">
                    🎵 {getPhaseSongCount(phase1Rituals)} Songs Added
                  </span>
                  {phaseCollapsed.phase1 ? (
                    <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-[#F472B6]" />
                  )}
                </div>
              </div>

              {!phaseCollapsed.phase1 && (
                <div className="p-5 grid grid-cols-1 gap-4">
                  {phase1Rituals.map(renderRitualCard)}
                </div>
              )}
            </div>

            {/* PHASE 2 ACCORDION */}
            <div className="bg-[#161820] border border-[#F472B6]/20 rounded-2xl overflow-hidden shadow-xl">
              <div
                onClick={() => togglePhaseCollapse('phase2')}
                className="p-5 bg-gradient-to-r from-[#161820] to-[#1E212D] flex items-center justify-between cursor-pointer hover:bg-[#1E212D] transition-colors border-b border-[#2A2D3A]"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {t.phase2Title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 text-xs font-bold px-3 py-1 rounded-full">
                    🎵 {getPhaseSongCount(phase2Rituals)} Songs Added
                  </span>
                  {phaseCollapsed.phase2 ? (
                    <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-[#F472B6]" />
                  )}
                </div>
              </div>

              {!phaseCollapsed.phase2 && (
                <div className="p-5 grid grid-cols-1 gap-4">
                  {phase2Rituals.map(renderRitualCard)}
                </div>
              )}
            </div>

            {/* PHASE 3 ACCORDION */}
            <div className="bg-[#161820] border border-[#F472B6]/20 rounded-2xl overflow-hidden shadow-xl">
              <div
                onClick={() => togglePhaseCollapse('phase3')}
                className="p-5 bg-gradient-to-r from-[#161820] to-[#1E212D] flex items-center justify-between cursor-pointer hover:bg-[#1E212D] transition-colors border-b border-[#2A2D3A]"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {t.phase3Title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 text-xs font-bold px-3 py-1 rounded-full">
                    🎵 {getPhaseSongCount(phase3Rituals)} Songs Added
                  </span>
                  {phaseCollapsed.phase3 ? (
                    <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-[#F472B6]" />
                  )}
                </div>
              </div>

              {!phaseCollapsed.phase3 && (
                <div className="p-5 grid grid-cols-1 gap-4">
                  {phase3Rituals.map(renderRitualCard)}
                </div>
              )}
            </div>
          </section>

          {/* STICKY FLOATING SUBMIT BUTTON BAR */}
          <div className="sticky bottom-4 z-40">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] py-4 px-8 rounded-2xl bg-gradient-to-r from-[#F472B6] via-[#FB7185] to-[#E11D48] hover:from-[#FB7185] hover:to-[#F472B6] text-white font-black text-base tracking-wide transition-all duration-200 shadow-2xl shadow-[#F472B6]/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  {t.submittingBtn}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.submitBtn}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
