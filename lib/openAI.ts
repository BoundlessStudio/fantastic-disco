
import OpenAI from 'openai';
import path from 'node:path';

export const openAIClient = new OpenAI();

export async function getContainerId(thread: string) {
  const name = `thread-${thread}`;

  // List all containers
  const containers = await openAIClient.containers.list();

  for await (const container of containers) {
    if (container.name === name && container.status === 'active') {
      return container.id;
    }
  }

  const container = await openAIClient.containers.create({
    name: name,
  });
  return container.id;
}


export async function getContainerFileByName(
  container_id: string,
  filename: string
): Promise<ArrayBuffer | null> {
  try {
    const collection = await openAIClient.containers.files.list(container_id);
    for await (const file of collection) {
      if (file.path.endsWith(filename)) {
        const response = await openAIClient.containers.files.content.retrieve(container_id, file.id);

        // This is already an ArrayBuffer and is valid BodyInit
        const data = await response.arrayBuffer();
        return data;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getContainerFileById(
  container_id: string,
  file_id: string
): Promise<{data:ArrayBuffer, name:string} | null> {
  try 
  {
    const file = await openAIClient.containers.files.retrieve(container_id, file_id);
    const response = await openAIClient.containers.files.content.retrieve(container_id, file_id);
    
    const name = path.basename(file.path);
    const data = await response.arrayBuffer();
    return {
      name,
      data
    };
  } catch {
    return null;
  }
}