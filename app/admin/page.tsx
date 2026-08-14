'use client';

import { useState, useEffect } from 'react';
import { Submission } from '@/lib/types';
import {
  Download,
  Search,
  Filter,
  RefreshCw,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Music,
  User,
  Calendar,
  FolderDown,
  Sparkles,
  WifiOff,
  Wifi,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [agentConnected, setAgentConnected] = useState<boolean | null>(null);
  const [agentChecking, setAgentChecking] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Check Local Downloader Agent Health (http://localhost:5050/health)
  const checkAgentStatus = async () => {
    setAgentChecking(true);
    try {
      const res = await fetch('http://localhost:5050/health', { method: 'GET' });
      if (res.ok) {
        setAgentConnected(true);
      } else {
        setAgentConnected(false);
      }
    } catch {
      setAgentConnected(false);
    } finally {
      setAgentChecking(false);
    }
  };

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    checkAgentStatus();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchSubmissions();
      checkAgentStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter & Search
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.songs.some((s) => s.ritualName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : sub.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Handle Download All to PC
  const handleDownloadClientSongs = async (sub: Submission) => {
    setDownloadMessage(null);
    setDownloadingId(sub.id);

    try {
      // 1. Update status to Downloading
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, status: 'Downloading', is_downloaded: false }),
      });
      fetchSubmissions();

      // 2. Call Local Agent POST http://localhost:5050/download
      const res = await fetch('http://localhost:5050/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: sub.client_name,
          eventDate: sub.event_date,
          songs: sub.songs,
        }),
      });

      const json = await res.json();

      if (res.ok && json.status === 'success') {
        // 3. Mark Completed
        await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sub.id, status: 'Completed', is_downloaded: true }),
        });
        setDownloadMessage({
          type: 'success',
          text: `Successfully downloaded ${json.downloaded_count || sub.songs.length} tracks for ${sub.client_name} into ${json.folder || 'local drive'}!`,
        });
      } else {
        throw new Error(json.message || 'Local agent failed to download tracks');
      }
    } catch (err: any) {
      console.error('Download trigger error:', err);
      // Mark status Error
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, status: 'Error', is_downloaded: false }),
      });
      setDownloadMessage({
        type: 'error',
        text: err.message || 'Failed to connect to local downloader agent on http://localhost:5050.',
      });
    } finally {
      setDownloadingId(null);
      fetchSubmissions();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold">
              ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold gradient-text">
            Wedding Music Submissions
          </h1>
        </div>

        {/* Local Agent Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={checkAgentStatus}
            disabled={agentChecking}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              agentConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {agentConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
            <span>
              Local PC Agent:{' '}
              {agentChecking
                ? 'Checking...'
                : agentConnected
                ? 'Connected (localhost:5050)'
                : 'Offline'}
            </span>
          </button>

          <button
            onClick={fetchSubmissions}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Offline Agent Warning Banner */}
      {agentConnected === false && (
        <div className="glass-card p-4 rounded-2xl border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block font-semibold">Local Agent Offline!</strong>
              To download songs directly to your PC drive folders, start the Python agent:
              <code className="ml-1 bg-black/40 px-2 py-0.5 rounded font-mono text-amber-300">
                python local-agent/agent.py
              </code>
            </div>
          </div>
          <button
            onClick={checkAgentStatus}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs shrink-0"
          >
            Retry Check
          </button>
        </div>
      )}

      {/* Download Alert Message */}
      {downloadMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            downloadMessage.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
          }`}
        >
          {downloadMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{downloadMessage.text}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Client Name or Ritual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm appearance-none bg-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Submissions</option>
            <option value="downloading">Downloading</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading client playlists...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center text-slate-400">
          <Music className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-lg text-slate-300">No submissions found</p>
          <p className="text-xs text-slate-500 mt-1">
            Submissions submitted by clients will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const isDownloading = downloadingId === sub.id;

            return (
              <div
                key={sub.id}
                className="glass-card rounded-2xl overflow-hidden border-white/10 transition-all hover:border-amber-500/30"
              >
                {/* Accordion Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-lg font-bold text-white">
                          {sub.client_name}
                        </h3>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            sub.status === 'Completed'
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : sub.status === 'Downloading'
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                              : sub.status === 'Error'
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {sub.event_date}
                        </span>
                        {sub.phone && (
                          <span className="flex items-center gap-1 text-amber-300 font-medium">
                            📞 {sub.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Music className="w-3.5 h-3.5 text-rose-400" />
                          {sub.songs.length} Tracks
                        </span>
                        <span className="flex items-center gap-1 hidden sm:inline-flex">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDownloadClientSongs(sub)}
                      disabled={isDownloading}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
                        isDownloading
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                          : sub.is_downloaded
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                          : 'gradient-btn text-white hover:scale-105'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <FolderDown className="w-4 h-4" />
                          <span>{sub.is_downloaded ? 'Re-Download All' : 'Download All to PC'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Inspect Songs'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Song List */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/40 p-4 sm:p-5 space-y-3">
                    {sub.general_notes && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-3">
                        <strong className="block text-amber-300 font-semibold mb-1">
                          💬 Client General Notes:
                        </strong>
                        <p className="whitespace-pre-wrap">{sub.general_notes}</p>
                      </div>
                    )}
                    <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                      Submitted Ritual Tracks ({sub.songs.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {sub.songs.map((song, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white block">
                              {song.ritualName}
                            </span>
                            {song.notes && (
                              <span className="text-amber-200/80 italic block mt-0.5">
                                Note: "{song.notes}"
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 truncate max-w-xs font-mono">
                              {song.url}
                            </span>
                            <a
                              href={song.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                              title="Open link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
