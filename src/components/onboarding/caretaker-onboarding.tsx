'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, User, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createUser, findUserByPhone, createCaretakerRelationship } from '@/lib/neo4j'
import { useUser } from '@clerk/nextjs'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { UserProfile, ElderConnection } from './types'

interface CaretakerOnboardingProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CaretakerOnboardingComponent({ onBack, onComplete }: CaretakerOnboardingProps) {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: 'Caretaker',
    sex: 'Male',
    age: 35,
    language: 'en'  // Default to English
  })
  const [elderConnection, setElderConnection] = useState<ElderConnection>({
    phoneNumber: '',
    elderUser: null
  })
  const router = useRouter()

  const handleFinish = async () => {
    if (!user) {
      // Store profile data in localStorage
      localStorage.setItem('caretakerProfile', JSON.stringify(userProfile))
      localStorage.setItem('elderConnection', JSON.stringify(elderConnection))
      onComplete()
      return
    }

    try {
      // Create user profile
      await createUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: [user.primaryEmailAddress?.emailAddress || ''],
        phoneNumbers: [user.primaryPhoneNumber?.phoneNumber || '']
      }, userProfile)

      // Create relationship with elder
      if (elderConnection.elderUser) {
        await createCaretakerRelationship(user.id, elderConnection.elderUser.id)
      }

      toast.success("Profile created successfully!")
      setError(null)
      router.push('/dashboard')
    } catch (err) {
      console.error('Error creating profile:', err)
      toast.error("Failed to create profile")
      setError("Failed to create profile")
    }
  }

  const renderUserProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>
      <div className="space-y-4">
        <div>
          <Label>Sex</Label>
          <RadioGroup
            value={userProfile.sex}
            onValueChange={(value) => setUserProfile({ ...userProfile, sex: value as 'Male' | 'Female' | 'Other' })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <RadioGroupItem value="Male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <RadioGroupItem value="Female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <RadioGroupItem value="Other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            type="number"
            id="age"
            value={userProfile.age}
            onChange={(e) => setUserProfile({ ...userProfile, age: parseInt(e.target.value) || 35 })}
            min={1}
            max={120}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Language Preference</Label>
          <RadioGroup
            value={userProfile.language}
            onValueChange={(value) => setUserProfile({ ...userProfile, language: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en">English</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <RadioGroupItem value="es" id="es" />
              <Label htmlFor="es">Español</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={() => setStep(2)}
            disabled={!userProfile.sex || !userProfile.age}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )

  const renderElderConnection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Connect with Your Elder</h2>
      <p className="text-gray-600">
        Search for your elder if they already have an account.
      </p>
      
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={elderConnection.phoneNumber}
            onChange={(e) => {
              setElderConnection(prev => ({
                ...prev,
                phoneNumber: e.target.value,
                elderUser: null
              }))
              setError(null)
            }}
            className="pl-10"
          />
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              // Remove formatting and add +1
              const cleanedNumber = '+1' + elderConnection.phoneNumber.replace(/\D/g, '')
              if (cleanedNumber.length < 12) { // +1 plus 10 digits
                setError('Please enter a valid phone number')
                return
              }

              try {
                const elder = await findUserByPhone(cleanedNumber)
                if (elder && elder.role === 'Elder') {
                  setElderConnection(prev => ({
                    ...prev,
                    elderUser: elder
                  }))
                  setError(null)
                  // Store data
                  localStorage.setItem('caretakerProfile', JSON.stringify(userProfile))
                  localStorage.setItem('elderConnection', JSON.stringify({ 
                    ...elderConnection, 
                    elderUser: elder,
                    phoneNumber: cleanedNumber // Store the full number with +1
                  }))
                } else if (elder) {
                  setError('This user is not registered as an elder')
                  setElderConnection(prev => ({
                    ...prev,
                    elderUser: null
                  }))
                } else {
                  setError('No user found with this phone number')
                  setElderConnection(prev => ({
                    ...prev,
                    elderUser: null
                  }))
                }
              } catch (error) {
                console.error('Error searching for elder:', error)
                setError('Error searching for elder')
                setElderConnection(prev => ({
                  ...prev,
                  elderUser: null
                }))
              }
            }}
            className="flex-1"
            disabled={elderConnection.phoneNumber.replace(/\D/g, '').length < 10}
          >
            Search for Elder
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        
        {elderConnection.elderUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 p-4 rounded-lg"
          >
            <p className="text-green-700">Elder found:</p>
            <p className="font-medium">{elderConnection.elderUser.firstName} {elderConnection.elderUser.lastName}</p>
            <p className="text-sm text-green-600">Age: {elderConnection.elderUser.age}</p>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={() => setStep(1)} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={onComplete}
          disabled={!elderConnection.elderUser && !localStorage.getItem('elderConnection')}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 text-center"
    >
      <h2 className="text-2xl font-bold">Setup Complete!</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>Thank you for setting up your profile.</p>
      )}
      <User className="w-16 h-16 mx-auto text-primary" />
      <div>
        <p><strong>Sex:</strong> {userProfile.sex}</p>
        <p><strong>Age:</strong> {userProfile.age}</p>
      </div>
      {elderConnection.elderUser && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Connected Elder</h3>
          <p>{elderConnection.elderUser.firstName} {elderConnection.elderUser.lastName}</p>
          <p className="text-sm text-gray-600">Age: {elderConnection.elderUser.age}</p>
        </div>
      )}
      <Button onClick={handleFinish} className="mt-4">Get Started!</Button>
    </motion.div>
  )

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
          Meds Tracking
        </motion.h1>
        <AnimatePresence mode="wait">
          {step === 1 && renderUserProfile()}
          {step === 2 && renderElderConnection()}
          {step === 3 && renderComplete()}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 