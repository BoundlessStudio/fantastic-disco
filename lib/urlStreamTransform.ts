import { TextStreamPart, ToolSet } from "ai";

export function sandboxUrlTransform<T extends ToolSet>(opts: {
  containerId: string,
}) {
  return (_opts: {
    tools: T;
    stopStream: () => void;
  }) =>
    new TransformStream<
      TextStreamPart<T>,
      TextStreamPart<T>
    >({
      async transform(chunk, controller) {
        if (chunk.type === 'text-delta' && typeof chunk.text === 'string') {
          // Replace sandbox:/mnt/data/<filename> → /api/download?container=<containerId>&filename=<filename>
          const replaced = chunk.text.replace(
            /sandbox:\/mnt\/data\/([^\s)'"]+)/g,
            `${process.env.APP_BASE_URL}/api/download?container=${opts.containerId}&filename=$1`
          );

          controller.enqueue({ ...chunk, text: replaced });
        } else {
          controller.enqueue(chunk);
        }
      },
    });
}