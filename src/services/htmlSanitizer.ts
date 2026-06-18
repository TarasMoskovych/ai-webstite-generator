/**
 * HTML Sanitization Service
 * Secures website previews against XSS and other malicious code injection
 *
 * Validates: Requirements 3.6
 * Correctness Property 5: HTML Sanitization Security
 *
 * For any HTML string containing potentially malicious elements (script tags,
 * onclick/onerror/onload event handlers, javascript: URLs), the sanitizer SHALL
 * remove all such elements while preserving valid structural HTML elements and
 * styling attributes.
 */

/**
 * HtmlSanitizerService interface
 */
export interface HtmlSanitizerService {
  sanitize(html: string): string;
}

/**
 * List of all inline event handler attributes to remove
 * These are commonly exploited for XSS attacks
 */
const EVENT_HANDLER_ATTRIBUTES = [
  // Mouse events
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmouseout',
  'onmousemove',
  'onmouseenter',
  'onmouseleave',
  'oncontextmenu',
  // Keyboard events
  'onkeydown',
  'onkeyup',
  'onkeypress',
  // Form events
  'onsubmit',
  'onreset',
  'onchange',
  'oninput',
  'onfocus',
  'onblur',
  'onselect',
  // Document/Window events
  'onload',
  'onunload',
  'onbeforeunload',
  'onresize',
  'onscroll',
  'onerror',
  'onabort',
  // Media events
  'onplay',
  'onpause',
  'onplaying',
  'onended',
  'onvolumechange',
  'ontimeupdate',
  'onseeking',
  'onseeked',
  'oncanplay',
  'oncanplaythrough',
  'ondurationchange',
  'onloadeddata',
  'onloadedmetadata',
  'onprogress',
  'onratechange',
  'onstalled',
  'onsuspend',
  'onwaiting',
  // Drag events
  'ondrag',
  'ondragstart',
  'ondragend',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  // Clipboard events
  'oncopy',
  'oncut',
  'onpaste',
  // Touch events
  'ontouchstart',
  'ontouchmove',
  'ontouchend',
  'ontouchcancel',
  // Animation/Transition events
  'onanimationstart',
  'onanimationend',
  'onanimationiteration',
  'ontransitionend',
  // Pointer events
  'onpointerdown',
  'onpointerup',
  'onpointermove',
  'onpointerenter',
  'onpointerleave',
  'onpointercancel',
  'ongotpointercapture',
  'onlostpointercapture',
  // Other events
  'onwheel',
  'onhashchange',
  'onpopstate',
  'onstorage',
  'onmessage',
  'onoffline',
  'ononline',
  'onbeforeprint',
  'onafterprint',
  'oninvalid',
  'onshow',
  'ontoggle',
];

/**
 * URL attributes that can contain javascript: URLs
 */
const URL_ATTRIBUTES = [
  'href',
  'src',
  'action',
  'formaction',
  'data',
  'poster',
  'background',
  'cite',
  'longdesc',
  'usemap',
  'xlink:href',
];

/**
 * Removes script tags and their content from HTML
 *
 * @param html - Input HTML string
 * @returns HTML string with script tags removed
 */
function removeScriptTags(html: string): string {
  // Remove <script>...</script> tags including their content
  // Handles multiline content, attributes, and various whitespace
  // Case-insensitive matching for <script> and </script>
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

/**
 * Removes inline event handlers from HTML attributes
 *
 * @param html - Input HTML string
 * @returns HTML string with event handlers removed
 */
function removeEventHandlers(html: string): string {
  let result = html;

  // Create a pattern for each event handler attribute
  for (const handler of EVENT_HANDLER_ATTRIBUTES) {
    // Match the attribute with either single quotes, double quotes, or no quotes
    // Handles: onclick="..." onclick='...' onclick=value
    // Case-insensitive matching
    const doubleQuotePattern = new RegExp(
      `\\s*${handler}\\s*=\\s*"[^"]*"`,
      'gi'
    );
    const singleQuotePattern = new RegExp(
      `\\s*${handler}\\s*=\\s*'[^']*'`,
      'gi'
    );
    const noQuotePattern = new RegExp(
      `\\s*${handler}\\s*=\\s*[^\\s>"']+`,
      'gi'
    );

    result = result.replace(doubleQuotePattern, '');
    result = result.replace(singleQuotePattern, '');
    result = result.replace(noQuotePattern, '');
  }

  return result;
}

/**
 * Removes javascript: URLs from URL attributes
 *
 * @param html - Input HTML string
 * @returns HTML string with javascript: URLs removed
 */
function removeJavascriptUrls(html: string): string {
  let result = html;

  for (const attr of URL_ATTRIBUTES) {
    // Match URL attributes containing javascript: protocol
    // Handles: href="javascript:..." href='javascript:...' href=javascript:...
    // Also handles whitespace around the colon: javascript : alert(1)
    // Case-insensitive matching for both attribute and javascript

    // Double quoted values with javascript:
    const doubleQuotePattern = new RegExp(
      `(${attr}\\s*=\\s*)"[^"]*javascript\\s*:[^"]*"`,
      'gi'
    );
    // Single quoted values with javascript:
    const singleQuotePattern = new RegExp(
      `(${attr}\\s*=\\s*)'[^']*javascript\\s*:[^']*'`,
      'gi'
    );
    // Unquoted values with javascript:
    const noQuotePattern = new RegExp(
      `(${attr}\\s*=\\s*)javascript\\s*:[^\\s>"']*`,
      'gi'
    );

    // Replace with empty attribute value to preserve the attribute but remove malicious content
    result = result.replace(doubleQuotePattern, '$1""');
    result = result.replace(singleQuotePattern, "$1''");
    result = result.replace(noQuotePattern, '$1""');
  }

  return result;
}

/**
 * Removes data: URLs that could contain executable content from URL attributes
 * Specifically targets data: URLs with script-like MIME types
 *
 * @param html - Input HTML string
 * @returns HTML string with dangerous data: URLs removed
 */
function removeDangerousDataUrls(html: string): string {
  let result = html;

  for (const attr of URL_ATTRIBUTES) {
    // Match data: URLs with potentially dangerous MIME types
    // text/html, text/javascript, application/javascript, etc.
    const dangerousMimeTypes =
      'text\\/(?:html|javascript)|application\\/(?:javascript|x-javascript|ecmascript)';

    const doubleQuotePattern = new RegExp(
      `(${attr}\\s*=\\s*)"[^"]*data\\s*:\\s*(?:${dangerousMimeTypes})[^"]*"`,
      'gi'
    );
    const singleQuotePattern = new RegExp(
      `(${attr}\\s*=\\s*)'[^']*data\\s*:\\s*(?:${dangerousMimeTypes})[^']*'`,
      'gi'
    );

    result = result.replace(doubleQuotePattern, '$1""');
    result = result.replace(singleQuotePattern, "$1''");
  }

  return result;
}

/**
 * Removes other potentially dangerous tags beyond script
 *
 * @param html - Input HTML string
 * @returns HTML string with dangerous tags removed
 */
function removeDangerousTags(html: string): string {
  let result = html;

  // Remove <iframe> tags - can embed malicious content
  result = result.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  result = result.replace(/<iframe\b[^>]*\/?>/gi, '');

  // Remove <object> tags - can embed plugins/scripts
  result = result.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '');
  result = result.replace(/<object\b[^>]*\/?>/gi, '');

  // Remove <embed> tags - can embed plugins/scripts
  result = result.replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '');
  result = result.replace(/<embed\b[^>]*\/?>/gi, '');

  // Remove <applet> tags - deprecated Java applets
  result = result.replace(/<applet\b[^>]*>[\s\S]*?<\/applet>/gi, '');
  result = result.replace(/<applet\b[^>]*\/?>/gi, '');

  // Remove <base> tags - can affect all URLs in the document
  result = result.replace(/<base\b[^>]*\/?>/gi, '');

  // Remove <meta> with http-equiv refresh that could redirect
  result = result.replace(
    /<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*\/?>/gi,
    ''
  );

  return result;
}

/**
 * Sanitizes HTML by removing potentially malicious elements while preserving
 * valid structural HTML elements and styling attributes.
 *
 * Removes:
 * - Script tags and their content
 * - Inline event handlers (onclick, onerror, onload, onmouseover, etc.)
 * - javascript: URLs from href, src, and other URL attributes
 * - Dangerous data: URLs with executable MIME types
 * - Other dangerous tags (iframe, object, embed, applet, base)
 * - Meta refresh redirects
 *
 * Preserves:
 * - Structural HTML elements (header, nav, main, article, section, aside, footer)
 * - Styling attributes (class, style)
 * - Safe HTML attributes (id, data-*, aria-*, role, etc.)
 *
 * @param html - Input HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitize(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let result = html;

  // Step 1: Remove script tags and their content
  result = removeScriptTags(result);

  // Step 2: Remove other dangerous tags
  result = removeDangerousTags(result);

  // Step 3: Remove inline event handlers
  result = removeEventHandlers(result);

  // Step 4: Remove javascript: URLs
  result = removeJavascriptUrls(result);

  // Step 5: Remove dangerous data: URLs
  result = removeDangerousDataUrls(result);

  return result;
}

/**
 * HTML Sanitizer class implementing the HtmlSanitizerService interface
 */
export class HtmlSanitizer implements HtmlSanitizerService {
  /**
   * Sanitizes HTML by removing potentially malicious elements
   *
   * @param html - Input HTML string to sanitize
   * @returns Sanitized HTML string
   */
  sanitize(html: string): string {
    return sanitize(html);
  }
}

/**
 * Default singleton instance of the HTML sanitizer
 */
export const htmlSanitizer = new HtmlSanitizer();

export default htmlSanitizer;
