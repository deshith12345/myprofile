'use client'

import { useState, useRef, useEffect } from 'react'
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
    Search,
    Wand2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { profile } from '@/data/profile'
import { skills as skillsData } from '@/data/skills'
import { projects as projectsData } from '@/data/projects'
import { achievements as achievementsData } from '@/data/achievements'
import { badges as badgesData } from '@/data/badges'
import { Skill, Project, Achievement, Profile, Badge, AchievementCategory } from '@/data/types'
import { findBrandIcon, findOrganizationIcon } from '@/lib/icon-utils'
import { uploadFileAction } from '@/app/actions/upload'


type Tab = 'profile' | 'skills' | 'projects' | 'achievements' | 'badges'

function DropZone({ onUpload, currentFile, aspect = 'video', accept = 'image/*', onFileSelect }: { onUpload: (url: string) => void, currentFile?: string, aspect?: 'video' | 'square', accept?: string, onFileSelect?: (file: File) => void }) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (onFileSelect) onFileSelect(file)

        // Create immediate local preview
        if (file.type.startsWith('image/')) {
            const localUrl = URL.createObjectURL(file)
            setPreviewUrl(localUrl)
        }

        setIsUploading(true)

        try {
            // Check if file is large (> 4MB) to use chunked strategy
            if (file.size > 4 * 1024 * 1024) {
                await uploadChunkedFile(file)
            } else {
                // Standard Server Action Upload
                const formData = new FormData()
                formData.append('file', file)

                const data = await uploadFileAction(formData)
                if (data.success) {
                    onUpload(data.url!)
                } else {
                    alert(`Upload failed: ${data.message}`)
                    setPreviewUrl(null)
                }
            }
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed: Network error.')
            setPreviewUrl(null)
        } finally {
            setIsUploading(false)
        }
    }

    const uploadChunkedFile = async (file: File) => {
        const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB chunks to be safe
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
        const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE
            const end = Math.min(file.size, start + CHUNK_SIZE)
            const chunk = file.slice(start, end)

            const formData = new FormData()
            formData.append('chunkIndex', i.toString())
            formData.append('totalChunks', totalChunks.toString())
            formData.append('uploadId', uploadId)
            formData.append('fileName', file.name)
            formData.append('contentType', file.type)
            formData.append('file', chunk)

            // Call API directly for chunks (avoid server action payload limits)
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const result = await res.json()
            if (!result.success) {
                throw new Error(result.message || 'Chunk upload failed')
            }

            if (i === totalChunks - 1) {
                // Final chunk response contains the URL
                onUpload(result.url)
            }
        }
    }

    // Only clear local preview when we are absolutely sure the server image is back and loaded
    // or if the component unmounts/resets
    const [isServerImageLoaded, setIsServerImageLoaded] = useState(false)

    useEffect(() => {
        setIsServerImageLoaded(false)
    }, [currentFile])

    const displayUrl = (!isServerImageLoaded && previewUrl) ? previewUrl : currentFile
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
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={displayUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onLoad={() => {
                                if (displayUrl === currentFile) setIsServerImageLoaded(true)
                            }}
                        />
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-white animate-pulse">Syncing to Database & GitHub</span>
                    <span className="text-[8px] font-medium text-gray-400 mt-1">Changes are live instantly (No Build Triggered)</span>
                </div>
            )}
        </div>
    )
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string, url?: string | null } | null>(null)

    // Achievement category sub-tab state
    const [achievementCategory, setAchievementCategory] = useState<AchievementCategory | 'all'>('all')

    const [isLoadingData, setIsLoadingData] = useState(true)
    const [localProfile, setLocalProfile] = useState<Profile>(profile as Profile)
    const [localSkills, setLocalSkills] = useState<Skill[]>([...(skillsData as unknown as Skill[])])
    const [localProjects, setLocalProjects] = useState<Project[]>([...(projectsData as unknown as Project[])])
    const [localAchievements, setLocalAchievements] = useState<Achievement[]>([...(achievementsData as unknown as Achievement[])])
    const [localBadges, setLocalBadges] = useState<Badge[]>([...(badgesData as unknown as Badge[])])
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const res = await fetch('/api/all-data')
                const result = await res.json()
                if (result.success) {
                    setLocalProfile(result.data.profile)
                    setLocalSkills(result.data.skills)
                    setLocalProjects(result.data.projects)
                    setLocalAchievements(result.data.achievements)
                    setLocalBadges(result.data.badges || [])
                }
            } catch (err) {
                console.error('Failed to pre-fetch database data:', err)
            } finally {
                setIsLoadingData(false)
            }
        }
        fetchAllData()
    }, [])

    const router = useRouter()

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'skills', label: 'Skills', icon: Award },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'badges', label: 'Badges', icon: CheckCircle2 },
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
            { type: 'badges', data: localBadges },
        ]

        try {
            // Save all categories sequentially 
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
            }

            setSaveStatus({
                type: 'success',
                message: 'All changes have been successfully saved to the database and are now live.',
            })
        } catch (err: any) {
            console.error('Save error:', err)
            setSaveStatus({ type: 'error', message: err.message || 'Error during synchronization.' })
        } finally {
            setIsSaving(false)
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#030711] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 animate-pulse">Initializing Secure Session</p>
                </div>
            </div>
        )
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

                <div className="mb-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex gap-4">
                        <div className="p-2 h-fit rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-400 mb-2">Database Persistent Sync</h4>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                                You are connected to <strong>MongoDB Atlas</strong>. All updates to text and images are now persistent and <strong>do not require site redeployments</strong>.
                                Your changes are reflected instantly on the live site.
                            </p>
                        </div>
                    </div>
                </div>


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
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resume / CV (PDF)</label>
                                        <div className="max-w-[300px]">
                                            <DropZone
                                                currentFile={localProfile.resume}
                                                accept="application/pdf"
                                                aspect="video"
                                                onUpload={(url) => setLocalProfile(prev => ({ ...prev, resume: url }))}
                                            />
                                        </div>
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
                                                        const updatedRoles = [...(localProfile.roles || [])]
                                                        updatedRoles[ridx] = e.target.value
                                                        setLocalProfile({ ...localProfile, roles: updatedRoles })
                                                    }}
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const updatedRoles = (localProfile.roles || []).filter((_: any, i: number) => i !== ridx)
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
                                            isBrandIcon: false,
                                            brandColor: undefined
                                        } as Skill
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
                                                        {skill.customIconUrl ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={skill.customIconUrl === 'loading' ? '#' : skill.customIconUrl}
                                                                alt=""
                                                                className={`w-full h-full object-contain ${skill.customIconUrl === 'loading' ? 'animate-pulse opacity-20' : ''}`}
                                                            />
                                                        ) : skill.isBrandIcon && skill.icon ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={`https://cdn.simpleicons.org/${skill.icon}/${skill.brandColor || '666666'}`}
                                                                alt=""
                                                                className="w-full h-full object-contain"
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
                                                            <button
                                                                title="Auto-fetch Official Logo from Internet"
                                                                onClick={async () => {
                                                                    const updated = [...localSkills];
                                                                    updated[idx].customIconUrl = 'loading';
                                                                    setLocalSkills(updated);

                                                                    try {
                                                                        const res = await fetch(`/api/fetch-logo?org=${encodeURIComponent(skill.name)}`);
                                                                        const data = await res.json();

                                                                        if (data.url) {
                                                                            const finalUpdated = [...localSkills];
                                                                            finalUpdated[idx].customIconUrl = data.url;
                                                                            setLocalSkills(finalUpdated);
                                                                        } else {
                                                                            alert(`Failed: ${data.error || 'Unknown error'}`);
                                                                            const resetUpdated = [...localSkills];
                                                                            resetUpdated[idx].customIconUrl = undefined;
                                                                            setLocalSkills(resetUpdated);
                                                                        }
                                                                    } catch (err) {
                                                                        alert(`Failed to fetch logo: ${err instanceof Error ? err.message : 'Network error'}`);
                                                                        const resetUpdated = [...localSkills];
                                                                        resetUpdated[idx].customIconUrl = undefined;
                                                                        setLocalSkills(resetUpdated);
                                                                    }
                                                                }}
                                                                className="p-1 hover:text-blue-500 transition-colors"
                                                                disabled={skill.customIconUrl === 'loading'}
                                                            >
                                                                {skill.customIconUrl === 'loading' ? (
                                                                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Search className="w-3 h-3" />
                                                                )}
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
                                                        min="0"
                                                        max="100"
                                                        value={skill.proficiency}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            const updated = [...localSkills];
                                                            updated[idx].proficiency = val;
                                                            setLocalSkills(updated);
                                                        }}
                                                        className="w-full accent-primary-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative z-10"
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

                                                    <div className="space-y-4">
                                                        <label className="text-[8px] font-black uppercase text-gray-500 block">Mission Gallery (Multi-Image)</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {(project.images || []).map((img, imgIdx) => (
                                                                <div key={imgIdx} className="relative aspect-video rounded-lg overflow-hidden group/img">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={img} alt={`Project gallery image ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={() => {
                                                                            const updated = [...localProjects]
                                                                            updated[idx].images = (updated[idx].images || []).filter((_, i) => i !== imgIdx)
                                                                            setLocalProjects(updated)
                                                                        }}
                                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <div className="aspect-video">
                                                                <DropZone
                                                                    onUpload={(url) => {
                                                                        const updated = [...localProjects]
                                                                        updated[idx].images = [...(updated[idx].images || []), url]
                                                                        setLocalProjects(updated)
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
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
                                                        <div className="space-y-2">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">Classification</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['web', 'mobile', 'opensource', 'other'].map((cat) => (
                                                                    <button
                                                                        key={cat}
                                                                        onClick={() => {
                                                                            const updated = [...localProjects]
                                                                            updated[idx].category = cat as any
                                                                            setLocalProjects(updated)
                                                                        }}
                                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${project.category === cat
                                                                            ? 'bg-primary-600 text-white border-primary-600'
                                                                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-primary-500'
                                                                            }`}
                                                                    >
                                                                        {cat === 'web' ? 'Web App' : cat === 'opensource' ? 'Open Source' : cat}
                                                                    </button>
                                                                ))}
                                                            </div>
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
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 ml-2">Accomplishments</h4>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="flex bg-white dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700 overflow-x-auto max-w-[200px] md:max-w-none">
                                            {['award', 'certification', 'reports', 'speaking', 'event', 'article'].map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setAchievementCategory(cat as AchievementCategory | 'all')}
                                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${achievementCategory === cat
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                        <Button size="sm" onClick={() => {
                                            const newCategory = achievementCategory === 'all' ? 'certification' : achievementCategory
                                            const id = Math.random().toString(36).substr(2, 9)
                                            const newAchievement: Achievement = {
                                                id,
                                                title: 'New Entry',
                                                organization: 'Organization',
                                                date: new Date().toISOString().split('T')[0],
                                                description: 'Description...',
                                                icon: 'shield',
                                                category: newCategory,
                                            } as Achievement
                                            setLocalAchievements([newAchievement, ...localAchievements])
                                        }} className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl whitespace-nowrap">
                                            <Plus className="w-4 h-4 mr-2" /> Add {achievementCategory === 'all' ? 'Item' : achievementCategory}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    {localAchievements
                                        .filter(a => achievementCategory === 'all' || a.category === achievementCategory)
                                        .map((achievement, idx) => (
                                            <Card key={achievement.id} className="p-6 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl relative group transition-all hover:bg-white dark:hover:bg-gray-800/60">
                                                <div className="grid md:grid-cols-12 gap-8">
                                                    <div className="md:col-span-4 space-y-4">
                                                        <label className="text-[8px] font-black uppercase text-gray-500 block">
                                                            {achievement.category === 'reports' ? 'Report Document (Auto-Extract)' : 'Credential File (PDF/IMG/DOCX)'}
                                                        </label>
                                                        <DropZone
                                                            currentFile={achievement.certificateFile}
                                                            accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                                            onUpload={(url) => {
                                                                const updated = [...localAchievements]
                                                                updated[idx].certificateFile = url
                                                                setLocalAchievements(updated)
                                                            }}
                                                            onFileSelect={async (file) => {
                                                                if (achievement.category === 'reports') {
                                                                    const formData = new FormData()
                                                                    formData.append('file', file)
                                                                    try {
                                                                        const res = await fetch('/api/extract-content', { method: 'POST', body: formData })
                                                                        const data = await res.json()
                                                                        if (data.success) {
                                                                            const updated = [...localAchievements]
                                                                            updated[idx].content = data.text
                                                                            setLocalAchievements(updated)
                                                                        }
                                                                    } catch (e) {
                                                                        console.error('Extraction failed', e)
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        {achievement.category === 'reports' && (
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Cover Image (For Reports)</label>
                                                                <DropZone
                                                                    currentFile={achievement.coverImage}
                                                                    accept="image/*"
                                                                    aspect="video"
                                                                    onUpload={(url) => {
                                                                        const updated = [...localAchievements]
                                                                        updated[idx].coverImage = url
                                                                        setLocalAchievements(updated)
                                                                    }}
                                                                />
                                                                <p className="text-[9px] text-gray-400 font-medium">Magazine-style cover for Reports category</p>
                                                            </div>
                                                        )}
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
                                                            {/* ... (existing Title and Org fields) */}
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Title / Descriptor</label>
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
                                                            {achievement.category !== 'reports' && (
                                                                <div className="space-y-2">
                                                                    {!achievement.organization && achievement.organization !== "" ? (
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...localAchievements]
                                                                                updated[idx].organization = "Organization" // Default placeholder
                                                                                setLocalAchievements(updated)
                                                                            }}
                                                                            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-bold hover:underline"
                                                                        >
                                                                            <Plus className="w-4 h-4" /> Add Organization / Host
                                                                        </button>
                                                                    ) : (
                                                                        <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <label className="text-[8px] font-black uppercase text-gray-500">Organization / Host</label>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const updated = [...localAchievements]
                                                                                        updated[idx].organization = undefined
                                                                                        updated[idx].orgIconSlug = undefined
                                                                                        updated[idx].orgIconColor = undefined
                                                                                        setLocalAchievements(updated)
                                                                                    }}
                                                                                    className="text-[8px] flex items-center gap-1 text-orange-500 hover:text-orange-600 font-bold uppercase cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10 px-2 py-1 rounded transition-colors"
                                                                                    title="Delete this organization info"
                                                                                >
                                                                                    <Trash2 className="w-3 h-3" /> Remove Org
                                                                                </button>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 overflow-hidden shrink-0 relative">
                                                                                    {achievement.orgIconSlug && (
                                                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                                                        <img
                                                                                            src={`https://cdn.simpleicons.org/${achievement.orgIconSlug}/${achievement.orgIconColor || '666666'}`}
                                                                                            alt=""
                                                                                            className="w-full h-full object-contain absolute inset-0 p-2"
                                                                                            onError={(e) => {
                                                                                                e.currentTarget.style.display = 'none';
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                    <Award className="w-5 h-5 text-gray-400" />
                                                                                </div>
                                                                                <input
                                                                                    value={achievement.organization || ''}
                                                                                    onBlur={() => {
                                                                                        const iconData = findOrganizationIcon(achievement.organization || '');
                                                                                        const updated = [...localAchievements];
                                                                                        updated[idx].orgIconSlug = iconData.slug;
                                                                                        updated[idx].orgIconColor = iconData.color;
                                                                                        setLocalAchievements(updated);
                                                                                    }}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...localAchievements]
                                                                                        updated[idx].organization = e.target.value
                                                                                        setLocalAchievements(updated)
                                                                                    }}
                                                                                    placeholder="e.g., CompTIA, Cisco, IBM"
                                                                                    className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500 transition-all font-mono"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    title="Auto-fetch Organization Logo from Internet"
                                                                                    onClick={async () => {
                                                                                        const org = achievement.organization;
                                                                                        if (!org) return;

                                                                                        const updated = [...localAchievements];
                                                                                        updated[idx].orgCustomLogo = 'loading';
                                                                                        setLocalAchievements(updated);

                                                                                        try {
                                                                                            const res = await fetch(`/api/fetch-logo?org=${encodeURIComponent(org)}`);
                                                                                            const data = await res.json();

                                                                                            if (data.url) {
                                                                                                const finalUpdated = [...localAchievements];
                                                                                                finalUpdated[idx].orgCustomLogo = data.url;
                                                                                                setLocalAchievements(finalUpdated);
                                                                                            } else {
                                                                                                alert(`Failed: ${data.error || 'Unknown error'}`);
                                                                                                const resetUpdated = [...localAchievements];
                                                                                                resetUpdated[idx].orgCustomLogo = undefined;
                                                                                                setLocalAchievements(resetUpdated);
                                                                                            }
                                                                                        } catch (err) {
                                                                                            alert(`Failed to fetch logo: ${err instanceof Error ? err.message : 'Network error'}`);
                                                                                            console.error(err);
                                                                                            const resetUpdated = [...localAchievements];
                                                                                            resetUpdated[idx].orgCustomLogo = undefined;
                                                                                            setLocalAchievements(resetUpdated);
                                                                                        }
                                                                                    }}
                                                                                    className="p-1.5 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                                    disabled={achievement.orgCustomLogo === 'loading'}
                                                                                >
                                                                                    {achievement.orgCustomLogo === 'loading' ? (
                                                                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                                    ) : (
                                                                                        <Search className="w-4 h-4" />
                                                                                    )}
                                                                                </button>
                                                                                <button
                                                                                    title="Auto-detect Organization Logo"
                                                                                    onClick={() => {
                                                                                        const iconData = findOrganizationIcon(achievement.organization || '');
                                                                                        const updated = [...localAchievements];
                                                                                        updated[idx].orgIconSlug = iconData.slug;
                                                                                        updated[idx].orgIconColor = iconData.color;
                                                                                        setLocalAchievements(updated);
                                                                                    }}
                                                                                    className="p-1.5 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                                                >
                                                                                    <Wand2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Date</label>
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
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Category</label>
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
                                                                    <option value="event">Event</option>
                                                                    <option value="article">Article</option>
                                                                    <option value="reports">Report</option>
                                                                    <option value="speaking">Speaking</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {(achievement.category === 'event' || achievement.category === 'speaking') && (
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black uppercase text-gray-500">Location / Venue</label>
                                                                <input
                                                                    value={achievement.location || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...localAchievements]
                                                                        updated[idx].location = e.target.value
                                                                        setLocalAchievements(updated)
                                                                    }}
                                                                    placeholder="e.g. Las Vegas, NV"
                                                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-xs font-medium text-gray-500 outline-none focus:border-primary-500 transition-all"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase text-gray-500">
                                                                {achievement.category === 'reports' ? 'Executive Summary' : 'Description'}
                                                            </label>
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

                                                        {achievement.category === 'reports' && (
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-center">
                                                                    <label className="text-[8px] font-black uppercase text-gray-500">Report Content (Extracted)</label>
                                                                    <span className="text-[8px] text-primary-500 cursor-pointer hover:underline" onClick={() => {
                                                                        // Optional: Manual re-trigger or upload trigger could go here
                                                                    }}>Auto-extracted from document</span>
                                                                </div>
                                                                <textarea
                                                                    rows={10}
                                                                    value={achievement.content || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...localAchievements]
                                                                        updated[idx].content = e.target.value
                                                                        setLocalAchievements(updated)
                                                                    }}
                                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-xs font-mono text-gray-600 dark:text-gray-300 outline-none focus:border-primary-500 transition-all resize-y"
                                                                    placeholder="Content will appear here after document upload..."
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-4">
                                                            <button
                                                                onClick={() => setLocalAchievements(localAchievements.filter(a => a.id !== achievement.id))}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete This Achievement
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'badges' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Digital Badges</h2>
                                        <p className="text-sm text-gray-500">Manage credentials and badges displayed in the marquee.</p>
                                    </div>
                                    <Button onClick={() => setLocalBadges([...localBadges, {
                                        id: `badge-${Date.now()}`,
                                        name: 'New Badge',
                                        image: '',
                                        provider: 'Provider Name',
                                    }])} icon={Plus}>Add Badge</Button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {localBadges.map((badge, idx) => (
                                        <div key={badge.id} className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                            <button
                                                onClick={() => {
                                                    const updated = localBadges.filter((_, i) => i !== idx)
                                                    setLocalBadges(updated)
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>

                                            <div className="space-y-3">
                                                <div className="aspect-square w-full">
                                                    <DropZone
                                                        aspect="square"
                                                        currentFile={badge.image}
                                                        onUpload={(url) => {
                                                            const updated = [...localBadges]
                                                            updated[idx].image = url
                                                            setLocalBadges(updated)
                                                        }}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <input
                                                        value={badge.name}
                                                        onChange={(e) => {
                                                            const updated = [...localBadges]
                                                            updated[idx].name = e.target.value
                                                            setLocalBadges(updated)
                                                        }}
                                                        placeholder="Badge Name"
                                                        className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-primary-500 outline-none pb-1"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            value={badge.provider || ''}
                                                            onChange={(e) => {
                                                                const updated = [...localBadges]
                                                                updated[idx].provider = e.target.value
                                                                setLocalBadges(updated)
                                                            }}
                                                            placeholder="Provider"
                                                            className="w-full bg-transparent text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700 focus:border-primary-500 outline-none pb-1"
                                                        />
                                                        <input
                                                            value={badge.url || ''}
                                                            onChange={(e) => {
                                                                const updated = [...localBadges]
                                                                updated[idx].url = e.target.value
                                                                setLocalBadges(updated)
                                                            }}
                                                            placeholder="Link URL"
                                                            className="w-full bg-transparent text-xs text-blue-500 border-b border-gray-200 dark:border-gray-700 focus:border-primary-500 outline-none pb-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {localBadges.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                        <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No badges added yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Click &quot;Add Badge&quot; to get started</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </Card>
            </main >
        </div >
    )
}
