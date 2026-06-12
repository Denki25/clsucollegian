# Content Update Guide

This project is data-driven. Most content updates live in `data/`, and the site pages update automatically from those files.

## Where content lives

- `data/site-config.js`
  - homepage ticker
  - featured story slug
  - trending list
- `data/articles/`
  - article content by section
- `data/multimedia.js`
  - homepage multimedia entries
  - multimedia page entries
- `data/issues.js`
  - archive entries

## Article updates

1. Open the matching file inside `data/articles/`.
2. Copy an existing article object.
3. Update the required fields:
   - `slug`
   - `category`
   - `title`
   - `summary`
   - `author`
   - `authorLine`
   - `date` in `YYYY-MM-DD`
   - `readTime`
   - `image`
   - `imageAlt`
   - `body`
4. Update `credits` when needed.
5. If the story should lead the homepage, change `featuredSlug` in `data/site-config.js`.

## Multimedia updates

1. Open `data/multimedia.js`.
2. Copy an existing multimedia item.
3. Update:
   - `title`
   - `date`
   - `platform`
   - `presenterLabel`
   - `presenter`
   - `technicalDirectorLabel`
   - `technicalDirector`
   - `videographerLabel`
   - `videographer`
   - `editorLabel`
   - `editor`
   - `embedUrl`
   - `sourceUrl`
   - `aspectRatio`
4. Mark the two cards you want featured with `featured: true`.
5. Keep the dates accurate because the site sorts multimedia by date automatically.

## Archive updates

1. Open `data/issues.js`.
2. Copy an existing issue object.
3. Update:
   - `slug`
   - `title`
   - `titleLineTwo`
   - `label`
   - `date`
   - `subtitle`
   - `summary`
   - `image`
   - `imageAlt`
   - `links`
4. The newest issue becomes the featured archive automatically.

## Social sharing previews

- The preview metadata helper lives in `scripts/article-seo.js`.
- Generated preview pages live in `share/*.html`.
- Run `node scripts/generate-share-pages.js` after editing article metadata.
- Keep `summary` short and social artwork close to a `1200x630` crop.

## Article credit labels

Use `credits.labelPreset` when you want standard labels:

- `via`
- `written`
- `filipino`

For exact Filipino labels, use `credits.labels` and define the wording yourself.

## Image paths

Use project-relative paths like:

```js
image: "PHOTOS/FEATURES/feature3.jpg"
image: "PHOTOS/LITERARY/lit1.jpg"
image: "PHOTOS/NEWS/news1.jpg"
```

## Best practices

- Keep slugs unique.
- Keep dates in `YYYY-MM-DD` format.
- Prefer short summaries.
- Reuse existing entry shapes when adding new content.
