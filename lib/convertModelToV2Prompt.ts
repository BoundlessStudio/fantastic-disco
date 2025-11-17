import type {
  LanguageModelV2Prompt,
  LanguageModelV2TextPart,
  LanguageModelV2FilePart,
} from '@ai-sdk/provider';
import type { ModelMessage } from 'ai';

export function convertModelToV2Prompt(
  messages: ModelMessage[]
): LanguageModelV2Prompt {
  return messages.map((msg) => {
    // 1. Handle string content
    if (typeof msg.content === 'string') {
      const textPart: LanguageModelV2TextPart = {
        type: 'text',
        text: msg.content,
      };

      return {
        role: msg.role,
        content: [textPart],
      };
    }

    // 2. Handle array-of-parts content (already structured)
    if (Array.isArray(msg.content)) {
      const parts = msg.content.map((p) => {
        if (p.type === 'text') {
          const textPart: LanguageModelV2TextPart = {
            type: 'text',
            text: p.text,
          };
          return textPart;
        }

        if (p.type === 'file') {
          const filePart: LanguageModelV2FilePart = {
            type: 'file',
            mimeType: p.mimeType,
            data: p.data,
          };
          return filePart;
        }

        // Ignore unsupported parts for V2 compatibility
        return null;
      }).filter(Boolean) as (LanguageModelV2TextPart | LanguageModelV2FilePart)[];

      return {
        role: msg.role,
        content: parts,
      };
    }

    // 3. Fallback (should never happen)
    return {
      role: msg.role,
      content: [
        {
          type: 'text',
          text: String(msg.content ?? ''),
        } satisfies LanguageModelV2TextPart,
      ],
    };
  }) as LanguageModelV2Prompt;
}
