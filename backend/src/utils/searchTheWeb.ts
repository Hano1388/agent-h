// Fetch each and every page from the web search results
// The LLM itself can't browse the web, so we need to fetch the pages for it
//  so our code acts as a browser for the LLM
//  so the code decides exactly what content is safe and what we want the model to
//   show

// fetch the url, strip out all of the unnecessary content, and keep the exact
//  article like content that we need

/*
Steps:
1. Validate the URL
2. Fetch the URL
3. Check the content type
4. Convert the HTML to plain text
5. Clean the text
6. Cap the content
7. Return the fetched page
*/

import { convert } from 'html-to-text';
import { FetchedPageOutputSchema } from './schemas';

export async function searchTheWeb(url: string) {
  const validatedUrl = validateUrl(url);

  const response = await fetch(validatedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36; agent-core/1.0.0',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch ${validatedUrl}: ${body.slice(0, 250)}...`,
    );
  }

  const contentType = response.headers.get('content-type');
  const raw = await response.text();

  // html to plain text
  const text = contentType?.includes('text/html')
    ? convert(raw, {
        wordwrap: false,
        selectors: [
          {
            selector: 'nav',
            format: 'skip',
          },
          {
            selector: 'header',
            format: 'skip',
          },
          {
            selector: 'footer',
            format: 'skip',
          },
          {
            selector: 'script',
            format: 'skip',
          },
        ],
      })
    : raw;

  const cleanedText = cleanText(text);
  const cappedContent = cleanedText.slice(0, 100000);

  return FetchedPageOutputSchema.parse({
    url: validatedUrl,
    content: cappedContent,
  });
}

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

// Validate the URL and return the normalized URL
function validateUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http' && parsedUrl.protocol !== 'https') {
      throw new Error('only http and https urls are supported');
    }
    return parsedUrl.toString();
  } catch (error) {
    throw new Error('Invalid URL');
  }
}
