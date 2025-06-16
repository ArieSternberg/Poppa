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
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }, { status: 500 })
  }
} 