'use client'

import { SignUp } from "@clerk/nextjs"
import { useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { createUser, createCaretakerRelationship, linkUserToMedication, getUserMedications } from '@/lib/neo4j'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import type { Role } from '@/components/onboarding/role-selection'

export default function Page() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    const handlePostSignUp = async () => {
      console.log('handlePostSignUp called', { isSignedIn, userId: user?.id })
      
      if (!user) {
        console.error('No user available')
        return
      }

      const selectedRole = localStorage.getItem('selectedRole') as Role
      if (!selectedRole) {
        console.error('No role selected')
        router.push('/onboarding')
        return
      }

      try {
        if (selectedRole === 'Elder') {
          const elderProfile = JSON.parse(localStorage.getItem('elderProfile') || '{}')
          const elderMedications = JSON.parse(localStorage.getItem('elderMedications') || '[]')
          
          console.log('Creating elder profile:', { userId: user.id, elderProfile })
          // Create user profile
          const userResult = await createUser(user.id, {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            emailAddresses: [user.primaryEmailAddress?.emailAddress || ''],
            phoneNumbers: [user.primaryPhoneNumber?.phoneNumber || '']
          }, {
            ...elderProfile,
            role: selectedRole
          })

          console.log('User creation result:', userResult)

          if (!userResult) {
            throw new Error('Failed to create user profile')
          }

          // Send welcome notification
          try {
            const response = await fetch('/api/notifications/welcome_elder', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumber: user.primaryPhoneNumber?.phoneNumber || '',
                userName: user.firstName || ''
              }),
            });

            if (!response.ok) {
              console.error('Failed to send welcome notification:', await response.text());
            }
          } catch (error) {
            console.error('Error sending welcome notification:', error);
            // Don't throw here, we want to continue even if notification fails
          }

          console.log('Linking medications:', elderMedications)
          // Link medications
          const medicationResults = []
          for (const med of elderMedications) {
            try {
              console.log('Attempting to link medication:', {
                id: med.id,
                name: med.name,
                schedule: {
                  schedule: med.schedule,
                  pillsPerDose: med.pillsPerDose,
                  days: med.days,
                  frequency: med.frequency,
                  dosage: med.dosage.toString()
                }
              })
              
              if (!med.id) {
                console.error('Missing medication ID for:', med.name)
                medicationResults.push({ 
                  medication: med, 
                  success: false, 
                  error: new Error(`Missing medication ID for: ${med.name}`) 
                })
                continue
              }
              
              const linkResult = await linkUserToMedication(user.id, med.id, {
                schedule: med.schedule,
                pillsPerDose: med.pillsPerDose,
                days: med.days,
                frequency: med.frequency,
                dosage: `${med.dosage}mg`
              })
              console.log('Medication link result:', { medicationId: med.id, result: linkResult })
              
              if (!linkResult) {
                const error = new Error(`Failed to link medication: ${med.name}`)
                console.error(error)
                medicationResults.push({ medication: med, success: false, error })
                // Show error but don't redirect yet
                toast.error(`Failed to link medication: ${med.name}`)
              } else {
                medicationResults.push({ medication: med, success: true })
                toast.success(`Successfully linked medication: ${med.name}`)
              }
            } catch (error) {
              console.error('Error linking medication:', med, error)
              medicationResults.push({ 
                medication: med, 
                success: false, 
                error: error instanceof Error ? error : new Error('Unknown error occurred') 
              })
              // Show error but don't redirect yet
              toast.error(`Error linking medication ${med.name}: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
            }
            
            // Add a small delay between medications to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
          }

          const failedMedications = medicationResults.filter(r => !r.success)
          if (failedMedications.length > 0) {
            console.error('Failed medications:', failedMedications)
            router.push('/onboarding')
            return
          }

          // Clear ALL localStorage data
          localStorage.removeItem('selectedRole')
          localStorage.removeItem('elderProfile')
          localStorage.removeItem('elderMedications')
          localStorage.removeItem('caretakerProfile')
          localStorage.removeItem('elderConnection')
          localStorage.removeItem('taken_medications')
          localStorage.removeItem('temp_onboarding_data')
          localStorage.removeItem('onboardingData')

          // Verify medications were linked
          const linkedMeds = await getUserMedications(user.id)
          console.log('Verifying linked medications:', linkedMeds)
          
          if (!linkedMeds || linkedMeds.length === 0) {
            console.error('No medications found after linking')
            toast.error("Failed to link medications. Please try again.")
            router.push('/onboarding')
            return
          }

          toast.success("Profile and medications created successfully!")
          router.push('/dashboard')
        } else if (selectedRole === 'Caretaker') {
          const caretakerProfile = JSON.parse(localStorage.getItem('caretakerProfile') || '{}')
          
          // Create user profile
          const userResult = await createUser(user.id, {
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddresses: [user.primaryEmailAddress?.emailAddress || ''],
            phoneNumbers: [user.primaryPhoneNumber?.phoneNumber || '']
          }, {
            role: 'Caretaker',
            ...caretakerProfile
          })

          if (!userResult) {
            console.error('Failed to create user profile')
            throw new Error('Failed to create user profile')
          }

          // Send welcome notification
          try {
            const response = await fetch('/api/notifications/welcome_caretaker', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumber: user.primaryPhoneNumber?.phoneNumber || '',
                userName: user.firstName || ''
              }),
            });

            if (!response.ok) {
              console.error('Failed to send welcome notification:', await response.text());
            }
          } catch (error) {
            console.error('Error sending welcome notification:', error);
            // Don't throw here, we want to continue even if notification fails
          }

          // Create relationship with elder if exists
          const elderConnection = JSON.parse(localStorage.getItem('elderConnection') || '{}')
          if (elderConnection.elderUser) {
            console.log('Creating caretaker relationship:', { caretakerId: user.id, elderId: elderConnection.elderUser.id })
            const relationshipResult = await createCaretakerRelationship(user.id, elderConnection.elderUser.id)
            console.log('Caretaker relationship result:', relationshipResult)
            if (!relationshipResult) {
              console.error('Failed to create caretaker relationship')
            }
          }

          // Clear localStorage
          localStorage.removeItem('selectedRole')
          localStorage.removeItem('caretakerProfile')
          localStorage.removeItem('elderConnection')

          toast.success("Profile created successfully!")
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error in post-signup process:', error)
        toast.error("Failed to create profile. Please try again.")
        router.push('/onboarding')
      }
    }

    // Run the post-signup handler when user becomes available
    if (isSignedIn && user) {
      handlePostSignUp()
    }
  }, [isSignedIn, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <SignUp 
        afterSignUpUrl="/sign-up"
        redirectUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-[#00856A] hover:bg-[#006B55] text-sm normal-case"
          }
        }}
      />
    </div>
  )
} 