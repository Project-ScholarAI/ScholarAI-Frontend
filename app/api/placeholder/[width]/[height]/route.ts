import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { width: string; height: string } }
) {
    const width = parseInt(params.width, 10);
    const height = parseInt(params.height, 10);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return new NextResponse('Invalid dimensions', { status: 400 });
    }

    // Generate a simple SVG placeholder
    const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" style="fill:rgb(200,200,200)"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16px" fill="#555">
                ${width}x${height}
            </text>
        </svg>
    `;

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400, immutable', // Cache for 1 day
        },
    });
} 