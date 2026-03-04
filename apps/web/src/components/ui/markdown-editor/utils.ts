import { common, createLowlight } from 'lowlight'
import { marked } from 'marked'
import TurndownService from 'turndown'

export const lowlight = createLowlight(common)

// HTML attribute escaping
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '&#10;')
}

// Configure turndown for HTML -> Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// KaTeX inline: <span data-math-inline data-latex="..."> → $...$
turndownService.addRule('mathInline', {
  filter: (node) =>
    node.nodeName === 'SPAN' && node.hasAttribute('data-math-inline'),
  replacement: (_, node) => {
    const latex = (node as HTMLElement).getAttribute('data-latex') || ''
    return `$${latex}$`
  },
})

// KaTeX block: <div data-math-block data-latex="..."> → $$...$$
turndownService.addRule('mathBlock', {
  filter: (node) =>
    node.nodeName === 'DIV' && node.hasAttribute('data-math-block'),
  replacement: (_, node) => {
    const latex = (node as HTMLElement).getAttribute('data-latex') || ''
    return `\n$$\n${latex}\n$$\n`
  },
})

// Embed iframes: <iframe src="/embed/..."> → raw HTML preserved
turndownService.addRule('embedIframe', {
  filter: (node) =>
    node.nodeName === 'IFRAME' &&
    (node.getAttribute('src') || '').startsWith('/embed/'),
  replacement: (_, node) => {
    const el = node as HTMLElement
    const src = el.getAttribute('src') || ''
    const width = el.getAttribute('width') || '100%'
    const height = el.getAttribute('height') || '160'
    return `\n<iframe src="${src}" width="${width}" height="${height}" style="border:none; border-radius:8px;" loading="lazy"></iframe>\n`
  },
})

// Mermaid: <div data-mermaid data-code="..."> → ```mermaid\n...\n```
turndownService.addRule('mermaidBlock', {
  filter: (node) =>
    node.nodeName === 'DIV' && node.hasAttribute('data-mermaid'),
  replacement: (_, node) => {
    const code = (node as HTMLElement).getAttribute('data-code') || ''
    return `\n\`\`\`mermaid\n${code}\n\`\`\`\n`
  },
})

// Add code block support
turndownService.addRule('codeBlock', {
  filter: (node) => {
    return node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE'
  },
  replacement: (_, node) => {
    const codeElement = node.firstChild as HTMLElement
    const language = codeElement?.className?.replace('language-', '') || ''
    const code = codeElement?.textContent || ''
    return `\n\`\`\`${language}\n${code}\n\`\`\`\n`
  },
})

// Add table support for turndown
turndownService.addRule('table', {
  filter: 'table',
  replacement: (_, node) => {
    const table = node as HTMLTableElement
    const rows = Array.from(table.querySelectorAll('tr'))
    if (rows.length === 0) return ''

    let markdown = '\n'
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td'))
      const cellContents = cells.map((cell) => cell.textContent?.trim() || '')
      markdown += '| ' + cellContents.join(' | ') + ' |\n'

      // Add separator after header row
      if (rowIndex === 0) {
        markdown += '| ' + cells.map(() => '---').join(' | ') + ' |\n'
      }
    })
    return markdown + '\n'
  },
})

// Configure marked for Markdown -> HTML conversion
marked.use({
  gfm: true,
  breaks: true,
})

// Escape text content (subset of attribute escaping)
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function preprocessForEditor(markdown: string): string {
  // 0. Preserve embed iframes — extract them before marked processes them
  const iframePlaceholders: string[] = []
  let result = markdown.replace(
    /<iframe\s[^>]*src="\/embed\/[^"]*"[^>]*><\/iframe>/g,
    (match) => {
      iframePlaceholders.push(match)
      return `<!--EMBED_IFRAME_${iframePlaceholders.length - 1}-->`
    }
  )

  // 1. Handle mermaid fenced code blocks
  result = result.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const trimmed = code.trim()
    return `\n<div data-mermaid data-code="${escapeAttr(trimmed)}">${escapeHtml(trimmed)}</div>\n`
  })

  // 2. Handle block math ($$...$$) — can be multiline
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
    const trimmed = latex.trim()
    return `\n<div data-math-block data-latex="${escapeAttr(trimmed)}">${escapeHtml(trimmed)}</div>\n`
  })

  // 3. Handle inline math ($...$) — single line, not preceded/followed by $
  result = result.replace(
    /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    (_, latex) => {
      return `<span data-math-inline data-latex="${escapeAttr(latex)}">${escapeHtml(latex)}</span>`
    }
  )

  // 4. Restore embed iframe placeholders
  result = result.replace(
    /<!--EMBED_IFRAME_(\d+)-->/g,
    (_, idx) => iframePlaceholders[Number(idx)] || ''
  )

  return result
}

/**
 * Convert markdown to HTML for TipTap editor
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  // Check if it looks like HTML already (starts with < or contains common HTML tags)
  if (
    markdown.trim().startsWith('<') ||
    /<(p|div|h[1-6]|ul|ol|blockquote)[\s>]/i.test(markdown)
  ) {
    return markdown
  }
  const preprocessed = preprocessForEditor(markdown)
  return marked.parse(preprocessed, { async: false }) as string
}

/**
 * Convert HTML to markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === '<p></p>') return ''
  return turndownService.turndown(html)
}
