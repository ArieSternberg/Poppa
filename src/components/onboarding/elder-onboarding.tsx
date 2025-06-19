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
import { createUser, linkUserToMedication, searchMedications } from '@/lib/neo4j'
import { useUser } from '@clerk/nextjs'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { UserProfile } from './types'
import { getSession } from '@/lib/neo4j'

interface ElderOnboardingProps {
  onBack: () => void;
  onComplete: () => void;
}

interface DrugResult {
  id: string
  Name: string
  brandName: string
  genericName: string
}

interface Medication {
  id: string
  Name: string
  brandName: string
  genericName: string
  dosage: number
  frequency: number
  schedule: string[]
  pillsPerDose: number[]
  days: string[]
}

export function ElderOnboardingComponent({ onBack, onComplete }: ElderOnboardingProps) {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DrugResult[]>([])
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMedication, setCurrentMedication] = useState<Medication>({
    id: '',
    Name: '',
    brandName: '',
    genericName: '',
    dosage: 0.25,
    frequency: 1,
    schedule: ['08:00'],
    pillsPerDose: [1],
    days: ['Everyday']
  })
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: 'Elder',
    sex: 'Male',
    age: 65,
    language: 'en'
  })
  const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 3) {
      setSearchResults([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchMedications(query)
      console.log('Search results with IDs:', results)
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
    console.log('Adding medication with data:', currentMedication)
    if (currentMedication.Name) {
      setMedications([...medications, currentMedication])
      console.log('Updated medications list:', [...medications, currentMedication])
      setCurrentMedication({
        id: '',
        Name: '',
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
    console.log('Editing medication:', medications[index])
    setCurrentMedication(medications[index])
    setMedications(medications.filter((_, i) => i !== index))
    setStep(3) // Go to medication details
    setSearchQuery(medications[index].Name)
    setSearchResults([])
    setSelectedDrug(medications[index].Name)
  }

  const handleFinish = async () => {
    if (!user) {
      // Store profile data in localStorage
      localStorage.setItem('elderProfile', JSON.stringify(userProfile))
      localStorage.setItem('elderMedications', JSON.stringify(medications))
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

      // Link to existing medications
      const session = await getSession()
      for (const med of medications) {
        try {
          // Create or find medication node and get its elementId
          const result = await session.run(`
            MERGE (m:Medication {Name: $name})
            ON CREATE SET m.id = randomUUID()
            RETURN elementId(m) as id, m
          `, { name: med.Name })

          if (!result.records || result.records.length === 0) {
            throw new Error('Failed to create medication')
          }

          const medicationId = result.records[0].get('id').toString()
          const schedule = {
            schedule: med.schedule,
            pillsPerDose: med.pillsPerDose,
            days: med.days,
            frequency: med.frequency,
            dosage: `${med.dosage}mg`
          }

          const linkResult = await linkUserToMedication(user.id, medicationId, schedule)
          if (!linkResult) {
            throw new Error(`Failed to link medication: ${med.Name}`)
          }
        } catch (error) {
          console.error('Error processing medication:', med.Name, error)
          throw error // Re-throw to be caught by outer try-catch
        }
      }
      await session.close()

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
      {error && searchQuery.length >= 3 && <p className="text-red-500">{error}</p>}
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
                selectedDrug === drug.Name ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                console.log('Selected drug with ID:', drug.id)
                setSearchQuery(drug.Name)
                setSelectedDrug(drug.Name)
                setCurrentMedication({
                  ...currentMedication,
                  id: drug.id,
                  Name: drug.Name,
                  brandName: drug.brandName || '',
                  genericName: drug.genericName || ''
                })
              }}
            >
              <div>
                <p className="font-bold">{drug.Name}</p>
                {drug.genericName && (
                  <p className="text-sm text-gray-500">{drug.genericName}</p>
                )}
              </div>
              {selectedDrug === drug.Name && (
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
                  <TableCell>{med.Name}</TableCell>
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
      <h2 className="text-2xl font-bold">Medication Details: {currentMedication.Name}</h2>
      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage (mg)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            id="dosage"
            value={currentMedication.dosage || ''}
            onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            min={0}
            step="0.25"
            className="w-32"
          />
          <span className="text-sm">mg</span>
        </div>
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
      <h2 className="text-2xl font-bold">Schedule for {currentMedication.Name}</h2>
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
                <TableCell>{med.Name}</TableCell>
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