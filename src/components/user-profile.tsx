'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { updateUser, deleteUser, getUser } from '@/lib/neo4j'

export function UserProfileComponent() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: user?.primaryPhoneNumber?.phoneNumber || '',
    age: '',
    role: '',
    sex: ''
  })

  // Fetch current user data from Neo4j when component mounts
  useState(async () => {
    if (user) {
      try {
        const userData = await getUser(user.id)
        if (userData) {
          // If there's a pending phone update and we now have a phone number, update it
          if (userData.pendingPhoneUpdate && user.primaryPhoneNumber?.phoneNumber) {
            await updateUser(user.id, {
              phone: user.primaryPhoneNumber.phoneNumber
            })
          }
          
          setFormData(prev => ({
            ...prev,
            age: userData.age || '',
            role: userData.role || '',
            sex: userData.sex || '',
          }))
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  })

  const handleUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update in Neo4j
      await updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        role: formData.role,
        sex: formData.sex
      })

      // Update in Clerk
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName
      })

      if (formData.email !== user.primaryEmailAddress?.emailAddress) {
        await user.createEmailAddress({ email: formData.email })
      }

      if (formData.phone !== user.primaryPhoneNumber?.phoneNumber) {
        await user.createPhoneNumber({ phoneNumber: formData.phone })
      }

      toast.success("Profile updated successfully")
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Delete from Neo4j first
      await deleteUser(user.id)
      
      // Delete from Clerk
      await user.delete()
      
      // Sign out
      await signOut()
      
      // Redirect to home
      router.push('/')
      
      toast.success("Account deleted successfully")
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error("Failed to delete account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div 
        className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Elder" id="elder" />
                  <Label htmlFor="elder">Elder</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Caretaker" id="caretaker" />
                  <Label htmlFor="caretaker">Caretaker</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Sex</Label>
              <RadioGroup
                value={formData.sex}
                onValueChange={(value) => setFormData({ ...formData, sex: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 