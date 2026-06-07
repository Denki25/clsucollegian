# Daily Update Guide

The site now uses data files for both articles and multimedia, so most updates do not require editing `index.html` or `multimedia.html` directly.

## Where content lives now

- `data/site-config.js`
  - homepage ticker
  - featured story slug
  - trending list
- `data/articles/literary.js`
- `data/articles/features.js`
- `data/articles/komiks.js`
- `data/articles/news.js`
- `data/articles/opinion.js`
- `data/articles/devcom.js`
- `data/articles/editorial.js`
- `data/articles/column.js`
- `data/articles/sports.js`
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
   - `credits`
5. Set `credits.labelPreset` when needed:
   - `via` for most write-ups
   - `written` for Literary and First POV write-ups
   - `filipino` for Filipino labels
6. If the story should be the homepage lead, update `featuredSlug` in `data/site-config.js`.
7. If it should appear in the ticker or trending area, update `tickerItems` or `trending` in `data/site-config.js`.

## Article credit labels

Use `credits.labelPreset` for the article page bylines:

- `via`: `Via:`, `Illustrated by:`, `Animation by:`, `Photo by:` or `Photos by:`, `Layout by:`
- `written`: `Written by:`, `Illustrated by:`, `Animation by:`, `Photo by:` or `Photos by:`, `Layout by:`
- `filipino`: quick default labels only

For exact Filipino grammar, use `credits.labels` and choose the exact wording yourself, such as:

- `Isinulat ni:` or `Isinulat nina:`
- `Iginuhit ni:` or `Iginuhit nina:`
- `Animasyon ni:` or `Animasyon nina:`
- `Larawan ni:` or `Larawan nina:`
- `Inianyo ni:` or `Inianyo nina:`

You can also override any single label with `credits.labels`.
You can also mix labels, for example `Via:` for the main byline and Filipino for the rest.

## How to update multimedia

1. Open `data/multimedia.js`.
2. Keep the newest multimedia entry at the top of the array.
3. Copy an existing item and paste it at the top when adding a new one.
4. Update:
   - `title`
   - `caption`
   - `platform`
   - `presenterLabel` with the exact wording you want, like `Host:`, `Host/s:`, `Anchor:`, or `Anchor/s:`
   - `presenter`
   - `technicalDirectorLabel`
   - `technicalDirector`
   - `videographerLabel`
   - `videographer`
   - `editorLabel`
   - `editor`
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

## Facebook share previews

After updating article titles, summaries, or featured images, regenerate the static share pages so Facebook can scrape the right preview:

```bash
node scripts/generate-share-pages.js
```

The generated pages live in `share/` and are what the Facebook share button opens.

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
