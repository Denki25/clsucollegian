# Daily Update Guide

The site now pulls homepage and article content from one file: [articles.js](./articles.js).

## Daily workflow

1. Open `articles.js`.
2. Copy one article object inside `articles: [ ... ]`.
3. Paste the copy at the top of the list if it is your newest story.
4. Update:
   - `slug`: short unique URL name, like `student-council-debate-night`
   - `category`
   - `title`
   - `summary`
   - `author`
   - `authorLine`
   - `date` in `YYYY-MM-DD`
   - `image` if you have one
   - `imageAlt`
   - `body` with the full article HTML
5. If the story should be the homepage lead, set `featuredSlug` to that article's slug.
6. If it should appear in the ticker or trending area, update `tickerItems` or `trending`.

## Important note

`body` uses HTML. That means paragraphs should look like:

```html
<p>Your paragraph here.</p>
<h2>Your section heading</h2>
<blockquote><p>Your quoted line here.</p></blockquote>
```

## Best structure going forward

- Keep all new article images in the project folder, or move them into a future `images/` folder.
- Use one slug per story and never reuse it.
- Use exact publish dates instead of "2 hours ago" so old articles stay correct automatically.
- Keep homepage sections driven from `articles.js` instead of editing `index.html` for every post.

## Recommendation

This is a good setup if one person updates the site manually.

If you expect many writers or daily publishing by a team, the next upgrade should be one of these:

- A headless CMS like Sanity or Contentful
- A static site generator like Astro, Eleventy, or Next.js
- A Google Sheet or Airtable feeding the site through a script

For now, this code-only setup is the simplest clean option.
