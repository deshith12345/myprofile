'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Lock, User, Terminal, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAccessGranted, setIsAccessGranted] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (data.success) {
                setIsAccessGranted(true)
                setTimeout(() => {
                    router.push('/admin/dashboard')
                }, 1500)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Connection failed. Please check your network.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#030711] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Matrix-like background effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="h-full w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <motion.div
                            animate={isAccessGranted ? { scale: [1, 1.2, 1], rotate: [0, 360, 0] } : {}}
                            className="inline-flex p-4 rounded-2xl bg-primary-900/20 mb-4 border border-primary-500/20"
                        >
                            <Shield className={`w-10 h-10 ${isAccessGranted ? 'text-green-500' : 'text-primary-500'}`} />
                        </motion.div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
                            {isAccessGranted ? 'Access Granted' : 'Admin Terminal'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">Security clearance required</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                    placeholder="ENC_USER_ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all"
                            disabled={loading || isAccessGranted}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </div>
                            ) : isAccessGranted ? (
                                'Redirecting...'
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4" />
                                    Initialize Session
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                            Authorized personnel only • System logs active
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
