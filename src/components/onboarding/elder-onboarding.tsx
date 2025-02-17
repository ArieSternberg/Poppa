'use client'

import { useState } from 'react'
import { Search, Edit2, ChevronRight, ChevronLeft, Pill, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createUser, linkUserToMedication, searchMedications, DrugResult } from '@/lib/neo4j'
import { useUser } from '@clerk/nextjs'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Medication, UserProfile } from './types'

interface ElderOnboardingProps {
  onBack: () => void;
}

export function ElderOnboardingComponent({ onBack }: ElderOnboardingProps) {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [medications, setMedications] = useState<Medication[]>([])
  const [currentMedication, setCurrentMedication] = useState<Medication>({
    id: '',
    name: '',
    brandName: '',
    genericName: '',
    dosage: 0.25,
    frequency: 1,
    schedule: ['08:00'],
    pillsPerDose: [1],
    days: ['Everyday']
  })
  const [searchResults, setSearchResults] = useState<DrugResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: 'Elder',
    sex: 'Male',
    age: 65
  })
  const router = useRouter()
  const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchMedications(query)
      setSearchResults(results)
      if (results.length === 0) {
        setError("Can't find that medication, sorry")
      }
    } catch (err) {
      setError("Can't find that medication, sorry")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMedication = () => {
    if (currentMedication.name) {
      setMedications([...medications, currentMedication])
      setCurrentMedication({
        id: '',
        name: '',
        brandName: '',
        genericName: '',
        dosage: 0.25,
        frequency: 1,
        schedule: ['08:00'],
        pillsPerDose: [1],
        days: ['Everyday']
      })
      setSelectedDrug(null)
      setSearchQuery('')
      setSearchResults([])
      setStep(2) // Back to medication search
    }
  }

  const handleEditMedication = (index: number) => {
    setCurrentMedication(medications[index])
    setMedications(medications.filter((_, i) => i !== index))
    setStep(3) // Go to medication details
    setSearchQuery(medications[index].name)
    setSearchResults([])
    setSelectedDrug(medications[index].name)
  }

  const handleFinish = async () => {
    if (!user) return

    try {
      // Create user profile
      await createUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: [user.primaryEmailAddress?.emailAddress || ''],
        phoneNumbers: [user.primaryPhoneNumber?.phoneNumber || '']
      }, userProfile)

      // Link to existing medications
      for (const med of medications) {
        const schedule = {
          schedule: med.schedule,
          pillsPerDose: med.pillsPerDose,
          days: med.days,
          frequency: med.frequency
        }

        await linkUserToMedication(user.id, med.id, schedule)
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
            onChange={(e) => setUserProfile({ ...userProfile, age: parseInt(e.target.value) || 65 })}
            min={1}
            max={120}
            className="mt-2"
          />
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

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Select Medication</h2>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for medication"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {isLoading && <p>Loading...</p>}
      {error && searchQuery.length >= 2 && <p className="text-red-500">{error}</p>}
      <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {searchResults.map((drug, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`p-2 hover:bg-gray-100 cursor-pointer rounded flex justify-between items-center ${
                selectedDrug === drug.name ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                setCurrentMedication({
                  ...currentMedication,
                  id: drug.id,
                  name: drug.name,
                  brandName: drug.brandName,
                  genericName: drug.genericName
                })
                setSearchQuery(drug.name)
                setSelectedDrug(drug.name)
              }}
            >
              <div>
                <p className="font-bold">{drug.name}</p>
                {drug.genericName && (
                  <p className="text-sm text-gray-500">{drug.genericName}</p>
                )}
              </div>
              {selectedDrug === drug.name && (
                <Button size="sm" variant="outline" onClick={(e) => {
                  e.stopPropagation()
                  setStep(3)
                }}>
                  Add
                </Button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )

  const renderMedicationSearch = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Select Your Medications</h2>
      <p className="text-gray-600">Search for your medications by name and add them to your list.</p>
      {renderStep1()}
      {medications.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-primary">Medication</TableHead>
                <TableHead className="font-semibold text-primary">Daily Takes</TableHead>
                <TableHead className="font-semibold text-primary">Days</TableHead>
                <TableHead className="font-semibold text-primary">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((med, index) => (
                <TableRow key={index}>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>{med.frequency}</TableCell>
                  <TableCell>{med.days.join(', ')}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditMedication(index)} variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex justify-between">
        <Button onClick={() => setStep(1)} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {medications.length > 0 && (
          <Button onClick={() => setStep(5)}>
            Done Adding Medications
          </Button>
        )}
      </div>
    </motion.div>
  )

  const renderMedicationDetails = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Medication Details: {currentMedication.name}</h2>
      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage (mg)</Label>
        <Select
          value={currentMedication.dosage.toString()}
          onValueChange={(value) => setCurrentMedication({ ...currentMedication, dosage: parseFloat(value) })}
        >
          <SelectTrigger id="dosage">
            <SelectValue placeholder="Select dosage" />
          </SelectTrigger>
          <SelectContent>
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((dose) => (
              <SelectItem key={dose} value={dose.toString()}>{dose} mg</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="frequency">Daily Frequency</Label>
        <Select
          value={currentMedication.frequency.toString()}
          onValueChange={(value) => {
            const freq = parseInt(value)
            setCurrentMedication({
              ...currentMedication,
              frequency: freq,
              schedule: Array(freq).fill('08:00'),
              pillsPerDose: Array(freq).fill(1)
            })
          }}
        >
          <SelectTrigger id="frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((freq) => (
              <SelectItem key={freq} value={freq.toString()}>{freq} time{freq > 1 ? 's' : ''} per day</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Days</Label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={currentMedication.days.includes(day)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCurrentMedication({
                      ...currentMedication,
                      days: [...currentMedication.days.filter(d => d !== 'Everyday'), day]
                    })
                  } else {
                    setCurrentMedication({
                      ...currentMedication,
                      days: currentMedication.days.filter(d => d !== day)
                    })
                  }
                }}
              />
              <Label htmlFor={day}>{day}</Label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="everyday"
              checked={currentMedication.days.includes('Everyday')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setCurrentMedication({ ...currentMedication, days: ['Everyday'] })
                } else {
                  setCurrentMedication({ ...currentMedication, days: [] })
                }
              }}
            />
            <Label htmlFor="everyday">Everyday</Label>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <Button onClick={() => setStep(2)} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={() => setStep(4)}
          disabled={currentMedication.days.length === 0}
        >
          Set Schedule <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )

  const renderSchedule = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Schedule for {currentMedication.name}</h2>
      {currentMedication.schedule.map((time, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="space-y-2 border p-4 rounded-lg"
        >
          <Label htmlFor={`time-${index}`}>Dose {index + 1}</Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Select
                value={parseInt(time.split(':')[0]) > 12 
                  ? (parseInt(time.split(':')[0]) - 12).toString() 
                  : (parseInt(time.split(':')[0]) === 0 ? "12" : time.split(':')[0].replace(/^0/, ''))}
                onValueChange={(value) => {
                  const newSchedule = [...currentMedication.schedule]
                  const minutes = newSchedule[index].split(':')[1]
                  const hour = parseInt(value)
                  const isPM = parseInt(newSchedule[index].split(':')[0]) >= 12
                  const militaryHour = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour)
                  newSchedule[index] = `${militaryHour.toString().padStart(2, '0')}:${minutes}`
                  setCurrentMedication({ ...currentMedication, schedule: newSchedule })
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>:</span>
              <Select
                value={time.split(':')[1]}
                onValueChange={(value) => {
                  const newSchedule = [...currentMedication.schedule]
                  const hours = newSchedule[index].split(':')[0]
                  newSchedule[index] = `${hours}:${value}`
                  setCurrentMedication({ ...currentMedication, schedule: newSchedule })
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {['00', '15', '30', '45'].map((minute) => (
                    <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={parseInt(time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                onValueChange={(value) => {
                  const newSchedule = [...currentMedication.schedule]
                  const [hours, minutes] = newSchedule[index].split(':')
                  const hour = parseInt(hours)
                  const currentIsPM = hour >= 12
                  const newIsPM = value === 'PM'
                  
                  let newHour = hour
                  if (currentIsPM && !newIsPM) { // PM to AM
                    newHour = hour === 12 ? 0 : hour - 12
                  } else if (!currentIsPM && newIsPM) { // AM to PM
                    newHour = hour === 0 ? 12 : hour + 12
                  }
                  
                  newSchedule[index] = `${newHour.toString().padStart(2, '0')}:${minutes}`
                  setCurrentMedication({ ...currentMedication, schedule: newSchedule })
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Pills:</span>
              <Select
                value={currentMedication.pillsPerDose[index].toString()}
                onValueChange={(value) => {
                  const newPillsPerDose = [...currentMedication.pillsPerDose]
                  newPillsPerDose[index] = parseInt(value)
                  setCurrentMedication({ ...currentMedication, pillsPerDose: newPillsPerDose })
                }}
              >
                <SelectTrigger className="w-[60px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            {Array.from({ length: currentMedication.pillsPerDose[index] }).map((_, pillIndex) => (
              <Pill key={pillIndex} className="h-6 w-6 text-primary" />
            ))}
          </div>
        </motion.div>
      ))}
      <div className="flex justify-between">
        <Button onClick={() => setStep(3)} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleAddMedication}>
          Add Medication
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
        <p>Thank you for setting up your profile and medications.</p>
      )}
      <User className="w-16 h-16 mx-auto text-primary" />
      <div>
        <p><strong>Sex:</strong> {userProfile.sex}</p>
        <p><strong>Age:</strong> {userProfile.age}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mt-4 mb-2">Your Medications</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-primary">Medication</TableHead>
              <TableHead className="font-semibold text-primary">Daily Takes</TableHead>
              <TableHead className="font-semibold text-primary">Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med, index) => (
              <TableRow key={index}>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.frequency}</TableCell>
                <TableCell>{med.days.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
          {step === 2 && renderMedicationSearch()}
          {step === 3 && renderMedicationDetails()}
          {step === 4 && renderSchedule()}
          {step === 5 && renderComplete()}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 