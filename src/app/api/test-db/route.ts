import { NextResponse } from 'next/server'
import { initNeo4j } from '@/lib/neo4j'

export async function GET() {
  try {
    const driver = initNeo4j()
    const session = driver.session()
    
    try {
      // Simple test query
      const result = await session.run('RETURN 1 as test')
      await session.close()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database connection successful',
        data: result.records[0].get('test')
      })
    } finally {
      await session.close()
    }
  } catch (error: unknown) {
    console.error('Database connection test failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 })
  }
} 