'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Bell, Settings, LogOut, Clock, Trash2, User, BellOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getUserMedications, deleteMedicationForUser, getUser, getCaretakerElders } from '@/lib/neo4j'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { OnboardingModal } from './onboarding-modal'
import { ElderCard } from './elder-card'
import { AddElderModal } from './add-elder-modal'
import { checkNotificationPermission, requestNotificationPermission, sendTestNotification } from '@/lib/notifications'
import { useMedicationNotifications } from '@/hooks/use-medication-notifications'

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

interface UserData {
  id: string
  role: 'Elder' | 'Caretaker'
  name?: string
  phone?: string
}

interface Elder {
  id: string
  firstName: string
  lastName: string
  age: number
  name: string
  phone: string
  medications?: Medication[]
}

export function DashboardComponent() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [elders, setElders] = useState<Elder[]>([])
  const [showAddElder, setShowAddElder] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<string>('default')
  const router = useRouter()

  // Initialize notification status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNotificationStatus(checkNotificationPermission())
    }
  }, [])

  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission()
    setNotificationStatus(permission)
    if (permission === 'granted') {
      toast.success('Notifications enabled successfully!')
      sendTestNotification()
    } else if (permission === 'denied') {
      toast.error('Please enable notifications in your browser settings')
    }
  }

  // Use the notification hook for medication reminders
  useMedicationNotifications(
    medications,
    notificationStatus === 'granted'
  );

  const checkUserExists = useCallback(async () => {
    if (!user) return
    try {
      const userData = await getUser(user.id)
      if (!userData) {
        setShowOnboarding(true)
      } else {
        setUserData(userData)
        // If user is a caretaker, fetch their elders
        if (userData.role === 'Caretaker') {
          const eldersList = await getCaretakerElders(user.id)
          setElders(eldersList)
        }
      }
    } catch (err) {
      console.error('Error checking user existence:', err)
      setShowOnboarding(true)
    }
  }, [user])

  const fetchMedications = useCallback(async () => {
    if (!user) return
    try {
      const meds = await getUserMedications(user.id)
      setMedications(meds)
    } catch (err) {
      console.error('Error fetching medications:', err)
      setError('Failed to load medications')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      checkUserExists()
      fetchMedications()
    }
  }, [user, checkUserExists, fetchMedications])

  const handleDelete = async (medicationId: string) => {
    if (!user || !medicationId || deleting) return
    
    try {
      setDeleting(medicationId)
      await deleteMedicationForUser(user.id, medicationId)
      await fetchMedications() // Refresh the list
      toast.success("Medication deleted successfully")
    } catch (err) {
      console.error('Error deleting medication:', err)
      toast.error("Failed to delete medication")
    } finally {
      setDeleting(null)
    }
  }

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
      // Check if medication is for everyday or if any of the days match today
      const shouldTakeMed = med.schedule.days.includes('Everyday') || 
        med.schedule.days.some(day => {
          // Handle special cases for Tuesday and Thursday
          if (today === 'Tue' && day === 'T') return true
          if (today === 'Thu' && day === 'Th') return true
          // Handle other days
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

    // Sort by time
    return todaysMeds.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime()
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime()
      return timeA - timeB
    })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error("Failed to sign out")
    }
  }

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} />
      <AddElderModal 
        isOpen={showAddElder}
        onClose={() => setShowAddElder(false)}
        caretakerId={user?.id || ''}
        onElderAdded={checkUserExists}
      />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div 
          className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-4xl relative z-10 space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <motion.h1 
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome, {user?.firstName || "User"}!
            </motion.h1>
            <div className="flex gap-4">
              <div className="relative">
                {notificationStatus === 'granted' ? (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => sendTestNotification()}
                    className="text-green-500"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                ) : notificationStatus === 'denied' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400"
                    onClick={() => toast.error('Please enable notifications in your browser settings')}
                  >
                    <BellOff className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEnableNotifications}
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {userData?.role === 'Elder' && (
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
                  <CardTitle>Your Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading medications...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
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
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-red-100 hover:text-red-500 h-8 w-8"
                                onClick={() => handleDelete(med.medication.id)}
                                disabled={deleting === med.medication.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button onClick={() => router.push('/add-medication')}>
                  Add New Medication
                </Button>
              </div>
            </>
          )}

          {userData?.role === 'Caretaker' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Your Elders</CardTitle>
                <Button
                  onClick={() => setShowAddElder(true)}
                  className="bg-[#00856A] hover:bg-[#006B55] text-white"
                >
                  Add Elder
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {elders.map((elder) => (
                    <ElderCard key={elder.id} elder={elder} />
                  ))}
                  {elders.length === 0 && (
                    <p className="text-gray-500 col-span-2 text-center py-4">
                      No elders added yet. Click &quot;Add Elder&quot; to connect with an elder.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </>
  )
} 