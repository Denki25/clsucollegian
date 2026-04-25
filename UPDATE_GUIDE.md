# Daily Update Guide

The site now uses data files for both articles and multimedia, so most updates do not require editing `index.html` or `multimedia.html` directly.

## Where content lives now

- `data/site-config.js`
  - homepage ticker
  - featured story slug
  - trending list
- `data/articles/literary.js`
- `data/articles/features.js`
- `data/articles/infographics.js`
- `data/articles/news.js`
- `data/articles/opinion.js`
- `data/articles/devcom.js`
- `data/multimedia.js`
  - homepage latest multimedia
  - full multimedia page

## How to add a new article

1. Open the matching category file inside `data/articles/`.
2. Copy one existing article object.
3. Paste the new article object into that same file.
4. Fill in:
   - `slug`
   - `category`
   - `title`
   - `summary`
   - `author`
   - `authorLine`
   - `date` in `YYYY-MM-DD`
   - `readTime` like `3 min read`
   - `image`
   - `imageAlt`
   - `body`
5. If the story should be the homepage lead, update `featuredSlug` in `data/site-config.js`.
6. If it should appear in the ticker or trending area, update `tickerItems` or `trending` in `data/site-config.js`.

## How to update multimedia

1. Open `data/multimedia.js`.
2. Keep the newest multimedia entry at the top of the array.
3. Copy an existing item and paste it at the top when adding a new one.
4. Update:
   - `title`
   - `summary`
   - `platform`
   - `embedUrl`
   - `sourceUrl`
   - `aspectRatio` as `"portrait"` or `"landscape"`
5. Save the file.

The homepage automatically shows the first 3 multimedia entries. The `multimedia.html` page automatically shows the full list.

## Image paths

Use paths relative to the project root, for example:

```js
image: "PHOTOS/FEATURES/feature3.jpg"
image: "PHOTOS/LITERARY/lit1.jpg"
image: "PHOTOS/NEWS/news1.jpg"
```

## Article body format

`body` uses HTML. Example:

```html
<p>Your paragraph here.</p>
<h2>Your section heading</h2>
<blockquote><p>Your quoted line here.</p></blockquote>
```

## Suggested organization

- Keep article files grouped by category.
- Keep multimedia entries in `data/multimedia.js` ordered from newest to oldest.
- Keep slugs unique across all article files.
- Use exact publish dates for articles so sorting stays correct.
