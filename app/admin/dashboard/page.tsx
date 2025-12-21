'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Briefcase,
    Award,
    LogOut,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    ExternalLink,
    Github,
    Image as ImageIcon,
    Link as LinkIcon,
    Upload,
    X,
    FileText,
    Wand2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { profile } from '@/data/profile'
import { skills as skillsData, Skill } from '@/data/skills'
import { projects as projectsData, Project } from '@/data/projects'
import { achievements as achievementsData, Achievement } from '@/data/achievements'
import { findBrandIcon } from '@/lib/icon-utils'

type Tab = 'profile' | 'skills' | 'projects' | 'achievements'

function DropZone({ onUpload, currentFile, aspect = 'video', accept = 'image/*' }: { onUpload: (url: string) => void, currentFile?: string, aspect?: 'video' | 'square', accept?: string }) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        // Create immediate local preview
        if (file.type.startsWith('image/')) {
            const localUrl = URL.createObjectURL(file)
            setPreviewUrl(localUrl)
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.success) {
                onUpload(data.url)
                // We keep the preview until the parent gives us a new currentFile
            } else {
                alert(`Upload failed: ${data.message}`)
                setPreviewUrl(null)
            }
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed: Network error.')
            setPreviewUrl(null)
        } finally {
            setIsUploading(false)
        }
    }

    // Effect to clear preview once the actual file update propagates
    useEffect(() => {
        if (currentFile && previewUrl) {
            setPreviewUrl(null)
        }
    }, [currentFile])

    const displayUrl = previewUrl || currentFile
    const isImage = displayUrl?.match(/\.(jpg|jpeg|png|gif|webp|blob:)/i) || previewUrl

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${aspect === 'square' ? 'aspect-square' : 'aspect-video'
                } ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary-500/50'
                }`}
        >
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept={accept}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                }}
            />
            {displayUrl ? (
                <>
                    {isImage ? (
                        <img src={displayUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800">
                            <FileText className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[80%]">{displayUrl.split('/').pop()}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-5 h-5 text-white" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Change File</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Upload Asset</p>
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-500">Drag or click to choose</p>
                    </div>
                </div>
            )}

            {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-6 h-6 text-white animate-spin mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white animate-pulse">Syncing to GitHub</span>
                    <span className="text-[8px] font-medium text-gray-400 mt-1">This will trigger a site redeploy</span>
                </div>
            )}
        </div>
    )
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [isSaving, setIsSaving] = useState(false)
    const [githubConfig, setGithubConfig] = useState<{ hasGithubToken: boolean, hasGithubRepo: boolean, repoName: string | null } | null>(null)
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string, url?: string | null } | null>(null)

    const [localProfile, setLocalProfile] = useState(profile)
    const [localSkills, setLocalSkills] = useState([...skillsData])
    const [localProjects, setLocalProjects] = useState([...projectsData])
    const [localAchievements, setLocalAchievements] = useState([...achievementsData])

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/config')
                const data = await res.json()
                if (data.success) {
                    setGithubConfig(data.config)
                }
            } catch (err) {
                console.error('Failed to fetch config:', err)
            }
        }
        fetchConfig()
    }, [])

    const router = useRouter()

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'skills', label: 'Skills', icon: Award },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'achievements', label: 'Certifications', icon: Award },
    ]

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' })
        router.push('/admin/login')
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveStatus(null)

        const saves = [
            { type: 'profile', data: localProfile },
            { type: 'skills', data: localSkills },
            { type: 'projects', data: localProjects },
            { type: 'achievements', data: localAchievements },
        ]

        try {
            // Save all categories sequentially to avoid GitHub commit conflicts
            for (const save of saves) {
                const res = await fetch('/api/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(save),
                })
                const result = await res.json()
                if (!result.success) {
                    throw new Error(result.message || `Failed to sync ${save.type}`)
                }

                // Keep the final commit URL
                if (result.commitUrl) {
                    finalCommitUrl = result.commitUrl
                }
            }

            setSaveStatus({
                type: 'success',
                message: 'Full synchronization complete. All sections are live.',
                url: finalCommitUrl
            })
        } catch (err: any) {
            console.error('Save error:', err)
            setSaveStatus({ type: 'error', message: err.message || 'Error during synchronization.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#030711] flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-r border-gray-200 dark:border-gray-800 p-4 md:p-6 flex flex-col shrink-0">
                <div className="flex items-center gap-3 mb-6 md:mb-10 px-2">
                    <div className="p-2 rounded-lg bg-primary-600">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-sm dark:text-white">Admin Hub</span>
                </div>

                <nav className="flex md:flex-col gap-2 flex-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex-none md:w-full flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-4 md:mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Disconnect</span>
                    <span className="md:hidden text-[10px] uppercase font-black tracking-widest">Logout</span>
                </button>
            </aside>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize tracking-tight">{activeTab} Hub</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Direct access to your portfolio baseline.</p>
                    </div>
                    <Button
                        size="lg"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-600 hover:bg-primary-500 text-white min-w-[140px] shadow-lg shadow-primary-500/20 rounded-xl"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Sync to Baseline
                    </Button>
                </header>

                <AnimatePresence>
                    {saveStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-4 ${saveStatus.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {saveStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="text-sm font-bold">{saveStatus.message}</span>
                            </div>
                            {saveStatus.url && (
                                <a
                                    href={saveStatus.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-800/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    Verify Commit <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            <button onClick={() => setSaveStatus(null)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all">
                                <X className="w-4 h-4 opacity-50" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex gap-4">
                        <div className="p-2 h-fit rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-amber-900 dark:text-amber-400 mb-2">Immutable Deployment Notice</h4>
                            <p className="text-sm text-amber-800 dark:text-amber-300/80 leading-relaxed">
                                You are currently connected to the <strong>Vercel Production Edge</strong>. Direct file writes are transient by default.
                                <strong> To enable persistent updates:</strong> Add <code>GITHUB_TOKEN</code> and <code>GITHUB_REPO</code> to your Vercel Environment Variables.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-4">
                                    Feature Enabled: GitHub Auto-Sync & Redeploy
                                </div>
                                {githubConfig && (
                                    <div className="flex border-t border-amber-200/50 dark:border-amber-800/30 pt-4 mt-2 gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${githubConfig.hasGithubToken ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Token: {githubConfig.hasGithubToken ? 'Active' : 'Missing'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${githubConfig.hasGithubRepo ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Repo: {githubConfig.repoName || 'Not Set'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {saveStatus && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`mb-8 p-4 rounded-2xl flex items-center justify-between border ${saveStatus.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {saveStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="font-bold text-sm">{saveStatus.message}</span>
                            </div>
                            <button onClick={() => setSaveStatus(null)} className="text-xs font-black uppercase tracking-tighter hover:opacity-70">Dismiss</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 p-8 shadow-sm rounded-3xl">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Avatar / Profile Picture</label>
                                    <div className="max-w-[200px]">
                                        <DropZone
                                            currentFile={localProfile.image}
                                            aspect="square"
                                            onUpload={(url) => setLocalProfile(prev => ({ ...prev, image: url }))}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-medium">Recommended: Square aspect ratio (1:1) for optimal circular display.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Identity / Name</label>
                                        <input
                                            type="text"
                                            value={localProfile.name}
                                            onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Professional Title</label>
                                        <input
                                            type="text"
                                            value={localProfile.title}
                                            onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hero Subtext</label>
                                    <input
                                        type="text"
                                        value={localProfile.tagline}
                                        onChange={(e) => setLocalProfile({ ...localProfile, tagline: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Email</label>
                                        <input
                                            type="email"
                                            value={localProfile.email}
                                            onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resume Path (/CV/resume.pdf)</label>
                                        <input
                                            type="text"
                                            value={localProfile.resume}
                                            onChange={(e) => setLocalProfile({ ...localProfile, resume: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Location</label>
                                        <input
                                            type="text"
                                            value={localProfile.location}
                                            onChange={(e) => setLocalProfile({ ...localProfile, location: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Timezone</label>
                                        <input
                                            type="text"
                                            value={localProfile.timezone}
                                            onChange={(e) => setLocalProfile({ ...localProfile, timezone: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Short Summary (Home Page)</label>
                                    <input
                                        type="text"
                                        value={localProfile.bio}
                                        onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Executive Summary (Full Bio)</label>
                                    <textarea
                                        rows={6}
                                        value={localProfile.longBio}
                                        onChange={(e) => setLocalProfile({ ...localProfile, longBio: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-primary-500 outline-none resize-none leading-relaxed transition-all"
                                    />
                                </div>
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Animated Titles (Hero)</label>
                                        <Button size="sm" variant="outline" onClick={() => {
                                            const updatedRoles = [...(localProfile.roles || [])]
                                            updatedRoles.push('New Title')
                                            setLocalProfile({ ...localProfile, roles: updatedRoles })
                                        }} className="h-7 text-[10px] rounded-lg">
                                            <Plus className="w-3 h-3 mr-1" /> Add Title
                                        </Button>
                                    </div>
                                    <div className="grid gap-2">
                                        {(localProfile.roles || []).map((role: string, ridx: number) => (
                                            <div key={ridx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={role}
                                                    onChange={(e) => {
                                                        const updatedRoles = [...localProfile.roles]
                                                        updatedRoles[ridx] = e.target.value
                                                        setLocalProfile({ ...localProfile, roles: updatedRoles })
                                                    }}
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const updatedRoles = localProfile.roles.filter((_: any, i: number) => i !== ridx)
                                                        setLocalProfile({ ...localProfile, roles: updatedRoles })
                                                    }}
                                                    className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 ml-2">Weaponry & Arsenal</h4>
                                    <Button size="sm" onClick={() => {
                                        const newSkill: Skill = {
                                            name: 'New Skill',
                                            category: 'security-tools',
                                            proficiency: 50,
                                            icon: 'shield',
                                            isBrandIcon: false
                                        }
                                        setLocalSkills([...localSkills, newSkill])
                                    }} className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl">
                                        <Plus className="w-4 h-4 mr-2" /> Unsheathe New Skill
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {localSkills.map((skill, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 group relative">
                                            <div className="grid md:grid-cols-4 gap-4 items-center">
                                                <div className="md:col-span-1 flex items-center gap-4">
                                                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 overflow-hidden">
                                                        {skill.isBrandIcon && skill.icon ? (
                                                            <img
                                                                src={`https://cdn.simpleicons.org/${skill.icon}/${skill.brandColor || '666666'}`}
                                                                alt=""
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="text-gray-400 text-[8px] font-black uppercase text-center leading-tight">No<br />Icon</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-500">Skill Name</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                value={skill.name}
                                                                onBlur={() => {
                                                                    // Auto-detect icon if current icon is empty or default
                                                                    if (!skill.icon || skill.icon === 'shield') {
                                                                        const iconData = findBrandIcon(skill.name);
                                                                        const updated = [...localSkills];
                                                                        updated[idx].icon = iconData.slug;
                                                                        updated[idx].brandColor = iconData.color;
                                                                        updated[idx].isBrandIcon = true;
                                                                        setLocalSkills(updated);
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    const updated = [...localSkills]
                                                                    updated[idx].name = e.target.value
                                                                    setLocalSkills(updated)
                                                                }}
                                                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-0"
                                                            />
                                                            <button
                                                                title="Auto-detect Icon"
                                                                onClick={() => {
                                                                    const iconData = findBrandIcon(skill.name);
                                                                    const updated = [...localSkills];
                                                                    updated[idx].icon = iconData.slug;
                                                                    updated[idx].brandColor = iconData.color;
                                                                    updated[idx].isBrandIcon = true;
                                                                    setLocalSkills(updated);
                                                                }}
                                                                className="p-1 hover:text-primary-500 transition-colors"
                                                            >
                                                                <Wand2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-1 space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-gray-500">Category</label>
                                                    <select
                                                        value={skill.category}
                                                        onChange={(e) => {
                                                            const updated = [...localSkills]
                                                            updated[idx].category = e.target.value as any
                                                            setLocalSkills(updated)
                                                        }}
                                                        className="w-full bg-transparent border-none p-0 text-xs font-bold text-primary-500 outline-none focus:ring-0 appearance-none"
                                                    >
                                                        <option value="security-tools">Security tools</option>
                                                        <option value="programming">Programming</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-1 space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-gray-500">Mastery ({skill.proficiency}%)</label>
                                                    <input
                                                        type="range"
                                                        value={skill.proficiency}
                                                        onChange={(e) => {
                                                            const updated = [...localSkills]
                                                            updated[idx].proficiency = parseInt(e.target.value)
                                                            setLocalSkills(updated)
                                                        }}
                                                        className="w-full accent-primary-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                                <div className="md:col-span-1 flex justify-end">
                                                    <button
                                                        onClick={() => setLocalSkills(localSkills.filter((_, i) => i !== idx))}
                                                        className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 ml-2">Deployed Operations</h4>
                                    <Button size="sm" onClick={() => {
                                        const id = Math.random().toString(36).substr(2, 9)
                                        const newProject: Project = {
                                            id,
                                            title: 'New Operation',
                                            description: 'Mission brief...',
                                            longDescription: 'Full extraction details...',
                                            image: '/images/projects/nebula.jpg',
                                            technologies: ['React'],
                                            category: 'web',
                                            featured: false,
                                            date: new Date().toISOString().split('T')[0],
                                            highlights: []
                                        }
                                        setLocalProjects([newProject, ...localProjects])
                                    }} className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl">
                                        <Plus className="w-4 h-4 mr-2" /> Launch New Project
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {localProjects.map((project, idx) => (
                                        <Card key={project.id} className="p-6 bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 rounded-2xl transition-all hover:bg-white dark:hover:bg-gray-800/40">
                                            <div className="grid md:grid-cols-12 gap-8">
                                                <div className="md:col-span-4 space-y-4">
                                                    <label className="text-[8px] font-black uppercase text-gray-500 mb-2 block">Cover Asset (Drag & Drop)</label>
                                                    <DropZone
                                                        currentFile={project.image}
                                                        onUpload={(url) => {
                                                            const updated = [...localProjects]
                                                            updated[idx].image = url
                                                            setLocalProjects(updated)
                                                        }}
                                                    />
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-500">Operation ID</label>
                                                        <div className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700 truncate">{project.id}</div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-8 space-y-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Operation Name</label>
                                                            <input
                                                                value={project.title}
                                                                onChange={(e) => {
                                                                    const updated = [...localProjects]
                                                                    updated[idx].title = e.target.value
                                                                    setLocalProjects(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500 transition-all font-mono"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Deployment Date</label>
                                                            <input
                                                                type="date"
                                                                value={project.date}
                                                                onChange={(e) => {
                                                                    const updated = [...localProjects]
                                                                    updated[idx].date = e.target.value
                                                                    setLocalProjects(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm font-bold text-gray-500 outline-none focus:border-primary-500 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Target Summary</label>
                                                            <input
                                                                value={project.description}
                                                                onChange={(e) => {
                                                                    const updated = [...localProjects]
                                                                    updated[idx].description = e.target.value
                                                                    setLocalProjects(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs text-gray-600 dark:text-gray-400 outline-none focus:border-primary-500 transition-all"
                                                            />
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-1 relative">
                                                                <LinkIcon className="absolute right-0 bottom-2 w-3 h-3 text-gray-400" />
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Live Intel URL</label>
                                                                <input
                                                                    value={project.liveUrl || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...localProjects]
                                                                        updated[idx].liveUrl = e.target.value
                                                                        setLocalProjects(updated)
                                                                    }}
                                                                    placeholder="https://live-endpoint.com"
                                                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs text-primary-500 outline-none focus:border-primary-500 transition-all pr-6 font-mono"
                                                                />
                                                            </div>
                                                            <div className="space-y-1 relative">
                                                                <Github className="absolute right-0 bottom-2 w-3 h-3 text-gray-400" />
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Encrypted Repository</label>
                                                                <input
                                                                    value={project.githubUrl || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...localProjects]
                                                                        updated[idx].githubUrl = e.target.value
                                                                        setLocalProjects(updated)
                                                                    }}
                                                                    placeholder="https://github.com/secure/repo"
                                                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs text-secondary-500 outline-none focus:border-primary-500 transition-all pr-6 font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end pt-6">
                                                        <button
                                                            onClick={() => setLocalProjects(localProjects.filter(p => p.id !== project.id))}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Terminate Node
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 ml-2">Cyber Certifications</h4>
                                    <Button size="sm" onClick={() => {
                                        const id = Math.random().toString(36).substr(2, 9)
                                        const newAchievement: Achievement = {
                                            id,
                                            title: 'New Certification',
                                            organization: 'Authority',
                                            date: 'Dec 2025',
                                            description: 'Details...',
                                            icon: 'shield',
                                            category: 'certification'
                                        }
                                        setLocalAchievements([newAchievement, ...localAchievements])
                                    }} className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl">
                                        <Plus className="w-4 h-4 mr-2" /> Add Guard Credential
                                    </Button>
                                </div>

                                <div className="grid gap-6">
                                    {localAchievements.map((achievement, idx) => (
                                        <Card key={achievement.id} className="p-6 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl relative group transition-all hover:bg-white dark:hover:bg-gray-800/60">
                                            <button
                                                onClick={() => setLocalAchievements(localAchievements.filter(a => a.id !== achievement.id))}
                                                className="absolute top-4 right-4 p-2 text-red-500/50 hover:text-red-500 transition-colors z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="grid md:grid-cols-12 gap-8">
                                                <div className="md:col-span-4 space-y-4">
                                                    <label className="text-[8px] font-black uppercase text-gray-500 block">Credential File (PDF/IMG)</label>
                                                    <DropZone
                                                        currentFile={achievement.certificateFile}
                                                        accept="image/*,application/pdf"
                                                        onUpload={(url) => {
                                                            const updated = [...localAchievements]
                                                            updated[idx].certificateFile = url
                                                            setLocalAchievements(updated)
                                                        }}
                                                    />
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-500">Verification URL</label>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                            <input
                                                                value={achievement.verificationUrl || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...localAchievements]
                                                                    updated[idx].verificationUrl = e.target.value
                                                                    setLocalAchievements(updated)
                                                                }}
                                                                placeholder="https://verify.security/..."
                                                                className="w-full bg-gray-100 dark:bg-gray-900 border-none p-3 rounded-xl text-[10px] font-mono text-secondary-500 outline-none pr-8"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-8 space-y-6">
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Certification Descriptor</label>
                                                            <input
                                                                value={achievement.title}
                                                                onChange={(e) => {
                                                                    const updated = [...localAchievements]
                                                                    updated[idx].title = e.target.value
                                                                    setLocalAchievements(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500 transition-all font-mono"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Issuing Entity</label>
                                                            <input
                                                                value={achievement.organization}
                                                                onChange={(e) => {
                                                                    const updated = [...localAchievements]
                                                                    updated[idx].organization = e.target.value
                                                                    setLocalAchievements(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs font-black text-primary-500 outline-none focus:border-primary-500 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Enforcement Date</label>
                                                            <input
                                                                value={achievement.date}
                                                                onChange={(e) => {
                                                                    const updated = [...localAchievements]
                                                                    updated[idx].date = e.target.value
                                                                    setLocalAchievements(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs font-medium text-gray-500 outline-none focus:border-primary-500 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Classification</label>
                                                            <select
                                                                value={achievement.category}
                                                                onChange={(e) => {
                                                                    const updated = [...localAchievements]
                                                                    updated[idx].category = e.target.value as any
                                                                    setLocalAchievements(updated)
                                                                }}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs font-bold text-gray-400 outline-none focus:border-primary-500 appearance-none"
                                                            >
                                                                <option value="certification">Certification</option>
                                                                <option value="award">Award</option>
                                                                <option value="publication">Publication</option>
                                                                <option value="speaking">Speaking</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-500">Mission Breakdown</label>
                                                        <textarea
                                                            rows={3}
                                                            value={achievement.description}
                                                            onChange={(e) => {
                                                                const updated = [...localAchievements]
                                                                updated[idx].description = e.target.value
                                                                setLocalAchievements(updated)
                                                            }}
                                                            className="w-full bg-transparent border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-xs text-gray-500 outline-none focus:border-primary-500 transition-all resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </Card>
            </main >
        </div >
    )
}
