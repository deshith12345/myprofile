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

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    return (
        <div className="min-h-screen bg-gray-50">
            <h1>Test Dashboard</h1>
        </div>
    )
}
