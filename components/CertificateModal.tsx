'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Achievement } from '@/data/achievements'

interface CertificateModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
}

export function CertificateModal({ achievement, isOpen, onClose }: CertificateModalProps) {
  const [pdfError, setPdfError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && achievement) {
      setPdfError(false)
      setIsLoading(true)
    }
  }, [isOpen, achievement])

  const handleIframeError = useCallback(() => {
    setPdfError(true)
    setIsLoading(false)
  }, [])

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (!achievement || !achievement.certificateFile) return null

  const isPDF = achievement.certificateFile.toLowerCase().endsWith('.pdf')
  const isImage = !isPDF

  // Add error boundary for PDF URLs
  const sanitizedPdfUrl = isPDF 
    ? `${achievement.certificateFile}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-width`
    : ''

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <div>
                    <h2 id="modal-title" className="text-xl md:text-2xl font-bold">
                      {achievement.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {achievement.organization}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={achievement.certificateFile}
                      download
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download Certificate"
                      aria-label="Download certificate"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] md:h-[80vh]">
                  {isImage ? (
                    <div className="flex-1 p-4 md:p-6 overflow-auto">
                      <div className="relative w-full aspect-[4/3] max-w-4xl mx-auto bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                        <Image
                          src={achievement.certificateFile}
                          alt={`Certificate for ${achievement.title}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 80vw"
                          priority
                          onLoadingComplete={() => setIsLoading(false)}
                        />
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                          </div>
                        )}
                      </div>
                      {/* Description */}
                      <div className="mt-6 max-w-4xl mx-auto">
                        <p className="text-gray-700 dark:text-gray-300">
                          {achievement.description}
                        </p>
                        {achievement.verificationUrl && (
                          <a
                            href={achievement.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Verify Certificate
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                      {!pdfError ? (
                        <>
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                  Loading PDF...
                                </p>
                              </div>
                            </div>
                          )}
                          <iframe
                            src={sanitizedPdfUrl}
                            className="w-full h-full border-0"
                            title={`PDF Certificate: ${achievement.title}`}
                            onError={handleIframeError}
                            onLoad={handleIframeLoad}
                            style={{ display: isLoading ? 'none' : 'block' }}
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8 max-w-md">
                            <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <FileText className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                              PDF Certificate
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                              Unable to preview PDF. Click the button below to open it.
                            </p>
                            <a
                              href={achievement.certificateFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              <ExternalLink className="h-5 w-5" />
                              Open PDF Certificate
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}