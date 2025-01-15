import neo4j, { Driver, ManagedTransaction } from 'neo4j-driver'

let driver: Driver | null = null

interface MedicationData {
  name: string
  [key: string]: string // for future extensibility
}

interface MedicationSchedule {
  schedule: string[]
  pillsPerDose: number[]
  days: string[]
  frequency: number
}

export function initNeo4j() {
    const uri = process.env.NEO4J_URI
    const username = process.env.NEO4J_USERNAME
    const password = process.env.NEO4J_PASSWORD

    console.log('Neo4j Config:', {
        uri: process.env.NEO4J_URI,
        username: process.env.NEO4J_USERNAME,
        hasPassword: !!process.env.NEO4J_PASSWORD
    })

    if (!uri || !username || !password) {
        throw new Error('Neo4j credentials not found in environment variables')
    }

    if (!driver) {
        driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
    }

    return driver
}

export async function testConnection() {
    const session = await getSession()
    try {
        const result = await session.run('RETURN 1 as test')
        console.log('Neo4j connection successful:', result.records[0].get('test'))
        return true
    } catch (error) {
        console.error('Neo4j connection failed:', error)
        return false
    } finally {
        await session.close()
    }
}

export async function getSession() {
    if (!driver) {
        driver = initNeo4j()
    }
    return driver.session()
}

export async function closeDriver() {
    if (driver) {
        await driver.close()
        driver = null
    }
}

// Simplified user creation with just Clerk data
export async function createUser(userId: string, clerkData: { 
    firstName: string | null;
    lastName: string | null;
    emailAddresses: string[];
    phoneNumbers: string[];
}, profileData?: {
    age?: number;
    role?: string;
    sex?: string;
}) {
    console.log('createUser called with:', { userId, clerkData, profileData })

    const userProfile = {
        id: userId,
        firstName: clerkData.firstName || '',
        lastName: clerkData.lastName || '',
        email: clerkData.emailAddresses[0] || '',
        phone: clerkData.phoneNumbers[0] || '',
        createdAt: new Date().toISOString(),
        age: profileData?.age || null,
        role: profileData?.role || null,
        sex: profileData?.sex || null
    }

    console.log('Constructed userProfile:', userProfile)

    // Different Cypher query based on role
    const cypher = `
        MERGE (u:User {id: $userId})
        ${profileData?.role === 'Elder' ? 'SET u:Elder' : profileData?.role === 'Caretaker' ? 'SET u:Caretaker' : ''}
        SET u = $userProfile
        RETURN u
    `
    
    console.log('Executing Cypher query:', cypher)
    console.log('With parameters:', { userId, userProfile })
    
    const session = await getSession()
    try {
        console.log('Session created, executing query...')
        const result = await session.run(cypher, { userId, userProfile })
        console.log('Query executed, result:', result)
        
        // If no phone number was provided during creation, set up a watcher for phone number updates
        if (!clerkData.phoneNumbers[0]) {
            // We'll update the phone number when it becomes available
            const phoneUpdateCypher = `
                MATCH (u:User {id: $userId})
                SET u.pendingPhoneUpdate = true
                RETURN u
            `
            await session.run(phoneUpdateCypher, { userId })
        }
        
        if (result.records && result.records[0]) {
            console.log('User node properties:', result.records[0].get('u').properties)
            return result.records
        } else {
            console.log('No records returned from query')
            return null
        }
    } catch (error) {
        console.error('Error in createUser:', error)
        throw error
    } finally {
        console.log('Closing session')
        await session.close()
    }
}

// Get user by ID
export async function getUser(userId: string) {
    const cypher = `
        MATCH (u:User {id: $userId})
        RETURN u
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { userId })
        return result.records[0]?.get('u').properties
    } finally {
        await session.close()
    }
}

// Medication-related queries
export async function createMedication(medicationData: MedicationData) {
    const cypher = `
        MERGE (m:Medication {name: $name})
        ON CREATE SET m.id = randomUUID()
        RETURN m
    `
    const session = await getSession()
    try {
        console.log('Creating/finding medication with name:', medicationData.name)
        const result = await session.run(cypher, { name: medicationData.name })
        console.log('Medication node result:', result.records[0].get('m').properties)
        return result.records
    } catch (error) {
        console.error('Error creating medication:', error)
        throw error
    } finally {
        await session.close()
    }
}

export async function linkUserToMedication(userId: string, medicationId: string, schedule: MedicationSchedule) {
    const cypher = `
        MATCH (u:User {id: $userId})
        MATCH (m:Medication {id: $medicationId})
        MERGE (u)-[r:TAKES]->(m)
        SET r.schedule = $schedule.schedule,
            r.pillsPerDose = $schedule.pillsPerDose,
            r.days = $schedule.days,
            r.frequency = $schedule.frequency,
            r.updatedAt = datetime()
        RETURN r
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { 
            userId, 
            medicationId,
            schedule: {
                schedule: schedule.schedule,
                pillsPerDose: schedule.pillsPerDose,
                days: schedule.days,
                frequency: schedule.frequency
            }
        })
        return result.records
    } finally {
        await session.close()
    }
}

export async function getUserMedications(userId: string) {
    const cypher = `
        MATCH (u:User {id: $userId})-[r:TAKES]->(m:Medication)
        RETURN m, r
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { userId })
        return result.records.map(record => ({
            medication: record.get('m').properties,
            schedule: record.get('r').properties
        }))
    } finally {
        await session.close()
    }
}

// Delete medication for a user
export async function deleteMedicationForUser(userId: string, medicationId: string) {
    const cypher = `
        // First delete the TAKES relationship
        MATCH (u:User {id: $userId})-[r:TAKES]->(m:Medication {id: $medicationId})
        DELETE r
        
        // Then delete all TOOK_MEDICATION relationships
        WITH m
        MATCH (u:User {id: $userId})-[h:TOOK_MEDICATION]->(m)
        DELETE h
        
        // Finally, check if medication is unused and delete if so
        WITH m
        OPTIONAL MATCH (m)<-[r:TAKES]-()
        WITH m, COUNT(r) as usageCount
        WHERE usageCount = 0
        DELETE m
        RETURN true as success
    `
    
    const session = await getSession()
    try {
        await session.run(cypher, { userId, medicationId })
        return true
    } catch (error) {
        console.error('Error deleting medication:', error)
        throw error
    } finally {
        await session.close()
    }
}

// Search for user by phone number
export async function findUserByPhone(phoneNumber: string) {
    const cypher = `
        MATCH (u:User)
        WHERE u.phone = $phoneNumber
        RETURN u
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { phoneNumber })
        return result.records[0]?.get('u').properties
    } finally {
        await session.close()
    }
}

// Create caretaker relationship
export async function createCaretakerRelationship(caretakerId: string, elderId: string) {
    const cypher = `
        MATCH (c:User:Caretaker {id: $caretakerId})
        MATCH (e:User:Elder {id: $elderId})
        MERGE (c)-[r:CARES_FOR]->(e)
        SET r.createdAt = datetime()
        RETURN r
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { caretakerId, elderId })
        return result.records[0]
    } finally {
        await session.close()
    }
}

// Delete user and all their relationships
export async function deleteUser(userId: string) {
    const cypher = `
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[r]-()
        DELETE r, u
        RETURN true as success
    `
    
    const session = await getSession()
    try {
        await session.run(cypher, { userId })
        return true
    } catch (error) {
        console.error('Error deleting user:', error)
        throw error
    } finally {
        await session.close()
    }
}

// Update user profile
export async function updateUser(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    age?: number;
    role?: string;
    sex?: string;
}) {
    const cypher = `
        MATCH (u:User {id: $userId})
        REMOVE u:Elder
        REMOVE u:Caretaker
        SET u += $updateData
        WITH u
        CALL {
            WITH u
            WITH u, $updateData.role as role
            FOREACH (x IN CASE WHEN role = 'Elder' THEN [1] ELSE [] END | SET u:Elder)
            FOREACH (x IN CASE WHEN role = 'Caretaker' THEN [1] ELSE [] END | SET u:Caretaker)
        }
        RETURN u
    `
    
    const session = await getSession()
    try {
        const result = await session.run(cypher, { 
            userId, 
            updateData: {
                ...updateData,
                updatedAt: new Date().toISOString()
            }
        })
        return result.records[0]?.get('u').properties
    } catch (error) {
        console.error('Error updating user:', error)
        throw error
    } finally {
        await session.close()
    }
}

// Get all elders for a caretaker
export async function getCaretakerElders(caretakerId: string) {
    const cypher = `
        MATCH (c:User:Caretaker {id: $caretakerId})-[r:CARES_FOR]->(e:User:Elder)
        RETURN e
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { caretakerId })
        return result.records.map(record => record.get('e').properties)
    } finally {
        await session.close()
    }
}

// Get elder's medications by ID (for caretaker view)
export async function getElderMedications(elderId: string) {
    const cypher = `
        MATCH (u:User:Elder {id: $elderId})-[r:TAKES]->(m:Medication)
        RETURN m, r
    `
    const session = await getSession()
    try {
        const result = await session.run(cypher, { elderId })
        return result.records.map(record => ({
            medication: record.get('m').properties,
            schedule: record.get('r').properties
        }))
    } finally {
        await session.close()
    }
}

export const recordMedicationStatus = async (
  userId: string,
  medicationId: string,
  date: string,
  scheduledTime: string,
  actualTime: string | null,
  status: 'taken' | 'missed'
) => {
  const session = await getSession();
  try {
    await session.executeWrite((tx: ManagedTransaction) =>
      tx.run(
        `
        MATCH (u:User {id: $userId})
        MATCH (m:Medication {id: $medicationId})
        CREATE (u)-[t:TOOK_MEDICATION {
          date: $date,
          scheduledTime: $scheduledTime,
          actualTime: $actualTime,
          status: $status
        }]->(m)
        RETURN t
        `,
        { userId, medicationId, date, scheduledTime, actualTime, status }
      )
    );
    return true;
  } catch (error) {
    console.error('Error recording medication status:', error);
    return false;
  } finally {
    await session.close();
  }
}; 