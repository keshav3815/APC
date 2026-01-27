'use client'

import { ChevronDown } from 'lucide-react'

export default function ScrollIndicator() {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-down">
      <div className="flex flex-col items-center">
        <span className="text-white text-sm font-medium mb-2">Scroll to explore</span>
        <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </div>
  )
}
