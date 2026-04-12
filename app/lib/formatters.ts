export function formatWordPressAccordions(html: string): string {
  if (!html) return "";

  let processedHtml = html;

  // Case 1: WordPress Native Accordion Block (<h3 class="wp-block-accordion-heading">...</h3>)
  // Catch the heading, extract the title, and wrap the following content until the next heading.
  const wpBlockRegex = /<h3[^>]*class="[^"]*wp-block-accordion-heading[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*wp-block-accordion-heading__toggle-title[^"]*"[^>]*>(.*?)<\/span>[\s\S]*?<\/h3>([\s\S]*?)(?=<h3[^>]*class="[^"]*wp-block-accordion-heading|$)/gi;
  processedHtml = processedHtml.replace(wpBlockRegex, (match, title, content) => {
    // Si el contenido viene empaquetado por WordPress en un div wp-block-accordion-content, lo ignoramos visualmente
    return `<details><summary>${title.trim()}</summary><div class="accordion-content">${content.trim()}</div></details>`;
  });

  // Limpieza: si WordPress envuelve todo el acordeón original en un <div class="wp-block-accordion-item">
  // y ahora adentro tiene un <details>, podemos dejar el div externo sin problema ya que details funciona solo.

  // Case 2: Custom Text Format - Title and content in the same paragraph separated by <br> 
  // Works with or without bold. e.g. <p>USA+<br>esto es un ejemplo</p> or <p><strong>USA+</strong><br>...</p>
  const inlineRegex = /<p>\s*(?:<(?:strong|b)>)?\s*(.*?)\+\s*(?:<\/(?:strong|b)>)?\s*<br\s*\/?>([\s\S]*?)<\/p>/gi;
  processedHtml = processedHtml.replace(inlineRegex, (match, title, content) => {
    return `<details><summary>${title.trim()}</summary><div class="accordion-content"><p>${content.trim()}</p></div></details>`;
  });

  // Case 3: Custom Text Format - Title in its own paragraph
  // Works with or without bold. e.g. <p>USA+</p> or <p><strong>USA+</strong></p>
  // followed by multiple paragraphs of content until the next accordion title.
  const blockRegex = /<p>\s*(?:<(?:strong|b)>)?\s*(.*?)\+\s*(?:<\/(?:strong|b)>)?\s*<\/p>([\s\S]*?)(?=<p>\s*(?:<(?:strong|b)>)?\s*.*?\+\s*(?:<\/(?:strong|b)>)?\s*<\/p>|$)/gi;
  processedHtml = processedHtml.replace(blockRegex, (match, title, content) => {
    return `<details><summary>${title.trim()}</summary><div class="accordion-content">${content.trim()}</div></details>`;
  });

  // Si había algún icono suelto (+) sobrante de wp-block, se borrará automáticamente al extraer solo el title.

  return processedHtml;
}
