// filepath: /c:/Users/Head-Lee2021/OneDrive/Documents/GitHub/plantnurserydash/app/api/knowledgebase/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    console.log('API Route Handler Started');
    
    try {
        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });

        const { id } = context.params;
        console.log('Querying database for ID:', id);

        // First verify the plant exists
        const plant = await db.get('SELECT * FROM BenchTags WHERE id = ?', id);
        console.log('Database result:', plant);

        if (!plant) {
            console.log('Plant not found');
            return new NextResponse(
                JSON.stringify({ error: 'Plant not found' }),
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Format the response
        const response = {
            ...plant,
            ImageUrls: [], // Initialize empty array for now
            ID: plant.id || id,
            TagName: plant.TagName || 'Unknown Plant',
        };

        console.log('Sending response:', response);

        return new NextResponse(
            JSON.stringify(response),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
            JSON.stringify({ 
                error: 'Server error',
                details: error.message 
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}