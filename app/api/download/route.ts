export const runtime = 'nodejs';

interface ReadFileResult {
  success: boolean;
  path: string;
  content: string;
  timestamp: string;
  exitCode?: number;
  encoding?: 'utf-8' | 'base64';
  isBinary?: boolean;
  mimeType?: string;
  size?: number;
}

// GET /api/download
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const container = url.searchParams.get("container");
    const filename = url.searchParams.get("filename");

    // TODO: add Cache

    const sandboxURL = process.env.SANDBOX_BASE_URL;
    if (!url) {
      throw new Error('SANDBOX_BASE_URL is not configured');
    }

    if (!container) {
      return new Response(
        JSON.stringify({
          error:
            'Missing query parameters: "container',
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if(!filename) 
    {
       return new Response(
        JSON.stringify({
          error:
            'Missing query parameters: "filename',
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = {
      id: container,
      path: filename,
    };

    let response: Response;
    try {
      response = await fetch(`${sandboxURL}/file/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(`Failed to call remote shell: ${(err as Error).message}`);
    }

    const json = await response.json();
    const result = json as ReadFileResult;

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'File not found in container.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const file = (result.isBinary) ? Buffer.from(result.content, "base64") : result.content;
    return new Response(file, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType ?? 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  
  } catch (err) {
    console.error('Download error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
