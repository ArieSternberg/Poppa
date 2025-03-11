'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface OnboardingModalProps {
  isOpen: boolean
}

export function OnboardingModal({ isOpen }: OnboardingModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleStartOnboarding = () => {
    // Clear any existing onboarding data
    localStorage.removeItem('selectedRole')
    localStorage.removeItem('elderProfile')
    localStorage.removeItem('elderMedications')
    localStorage.removeItem('caretakerProfile')
    localStorage.removeItem('elderConnection')
    
    router.push('/onboarding')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Welcome to Poppa.AI!</h2>
        <p className="text-gray-600 text-center">
          Before you can access your dashboard, we need to set up your profile and medications.
          This will only take a few minutes.
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={handleStartOnboarding}
            className="bg-[#00856A] hover:bg-[#006B55] text-white"
          >
            Start Onboarding
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 