export interface Medication {
  name: string
  brandName: string
  genericName: string
  dosage: number
  frequency: number
  schedule: string[]
  pillsPerDose: number[]
  days: string[]
}

export interface DrugResult {
  brand_name: string
  generic_name: string
}

export interface FDADrugResult {
  brand_name: string
  generic_name: string
  [key: string]: string
}

export interface UserProfile {
  role: 'Elder' | 'Caretaker'
  sex: 'Male' | 'Female' | 'Other'
  age: number
}

export interface ElderUser {
  id: string
  firstName: string
  lastName: string
  age: number
  role: 'Elder'
  phone: string
}

export interface ElderConnection {
  phoneNumber: string
  elderUser: ElderUser | null
} 