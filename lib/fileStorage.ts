import { BlobServiceClient, StorageSharedKeyCredential  } from '@azure/storage-blob';

// Blob storage setup
const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const key = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const container = process.env.AZURE_STORAGE_CONTAINER!;

export const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  new StorageSharedKeyCredential (account, key)
);

export const uploadContainerClient = blobServiceClient.getContainerClient(container);