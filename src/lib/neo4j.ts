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
  dosage: string  // Changed from number to string to include unit
}

export interface DrugResult {
  id: string
  name: string
  brandName: string
  genericName: string
}

interface MedicationDue {
  userId: string;
  name: string;
  phone: string;
  scheduledTime: string;
}

export function initNeo4j() {
    const uri = process.env.NEO4J_URI
    const username = process.env.NEO4J_USERNAME
    const password = process.env.NEO4J_PASSWORD

    console.log('Initializing Neo4j connection...')
    console.log('Neo4j Config:', {
        uri: process.env.NEO4J_URI,
        username: process.env.NEO4J_USERNAME,
        hasPassword: !!process.env.NEO4J_PASSWORD
    })

    if (!uri || !username || !password) {
        const error = new Error('Neo4j credentials not found in environment variables')
        console.error('Neo4j initialization failed:', error)
        throw error
    }

    try {
        if (!driver) {
            // For development, use basic config without encryption
            const config = {
                maxConnectionPoolSize: 50,
                connectionTimeout: 30000, // 30 seconds
            }
            
            driver = neo4j.driver(
                uri,
                neo4j.auth.basic(username, password),
                config
            )
            console.log('Neo4j driver created successfully with config:', config)
        }
        return driver
    } catch (error) {
        console.error('Failed to create Neo4j driver:', error)
        throw error
    }
}

export async function testConnection() {
    console.log('Testing Neo4j connection...')
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
        console.log('No existing driver, initializing Neo4j...')
        driver = initNeo4j()
    }
    try {
        const session = driver.session()
        console.log('Neo4j session created successfully')
        return session
    } catch (error) {
        console.error('Failed to create Neo4j session:', error)
        throw error
    }
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
    console.log('Linking medication to user:', { userId, medicationId, schedule })
    
    if (!userId || !medicationId) {
        console.error('Missing required parameters:', { userId, medicationId })
        return null
    }

    // First verify the user and medication exist
    const verifyQuery = `
        MATCH (u:User {id: $userId})
        MATCH (m:Medication)
        WHERE elementId(m) = $medicationId
        RETURN u, m
    `
    
    const session = await getSession()
    try {
        // Verify user and medication exist
        console.log('Verifying user and medication exist:', { userId, medicationId })
        const verifyResult = await session.run(verifyQuery, { userId, medicationId })
        
        if (!verifyResult.records || verifyResult.records.length === 0) {
            console.error('User or medication not found:', { userId, medicationId })
            return null
        }
        
        const user = verifyResult.records[0].get('u')
        const medication = verifyResult.records[0].get('m')
        console.log('Found user and medication:', {
            user: user.properties,
            medication: medication.properties
        })
        
        // Validate schedule data
        if (!Array.isArray(schedule.schedule) || !Array.isArray(schedule.pillsPerDose) || !Array.isArray(schedule.days)) {
            console.error('Invalid schedule format:', schedule)
            return null
        }

        if (schedule.schedule.length !== schedule.pillsPerDose.length) {
            console.error('Schedule and pillsPerDose arrays must have the same length:', {
                scheduleLength: schedule.schedule.length,
                pillsPerDoseLength: schedule.pillsPerDose.length
            })
            return null
        }
        
        // Create or update the TAKES relationship
        const cypher = `
            MATCH (u:User {id: $userId})
            MATCH (m:Medication)
            WHERE elementId(m) = $medicationId
            MERGE (u)-[r:TAKES]->(m)
            SET r.schedule = $schedule.schedule,
                r.pillsPerDose = $schedule.pillsPerDose,
                r.days = $schedule.days,
                r.frequency = $schedule.frequency,
                r.dosage = $schedule.dosage,
                r.updatedAt = datetime()
            RETURN r, m
        `
        
        console.log('Executing Cypher query:', cypher)
        console.log('With parameters:', { userId, medicationId, schedule })
        
        const result = await session.run(cypher, { 
            userId, 
            medicationId,
            schedule: {
                schedule: schedule.schedule,
                pillsPerDose: schedule.pillsPerDose,
                days: schedule.days,
                frequency: schedule.frequency,
                dosage: schedule.dosage
            }
        })
        
        if (!result.records || result.records.length === 0) {
            console.error('No records returned from linkUserToMedication')
            return null
        }
        
        const relationship = result.records[0].get('r')
        const linkedMedication = result.records[0].get('m')
        console.log('Medication linked successfully:', {
            relationship: relationship.properties,
            medication: linkedMedication.properties
        })
        
        return result.records
    } catch (error) {
        console.error('Error linking medication:', error)
        throw error
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
  status: 'taken' | 'missed' | 'pending'
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

export async function searchMedications(query: string): Promise<DrugResult[]> {
  console.log('Searching medications with query:', query)
  const cypher = `
    MATCH (m:Medication)
    WHERE toLower(m.name) CONTAINS toLower($query)
       OR toLower(m.brandName) CONTAINS toLower($query)
       OR toLower(m.genericName) CONTAINS toLower($query)
    WITH m,
      CASE 
        WHEN toLower(m.name) = toLower($query) THEN 4
        WHEN toLower(m.name) STARTS WITH toLower($query) THEN 3
        WHEN toLower(m.brandName) STARTS WITH toLower($query) THEN 2
        WHEN toLower(m.genericName) STARTS WITH toLower($query) THEN 1
        ELSE 0
      END as priority
    // Use the elementId() function to get Neo4j's internal ID
    RETURN elementId(m) as id, m.name as name, m.brandName as brandName, m.genericName as genericName
    ORDER BY priority DESC, m.name
    LIMIT 10
  `
  const session = await getSession()
  try {
    console.log('Executing medication search query:', cypher)
    const result = await session.run(cypher, { query })
    console.log('Raw search results:', result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      brandName: record.get('brandName'),
      genericName: record.get('genericName')
    })))
    
    const medications = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      brandName: record.get('brandName') || '',
      genericName: record.get('genericName') || ''
    }))
    
    console.log('Processed search results:', medications)
    return medications
  } catch (error) {
    console.error('Error searching medications:', error)
    throw error
  } finally {
    await session.close()
  }
}

export async function getMedicationsDue(minutesAhead: number): Promise<MedicationDue[]> {
  let session;
  try {
    if (!driver) {
      driver = initNeo4j();
    }
    session = driver.session();
    
    const now = new Date();
    const end = new Date(now.getTime() + minutesAhead * 60000);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    
    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'time_window_calculation',
      data: {
        currentTime: now.toISOString(),
        endTime: end.toISOString(),
        currentDay,
        minutesAhead
      }
    }));

    // Convert day abbreviations
    const dayMap: { [key: string]: string } = {
      'Mon': 'M',
      'Tue': 'T',
      'Wed': 'W',
      'Thu': 'Th',
      'Fri': 'F',
      'Sat': 'Sa',
      'Sun': 'Su'
    };

    // Convert times to minutes since midnight for easier comparison
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'time_comparison_values',
      data: {
        currentDay,
        mappedDay: dayMap[currentDay],
        nowMinutes,
        endMinutes,
        now: now.toLocaleTimeString(),
        end: end.toLocaleTimeString(),
        timeWindow: `${nowMinutes} to ${endMinutes} minutes since midnight`
      }
    }));

    const result = await session.run(`
      MATCH (u:User)-[r:TAKES]->(m:Medication)
      UNWIND r.schedule as time
      WITH u, m, r, time,
        toInteger(split(time, ':')[0]) * 60 + toInteger(split(time, ':')[1]) as scheduleMinutes
      WHERE 
        // First check days
        (r.days = ['Everyday'] OR r.days = [$currentDay])
        // Then check time window
        AND scheduleMinutes > $nowMinutes - 1 
        AND scheduleMinutes < $endMinutes + 1
      RETURN DISTINCT
        u.id as userId,
        m.name as name,
        u.phone as phone,
        time as scheduledTime,
        scheduleMinutes
    `, {
      currentDay: dayMap[currentDay],
      nowMinutes,
      endMinutes
    });

    const medications = result.records.map(record => ({
      userId: record.get('userId'),
      name: record.get('name'),
      phone: record.get('phone'),
      scheduledTime: record.get('scheduledTime')
    }));

    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'medications_found',
      data: {
        count: medications.length,
        medications: medications.map(med => ({
          ...med,
          timeFormatted: med.scheduledTime
        }))
      }
    }));

    return medications;
  } catch (error) {
    console.error('Error in getMedicationsDue:', error);
    throw error;
  } finally {
    if (session) {
      await session.close();
    }
  }
}

export async function updateMedicationSchedule(userId: string, medicationId: string, schedule: MedicationSchedule) {
    const cypher = `
        MATCH (u:User {id: $userId})-[r:TAKES]->(m:Medication {id: $medicationId})
        SET r.schedule = $schedule.schedule,
            r.pillsPerDose = $schedule.pillsPerDose,
            r.days = $schedule.days,
            r.frequency = $schedule.frequency,
            r.dosage = $schedule.dosage,
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
                frequency: schedule.frequency,
                dosage: schedule.dosage
            }
        })
        return result.records[0]
    } finally {
        await session.close()
    }
} 