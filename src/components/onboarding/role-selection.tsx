'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ElderOnboardingComponent } from './elder-onboarding'
import { CaretakerOnboardingComponent } from './caretaker-onboarding'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export type Role = 'Senior' | 'Caretaker' | null

export function RoleSelectionComponent() {
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    // Store role in localStorage for after sign up
    if (role) {
      localStorage.setItem('selectedRole', role)
    }
  }

  const handleOnboardingComplete = () => {
    router.push('/sign-up')
  }

  if (selectedRole === 'Senior') {
    return <ElderOnboardingComponent onBack={() => setSelectedRole(null)} onComplete={handleOnboardingComplete} />
  }

  if (selectedRole === 'Caretaker') {
    return <CaretakerOnboardingComponent onBack={() => setSelectedRole(null)} onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div 
        className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md relative z-10"
        style={{
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 
          className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to Meds Tracking
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold mb-4">I am a...</h2>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50"
            onClick={() => handleRoleSelect('Senior')}
          >
            <h3 className="text-lg font-medium">Senior</h3>
            <p className="text-gray-600">I need help managing my medications</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50"
            onClick={() => handleRoleSelect('Caretaker')}
          >
            <h3 className="text-lg font-medium">Caretaker</h3>
            <p className="text-gray-600">I help others manage their medications</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
} 