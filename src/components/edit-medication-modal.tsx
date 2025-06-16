'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
      Name: string
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
    days: medication.schedule.days || ['Everyday'],
    frequency: medication.schedule.frequency,
    dosage: medication.schedule.dosage?.replace('mg', '') || '0.25'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateMedicationSchedule(userId, medication.medication.id, {
        ...currentSchedule,
        dosage: `${currentSchedule.dosage}mg`
      })
      onMedicationUpdated()
      onClose()
      toast.success("Medication schedule updated successfully!")
    } catch (error) {
      console.error('Error updating medication schedule:', error)
      toast.error("Failed to update medication schedule")
    } finally {
      setIsLoading(false)
    }
  }

  const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {medication.medication.Name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
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
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((freq) => (
                  <SelectItem key={freq} value={freq.toString()}>{freq} time{freq > 1 ? 's' : ''} per day</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {Array.from({ length: currentSchedule.frequency }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Label>Time {index + 1}</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={currentSchedule.schedule[index].split(':')[0]}
                    onValueChange={(value) => {
                      const newSchedule = [...currentSchedule.schedule]
                      const minutes = newSchedule[index].split(':')[1]
                      newSchedule[index] = `${value}:${minutes}`
                      setCurrentSchedule({ ...currentSchedule, schedule: newSchedule })
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour.toString().padStart(2, '0')}
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