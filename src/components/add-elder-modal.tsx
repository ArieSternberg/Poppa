import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { findUserByPhone, createCaretakerRelationship } from '@/lib/neo4j'
import { toast } from "sonner"
import { Phone, User } from 'lucide-react'

interface ElderUser {
  id: string
  role: string
  phone: string
  firstName: string
  lastName: string
  age: number
  name?: string
}

interface AddElderModalProps {
  isOpen: boolean
  onClose: () => void
  caretakerId: string
  onElderAdded: () => void
}

export function AddElderModal({ isOpen, onClose, caretakerId, onElderAdded }: AddElderModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [elderUser, setElderUser] = useState<ElderUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const elder = await findUserByPhone(phoneNumber)
      if (elder && elder.role === 'Elder') {
        setElderUser(elder)
        setError(null)
      } else if (elder) {
        setError('This user is not registered as an elder')
        setElderUser(null)
      } else {
        setError('No user found with this phone number')
        setElderUser(null)
      }
    } catch (err) {
      console.error('Error searching for elder:', err)
      setError('Error searching for elder')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!elderUser) return

    setLoading(true)
    try {
      await createCaretakerRelationship(caretakerId, elderUser.id)
      toast.success('Elder added successfully')
      onElderAdded()
      onClose()
    } catch (err) {
      console.error('Error connecting with elder:', err)
      toast.error('Failed to add elder')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Add an Elder</h2>
        <p className="text-gray-600 text-center">
          Enter the elder&apos;s phone number to connect with them
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setElderUser(null)
                setError(null)
              }}
              className="pl-10"
              disabled={loading}
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <Button 
            onClick={handleSearch}
            className="w-full"
            disabled={loading || phoneNumber.length < 10}
          >
            Search
          </Button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {elderUser && (
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">
                  {elderUser.firstName} {elderUser.lastName}
                </p>
              </div>
              <p className="text-sm text-green-600">Age: {elderUser.age}</p>
              <Button 
                onClick={handleConnect}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                Connect
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 