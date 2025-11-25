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
          // Replace sandbox:<filename> → /api/download?container=<containerId>&filename=<filename>
          const replaced = chunk.text.replace(
            /sandbox:\/?([^\s)'"]+)/g,
            (_match, filename) => `${process.env.APP_BASE_URL}/api/download?container=${opts.containerId}&filename=${filename}`,
          );

          controller.enqueue({ ...chunk, text: replaced });
        } else {
          controller.enqueue(chunk);
        }
      },
    });
}