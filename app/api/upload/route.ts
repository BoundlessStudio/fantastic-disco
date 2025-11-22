import { NextResponse } from 'next/server';
import { uploadContainerClient } from "@/lib/fileStorage"

export const runtime = 'nodejs';


// POST /api/upload
export async function POST(req: Request) {
  try {
    // Parse the multipart form-data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create filename
    //const ext = file.name.split('.').pop() ?? '';
    //const blobName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const blobName = `${crypto.randomUUID()}-${file.name}`;

    const blockBlobClient = uploadContainerClient.getBlockBlobClient(blobName);

    // Upload buffer
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: file.type,
      },
    });

    const blobUrl = blockBlobClient.url;

    return NextResponse.json({ url: blobUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
