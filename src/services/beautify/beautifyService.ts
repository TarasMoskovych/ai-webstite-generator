/**
 * Beautify Service
 *
 * This module provides the core beautification functionality for websites.
 * It handles both completion mode (for incomplete websites) and enhancement
 * mode (for complete websites) based on the completeness detection result.
 *
 * The service streams responses from the Claude API, allowing real-time
 * progress updates during beautification.
 *
 * @description Implements website beautification with streaming support.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 3.1, 3.2, 3.3
 */

import {
  anthropic,
  CLAUDE_MODEL,
  MAX_TOKENS,
} from '@/lib/claude';
import { buildCompletionPrompt, buildEnhancementPrompt } from '@/lib/beautifyPrompts';
import { extractCodeFromResponse } from '@/services/generation/codeExtractor';
import { TIMEOUTS } from '@/lib/constants';
import type {
  BeautifyOptions,
  BeautifyStreamEvent,
  BeautificationMode,
  CompletenessResult,
} from '@/types/beautify';
import type { MessageParam, ImageBlockParam, TextBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { GENERATION_MARKER } from './completenessDetector';

/**
 * Builds message content for Claude API including optional reference image.
 *
 * @param prompt - The text prompt (completion or enhancement)
 * @param html - Current HTML content
 * @param css - Current CSS content
 * @param referenceImage - Optional base64-encoded reference image
 * @param referenceImageMimeType - MIME type of the reference image
 * @returns Array of content blocks for Claude API message
 */
function buildMessageContent(
  prompt: string,
  html: string,
  css: string,
  referenceImage?: string,
  referenceImageMimeType?: string
): (TextBlockParam | ImageBlockParam)[] {
  const content: (TextBlockParam | ImageBlockParam)[] = [];

  // Add reference image if provided
  if (referenceImage && referenceImageMimeType) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: referenceImageMimeType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
        data: referenceImage,
      },
    });
  }

  // Add the main prompt with current code
  content.push({
    type: 'text',
    text: `${prompt}

## Current HTML Code
\`\`\`html
${html}
\`\`\`

## Current CSS Code
\`\`\`css
${css}
\`\`\`

Please analyze and ${referenceImage ? 'use the reference image as a style guide while you ' : ''}improve this website.`,
  });

  return content;
}

/**
 * Ensures the HTML content includes the generation marker.
 * Adds the marker before the closing body tag if not present.
 *
 * @param html - The HTML content to check/modify
 * @returns HTML content with generation marker
 *
 * Validates: Requirement 2.8 - THE Beautify_Service SHALL add the Generation_Marker
 * to the completed HTML before returning the result
 */
function ensureGenerationMarker(html: string): string {
  if (html.includes(GENERATION_MARKER)) {
    return html;
  }

  // Add marker before closing body tag if present
  const bodyCloseIndex = html.toLowerCase().lastIndexOf('</body>');
  if (bodyCloseIndex !== -1) {
    return (
      html.slice(0, bodyCloseIndex) +
      `    ${GENERATION_MARKER}\n` +
      html.slice(bodyCloseIndex)
    );
  }

  // Add marker before closing html tag if no body tag
  const htmlCloseIndex = html.toLowerCase().lastIndexOf('</html>');
  if (htmlCloseIndex !== -1) {
    return (
      html.slice(0, htmlCloseIndex) +
      `${GENERATION_MARKER}\n` +
      html.slice(htmlCloseIndex)
    );
  }

  // Append at the end if neither tag found
  return html + `\n${GENERATION_MARKER}`;
}

/**
 * Beautifies a website with streaming output.
 *
 * This async generator function streams beautification progress in real-time.
 * It handles both completion mode (for incomplete websites) and enhancement
 * mode (for complete websites).
 *
 * Event types emitted:
 * - 'start': Beautification process has started
 * - 'mode': Indicates the beautification mode (complete or enhance) with detected issues
 * - 'text': Streaming content chunk from Claude API
 * - 'done': Beautification completed with final HTML/CSS result
 * - 'error': An error occurred during beautification
 *
 * @param options - Beautification options including HTML, CSS, and completeness result
 * @param signal - Optional AbortSignal for cancellation support
 * @returns AsyncGenerator of BeautifyStreamEvent
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 3.1, 3.2, 3.3
 *
 * @example
 * ```typescript
 * const options = {
 *   html: '<html>...</html>',
 *   css: 'body { ... }',
 *   completenessResult: { isComplete: true, status: 'complete', ... }
 * };
 *
 * for await (const event of beautifyWebsiteStream(options)) {
 *   switch (event.type) {
 *     case 'start':
 *       console.log('Beautification started');
 *       break;
 *     case 'mode':
 *       console.log(`Mode: ${event.mode}`);
 *       break;
 *     case 'text':
 *       process.stdout.write(event.content);
 *       break;
 *     case 'done':
 *       console.log('Complete:', event.result);
 *       break;
 *     case 'error':
 *       console.error('Error:', event.error);
 *       break;
 *   }
 * }
 * ```
 */
export async function* beautifyWebsiteStream(
  options: BeautifyOptions,
  signal?: AbortSignal
): AsyncGenerator<BeautifyStreamEvent> {
  const {
    html,
    css,
    originalPrompt,
    referenceImage,
    referenceImageMimeType,
    completenessResult,
  } = options;

  // Create an AbortController to handle timeout
  const controller = new AbortController();

  // Set up timeout handler (120 seconds as per API maxDuration)
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUTS.GENERATION);

  // Link external signal to our controller if provided
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      yield { type: 'error', error: 'Request was cancelled' };
      return;
    }

    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  try {
    // Emit start event
    yield { type: 'start' };

    // Determine mode based on completeness
    // Validates: Requirement 2.1 - WHEN the Completeness_Detector classifies a website
    // as "incomplete", THE Beautify_Service SHALL first complete the missing sections
    // Validates: Requirement 3.1 - WHEN the Completeness_Detector classifies a website
    // as "complete", THE Beautify_Service SHALL apply visual enhancements only
    const mode: BeautificationMode = completenessResult.isComplete ? 'enhance' : 'complete';

    // Emit mode event with detected issues
    yield {
      type: 'mode',
      mode,
      issues: completenessResult.issues,
    };

    // Build the appropriate prompt based on mode
    let prompt: string;
    const hasReferenceImage = Boolean(referenceImage && referenceImageMimeType);

    if (mode === 'complete') {
      // Validates: Requirement 2.2 - THE Beautify_Service SHALL send the existing HTML
      // and CSS along with detected issues to the Claude API for completion
      // Validates: Requirement 2.3 - THE Beautify_Service SHALL instruct the AI to
      // maintain consistency with the existing design style when completing missing sections
      prompt = buildCompletionPrompt(originalPrompt, hasReferenceImage, completenessResult.issues);
    } else {
      // Validates: Requirement 3.2 - THE Beautify_Service SHALL send the complete HTML
      // and CSS to the Claude API with enhancement instructions
      // Validates: Requirement 3.3 - THE Beautify_Service SHALL request the following
      // enhancement types: improved color harmony, refined typography, smoother
      // transitions and animations, better spacing and alignment, enhanced hover
      // states, and subtle shadows or depth effects
      prompt = buildEnhancementPrompt(originalPrompt, hasReferenceImage);
    }

    // Build message content with optional reference image
    const messageContent = buildMessageContent(
      prompt,
      html,
      css,
      referenceImage,
      referenceImageMimeType
    );

    let fullContent = '';

    // Stream from Claude API
    const stream = await anthropic.messages.stream(
      {
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ] as MessageParam[],
      },
      {
        signal: controller.signal,
      }
    );

    // Process stream events
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if ('text' in delta) {
          fullContent += delta.text;
          yield { type: 'text', content: delta.text };
        }
      }
    }

    // Clear timeout on successful completion
    clearTimeout(timeoutId);

    // Extract HTML, CSS from the complete response
    const extractionResult = extractCodeFromResponse(fullContent);

    if (!extractionResult.success) {
      yield {
        type: 'error',
        error: extractionResult.error || 'Failed to extract code from response',
      };
      return;
    }

    // Ensure the generation marker is present in the result
    // Validates: Requirement 2.8 - THE Beautify_Service SHALL add the Generation_Marker
    // to the completed HTML before returning the result
    const finalHtml = ensureGenerationMarker(extractionResult.html);

    // Emit done event with final result
    yield {
      type: 'done',
      result: {
        html: finalHtml,
        css: extractionResult.css,
      },
    };
  } catch (error) {
    // Clear timeout on error
    clearTimeout(timeoutId);

    // Handle abort/timeout errors
    if (error instanceof Error) {
      if (error.name === 'AbortError' || controller.signal.aborted) {
        if (signal?.aborted) {
          yield { type: 'error', error: 'Beautification was cancelled' };
        } else {
          yield {
            type: 'error',
            error: 'Beautification timed out. The website may be too complex. Please try again.',
          };
        }
        return;
      }

      // Handle rate limiting errors
      if (error.message.includes('rate_limit')) {
        yield {
          type: 'error',
          error: 'Service is busy. Please wait a moment and try again.',
        };
        return;
      }

      // Handle network errors
      if (error.message.includes('network') || error.message.includes('fetch')) {
        yield {
          type: 'error',
          error: 'Unable to connect. Please check your internet connection.',
        };
        return;
      }

      yield {
        type: 'error',
        error: `Beautification failed: ${error.message}`,
      };
      return;
    }

    yield {
      type: 'error',
      error: 'Beautification failed: An unknown error occurred',
    };
  }
}

export default beautifyWebsiteStream;
