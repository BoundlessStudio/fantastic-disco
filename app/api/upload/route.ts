import { NextResponse } from 'next/server';
import { BlobServiceClient, StorageSharedKeyCredential  } from '@azure/storage-blob';

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

    // Blob storage setup
    const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    const key = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
    const container = process.env.AZURE_STORAGE_CONTAINER!;

    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      new StorageSharedKeyCredential (account, key)
    );

    const containerClient = blobServiceClient.getContainerClient(container);

    // Create filename
    //const ext = file.name.split('.').pop() ?? '';
    //const blobName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const blobName = `${crypto.randomUUID()}-${file.name}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

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
