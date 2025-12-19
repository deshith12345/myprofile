import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  label?: string
  className?: string
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {value}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

