'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ChevronLeft, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getElderMedications, getUser } from '@/lib/neo4j'
import { useRouter } from 'next/navigation'

interface ElderDashboardProps {
  elderId: string
}

interface ElderData {
  id: string
  firstName: string
  lastName: string
  role: 'Elder' | 'Senior'
  age?: number
  phone?: string
}

interface Medication {
  medication: {
    id: string
    name: string
  }
  schedule: {
    schedule: string[]
    pillsPerDose: number[]
    days: string[]
    frequency: number
  }
}

interface ScheduledDose {
  medicationName: string
  time: string
  pillCount: number
}

export function ElderDashboardComponent({ elderId }: ElderDashboardProps) {
  const { user } = useUser()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elderData, setElderData] = useState<ElderData | null>(null)
  const [resolvedElderId, setResolvedElderId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const resolveId = async () => {
      try {
        const id = await Promise.resolve(elderId)
        setResolvedElderId(id)
      } catch (err) {
        console.error('Error resolving elder ID:', err)
        setError('Invalid elder ID')
      }
    }
    resolveId()
  }, [elderId])

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !resolvedElderId) return
      try {
        // Fetch elder's data
        const elder = await getUser(resolvedElderId)
        if (!elder) {
          setError('Elder not found')
          return
        }
        setElderData(elder)

        // Fetch elder's medications
        const meds = await getElderMedications(resolvedElderId)
        setMedications(meds)
      } catch (err) {
        console.error('Error fetching elder data:', err)
        setError('Failed to load elder data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedElderId, user])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  const getTodaysMedications = (): ScheduledDose[] => {
    const todayDate = new Date()
    const today = todayDate.toLocaleDateString('en-US', { weekday: 'short' })
    const todaysMeds: ScheduledDose[] = []

    medications.forEach(med => {
      const shouldTakeMed = med.schedule.days.includes('Everyday') || 
        med.schedule.days.some(day => {
          if (today === 'Tue' && day === 'T') return true
          if (today === 'Thu' && day === 'Th') return true
          if (today === 'Mon' && day === 'M') return true
          if (today === 'Wed' && day === 'W') return true
          if (today === 'Fri' && day === 'F') return true
          if (today === 'Sat' && day === 'Sa') return true
          if (today === 'Sun' && day === 'Su') return true
          return false
        })

      if (shouldTakeMed) {
        med.schedule.schedule.forEach((time, index) => {
          todaysMeds.push({
            medicationName: med.medication.name,
            time: time,
            pillCount: med.schedule.pillsPerDose[index]
          })
        })
      }
    })

    return todaysMeds.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime()
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime()
      return timeA - timeB
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div 
        className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-4xl relative z-10 space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <motion.h1 
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {elderData?.firstName}&apos;s Dashboard
            </motion.h1>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {getTodaysMedications().length === 0 ? (
                  <p className="text-gray-600">No medications scheduled for today.</p>
                ) : (
                  <div className="space-y-3">
                    {getTodaysMedications().map((dose, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{formatTime(dose.time)}</span>
                        <span className="text-gray-600">-</span>
                        <span>{dose.medicationName}</span>
                        <span className="text-gray-500">({dose.pillCount} pill{dose.pillCount > 1 ? 's' : ''})</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med, index) => (
                      <TableRow key={med.medication.id || index}>
                        <TableCell className="font-medium">{med.medication.name}</TableCell>
                        <TableCell>{med.schedule.pillsPerDose[0]} pill(s)</TableCell>
                        <TableCell>{med.schedule.frequency} time(s) daily</TableCell>
                        <TableCell>{med.schedule.schedule.map(formatTime).join(', ')}</TableCell>
                        <TableCell>{med.schedule.days.join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  )
}