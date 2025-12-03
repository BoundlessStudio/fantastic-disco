import { BlobServiceClient, StorageSharedKeyCredential  } from '@azure/storage-blob';
import { openAIClient } from '@/lib/openAI';
import crypto from 'node:crypto';
import path from 'node:path';

// Blob storage setup
const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const key = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const container = process.env.AZURE_STORAGE_CONTAINER!;

export const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  new StorageSharedKeyCredential (account, key)
);

export const uploadContainerClient = blobServiceClient.getContainerClient(container);

export  type Blob = {
  url: string,
  filename: string,
  containerName: string
  contentType: string,
};

/**
 * Upload a file buffer to Azure Blob Storage and return the public URL.
 */
export async function uploadToBlob(buffer: ArrayBuffer, filename: string, contentType: string): Promise<Blob> {
  const blobName = `${crypto.randomUUID()}-${filename}`;
  const blockBlobClient = uploadContainerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(Buffer.from(buffer), {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  return {
    url: blockBlobClient.url,
    filename: blockBlobClient.name,
    containerName: blockBlobClient.containerName,
    contentType: contentType
  };
}

/**
 * Find a file in a container by filename (matching the tail of the path),
 * download it, upload to Azure, and return the blob URL.
 */
export  async function getBlobUrlForSandboxFile(
  containerId: string,
  filename: string
): Promise<Blob | undefined> {
  try 
  {
    const collection = await openAIClient.containers.files.list(containerId);
    for await (const file of collection) {
      if (file.path.endsWith(`${filename}`)) {
        const response = await openAIClient.containers.files.content.retrieve(containerId, file.id);
      
        const data = await response.arrayBuffer();
        const contentType = response.headers.get("Content-Type") ?? 'application/octet-stream';

        return await uploadToBlob(data, filename, contentType);
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Download a container file by fileId, upload to Azure, and return the blob URL.
 */
export async function getBlobUrlForSourceDocument(
  containerId: string,
  fileId: string
): Promise<Blob | undefined> {
  try 
  {
    const file = await openAIClient.containers.files.retrieve(containerId, fileId);

    const response = await openAIClient.containers.files.content.retrieve(containerId, fileId);

    const data = await response.arrayBuffer();
    const filename =  path.basename(file.path);
    const contentType = response.headers.get("Content-Type") ?? 'application/octet-stream';

    return await uploadToBlob(data, filename, contentType);
  } catch {
    return undefined;
  }
}