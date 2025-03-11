'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateMedicationSchedule } from '@/lib/neo4j'
import { toast } from "sonner"
import { Pill } from 'lucide-react'
import { motion } from 'framer-motion'

interface EditMedicationModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  medication: {
    medication: {
      id: string
      name: string
    }
    schedule: {
      schedule: string[]
      pillsPerDose: number[]
      days: string[]
      frequency: number
      dosage?: string
    }
  }
  onMedicationUpdated: () => void
}

export function EditMedicationModal({ isOpen, onClose, userId, medication, onMedicationUpdated }: EditMedicationModalProps) {
  const [currentSchedule, setCurrentSchedule] = useState({
    schedule: medication.schedule.schedule,
    pillsPerDose: medication.schedule.pillsPerDose,
    days: medication.schedule.days,
    frequency: medication.schedule.frequency,
    dosage: medication.schedule.dosage?.replace('mg', '') || '0.25'
  })
  const [isLoading, setIsLoading] = useState(false)

  const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateMedicationSchedule(userId, medication.medication.id, {
        ...currentSchedule,
        dosage: `${currentSchedule.dosage}mg`
      })
      toast.success("Medication updated successfully!")
      onMedicationUpdated()
      onClose()
    } catch (err) {
      console.error('Error updating medication:', err)
      toast.error("Failed to update medication")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {medication.medication.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage (mg)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                id="dosage"
                value={currentSchedule.dosage}
                onChange={(e) => setCurrentSchedule({ 
                  ...currentSchedule, 
                  dosage: e.target.value === '' ? '0' : e.target.value 
                })}
                step="0.25"
                className="w-32"
              />
              <span className="text-sm">mg</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Daily Frequency</Label>
            <Select
              value={currentSchedule.frequency.toString()}
              onValueChange={(value) => {
                const freq = parseInt(value)
                setCurrentSchedule({
                  ...currentSchedule,
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
                  <SelectItem key={freq} value={freq.toString()}>
                    {freq} time{freq > 1 ? 's' : ''} per day
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {Array.from({ length: currentSchedule.frequency }).map((_, index) => (
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
                    value={parseInt(currentSchedule.schedule[index].split(':')[0]) > 12 
                      ? (parseInt(currentSchedule.schedule[index].split(':')[0]) - 12).toString() 
                      : (parseInt(currentSchedule.schedule[index].split(':')[0]) === 0 ? "12" : currentSchedule.schedule[index].split(':')[0].replace(/^0/, ''))}
                    onValueChange={(value) => {
                      const newSchedule = [...currentSchedule.schedule]
                      const minutes = newSchedule[index].split(':')[1]
                      const hour = parseInt(value)
                      const isPM = parseInt(newSchedule[index].split(':')[0]) >= 12
                      const militaryHour = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour)
                      newSchedule[index] = `${militaryHour.toString().padStart(2, '0')}:${minutes}`
                      setCurrentSchedule({ ...currentSchedule, schedule: newSchedule })
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
                    value={currentSchedule.schedule[index].split(':')[1]}
                    onValueChange={(value) => {
                      const newSchedule = [...currentSchedule.schedule]
                      const hours = newSchedule[index].split(':')[0]
                      newSchedule[index] = `${hours}:${value}`
                      setCurrentSchedule({ ...currentSchedule, schedule: newSchedule })
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
                    value={parseInt(currentSchedule.schedule[index].split(':')[0]) >= 12 ? 'PM' : 'AM'}
                    onValueChange={(value) => {
                      const newSchedule = [...currentSchedule.schedule]
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
                      setCurrentSchedule({ ...currentSchedule, schedule: newSchedule })
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
                    value={currentSchedule.pillsPerDose[index].toString()}
                    onValueChange={(value) => {
                      const newPillsPerDose = [...currentSchedule.pillsPerDose]
                      newPillsPerDose[index] = parseInt(value)
                      setCurrentSchedule({ ...currentSchedule, pillsPerDose: newPillsPerDose })
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
                {Array.from({ length: currentSchedule.pillsPerDose[index] }).map((_, pillIndex) => (
                  <Pill key={pillIndex} className="h-6 w-6 text-primary" />
                ))}
              </div>
            </motion.div>
          ))}

          <div className="space-y-2">
            <Label>Days</Label>
            <div className="flex flex-wrap gap-2">
              <div 
                className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50"
                onClick={() => setCurrentSchedule({
                  ...currentSchedule,
                  days: ['Everyday']
                })}
              >
                <Checkbox 
                  checked={currentSchedule.days.includes('Everyday')}
                  onCheckedChange={() => {}}
                />
                <span>Everyday</span>
              </div>
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    if (currentSchedule.days.includes('Everyday')) {
                      setCurrentSchedule({
                        ...currentSchedule,
                        days: [day]
                      })
                    } else {
                      const newDays = currentSchedule.days.includes(day)
                        ? currentSchedule.days.filter(d => d !== day)
                        : [...currentSchedule.days, day]
                      setCurrentSchedule({
                        ...currentSchedule,
                        days: newDays
                      })
                    }
                  }}
                >
                  <Checkbox 
                    checked={currentSchedule.days.includes(day) || currentSchedule.days.includes('Everyday')}
                    onCheckedChange={() => {}}
                  />
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 