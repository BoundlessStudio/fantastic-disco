import { getContainerFileById, getContainerFileByName } from '@/lib/openAI';

export const runtime = 'nodejs';

// GET /api/download
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const container = url.searchParams.get("container");
    const filename = url.searchParams.get("filename");
    const file = url.searchParams.get("file");

    if (!container) {
      return new Response(
        JSON.stringify({
          error:
            'Missing query parameters: "container',
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if(filename) 
    {
      const data = await getContainerFileByName(container, filename);

      if (!data || data.byteLength === 0) {
        return new Response(
          JSON.stringify({ error: 'File not found in container.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    if(file) 
    {
      const result = await getContainerFileById(container, file);
      if(!result) {
         return new Response(
          JSON.stringify({ error: 'File not found in container.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!result.data || result.data.byteLength === 0) {
        return new Response(
          JSON.stringify({ error: 'File not found in container.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(result.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(result.name)}"`,
        },
      });
    }
    
  } catch (err) {
    console.error('Download error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
