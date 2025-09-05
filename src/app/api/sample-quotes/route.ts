import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the JSON file from the lib directory
    const filePath = path.join(process.cwd(), 'src', 'lib', 'medigap-quote-response-76116.json')
    
    // Read file with explicit encoding to handle BOM
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    // Remove BOM if present
    const cleanContent = fileContent.replace(/^\uFEFF/, '')
    
    // Parse the JSON
    const data = JSON.parse(cleanContent)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading sample quotes:', error)
    return NextResponse.json(
      { error: 'Failed to load sample quotes' },
      { status: 500 }
    )
  }
}
