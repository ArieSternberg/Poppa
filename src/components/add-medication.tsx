'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronRight, ChevronLeft, Pill } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createMedication, linkUserToMedication } from '@/lib/neo4j'
import { toast } from "sonner"

interface DrugResult {
  brand_name: string
  generic_name: string
}

interface FDADrugResult {
  brand_name: string
  generic_name: string
  [key: string]: string // for other fields we don't use
}

export function AddMedicationComponent() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [currentMedication, setCurrentMedication] = useState({
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
      const response = await fetch(`https://api.fda.gov/drug/ndc.json?search=(brand_name:"${query}"+generic_name:"${query}")&limit=5`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      const results = data.results.map((result: FDADrugResult) => ({
        brand_name: result.brand_name,
        generic_name: result.generic_name
      }))
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

  const handleFinish = async () => {
    if (!user) return

    try {
      // Create or find medication node
      const [medicationRecord] = await createMedication({ name: currentMedication.name })
      const medicationId = medicationRecord.get('m').properties.id

      // Create relationship with schedule details
      const schedule = {
        schedule: currentMedication.schedule,
        pillsPerDose: currentMedication.pillsPerDose,
        days: currentMedication.days,
        frequency: currentMedication.frequency
      }

      await linkUserToMedication(user.id, medicationId, schedule)
      toast.success("Medication added successfully!")
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving medication:', error)
      toast.error("Failed to add medication")
    }
  }

  const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

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
                selectedDrug === (drug.brand_name || drug.generic_name) ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                const drugName = drug.brand_name || drug.generic_name
                setCurrentMedication({
                  ...currentMedication,
                  name: drugName,
                  brandName: drug.brand_name,
                  genericName: drug.generic_name
                })
                setSearchQuery(drugName)
                setSelectedDrug(drugName)
              }}
            >
              <p className="font-bold">{drug.brand_name || drug.generic_name}</p>
              {selectedDrug === (drug.brand_name || drug.generic_name) && (
                <Button size="sm" variant="outline" onClick={(e) => {
                  e.stopPropagation()
                  setStep(2)
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

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">{currentMedication.brandName || currentMedication.genericName}</h2>
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
        <Button onClick={() => setStep(1)} variant="outline"><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={() => setStep(3)}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold">Schedule Intake</h2>
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
        <Button onClick={() => setStep(2)} variant="outline"><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={handleFinish}>Add Medication</Button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div 
        className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md relative z-10"
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
          Add New Medication
        </motion.h1>
        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 