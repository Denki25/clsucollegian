Article setup per section:

- `news.js` uses `category: "News"`
- `features.js` uses `category: "Features"`
- `opinion.js` uses `category: "Opinion"`
- `devcom.js` uses `category: "DevCom"`
- `komiks.js` uses `category: "Komiks"`
- `literary.js` uses `category: "Literary"`

Rules when adding an article:

- Put the article in the matching section file.
- Keep `category` exactly the same as the section name above.
- Use optional `displayCategory` if you want a custom visible badge without changing the section filter.
- Keep `slug` unique across all files.
- Use `date` format `YYYY-MM-DD`.
- Put images in the matching `PHOTOS/` folder when possible.
- For `News` articles, you can add an optional `imageCaption` string to show a small gray caption under the main image on `article.html`.
- Choose a credit label preset when needed:
  - `via` for most write-ups
  - `written` for Literary and First POV write-ups
  - `filipino` for Filipino labels

Minimum article object shape:

```js
{
    slug: "unique-slug",
    category: "SectionName",
    displayCategory: "Custom visible label", // optional, e.g. "News"
    title: "Article title",
    summary: "Short summary",
    author: "Author Name",
    authorLine: "By Author Name, CLSU Collegian",
    date: "2026-04-23",
    readTime: "3 min read",
    image: "PHOTOS/SECTION/example.jpg",
    imageAlt: "Image description",
    socialImage: "PHOTOS/SECTION/example-social.jpg", // optional, use a dedicated 1200x630 preview image when available
    socialImageAlt: "Preview image description", // optional, falls back to imageAlt/title
    imageCaption: "Optional short caption for the main image", // News only
    body: `
        <p><strong>SECTION | Article title</strong></p>
        <p>Full article body here.</p>
    `
}
```

Animated or video media options:

- Standard article: keep using `image` and `imageAlt`.
- Literary or Komiks animation/video article: add a `literaryMedia` object.
- Use `literaryMedia.card` for the media shown on section pages.
- Use `literaryMedia.article` for the media shown on `article.html`.

Example:

```js
{
    slug: "unique-animation-post",
    category: "Komiks",
    title: "Animation post title",
    summary: "Short summary",
    author: "Author Name",
    authorLine: "Author Name, CLSU Collegian",
    date: "2026-04-23",
    readTime: "3 min read",
    literaryMedia: {
        card: {
            type: "video",
            embedUrl: "https://www.facebook.com/plugins/video.php?..."
        },
        article: {
            type: "video",
            embedUrl: "https://www.facebook.com/plugins/video.php?..."
        }
    },
    body: `
        <p>Full literary body here.</p>
    `
}
```

Optional structured credits:

```js
{
    credits: {
        labelPreset: "via", // or "written" or "filipino"
        by: "Author Name, CLSU Collegian",
        photosBy: "Photographer Name, CLSU Collegian",
        layoutBy: "Layout Artist Name, CLSU Collegian",
        illustratedBy: "Illustrator Name, CLSU Collegian",
        animationBy: "Animator Name, CLSU Collegian",
        labels: {
            by: "Isinulat ni:",
            illustratedBy: "Iginuhit nina:",
            photos: "Larawan nina:",
            layoutBy: "Inianyo ni:"
        },
        extra: [
            { label: "Edited By", value: "Editor Name, CLSU Collegian" }
        ]
    }
}
```

Available built-in label presets:

- `via`: `Via:`, `Illustrated by:`, `Animation by:`, `Photo by:` or `Photos by:`, `Layout by:`
- `written`: `Written by:`, `Illustrated by:`, `Animation by:`, `Photo by:` or `Photos by:`, `Layout by:`
- `filipino`: quick default labels only

For exact Filipino grammar, set the label yourself with `credits.labels`, for example:

```js
credits: {
    labelPreset: "filipino",
    by: "Justine Ace Sandoval, CLSU Collegian",
    layoutBy: "Asher Terby Esquivel, CLSU Collegian",
    labels: {
        by: "Isinulat ni:",
        layoutBy: "Inianyo ni:"
    }
}
```

You can also choose plural labels like:

- `Isinulat nina:`
- `Iginuhit nina:`
- `Animasyon nina:`
- `Larawan nina:`
- `Inianyo nina:`

You can also override any single label with `credits.labels`.
You can also mix English and Filipino labels in the same article. Example:

```js
credits: {
    labelPreset: "via",
    by: "Justine Ace Sandoval, CLSU Collegian",
    layoutBy: "Asher Terby Esquivel, CLSU Collegian",
    labels: {
        by: "Via:",
        layoutBy: "Inianyo ni:"
    }
}
```

Only include the credit fields you actually need. Missing ones are skipped automatically on the article page.

Category label note:

- `category` decides which section page the article belongs to.
- `displayCategory` decides the visible badge shown on cards, article pages, hero, related items, trending, and search results.
- Example:

```js
{
    category: "DevCom",
    displayCategory: "News"
}
```

Multimedia labels are separate from article credits. In `data/multimedia.js`, use exact labels per field, for example:

```js
{
    presenterLabel: "Host:",
    presenter: "Name Here",
    technicalDirectorLabel: "Technical Director:",
    technicalDirector: "Name Here",
    videographerLabel: "Videographers:",
    videographer: "Name Here",
    editorLabel: "Editor:",
    editor: "Name Here"
}
```

Social preview note:

- `summary` becomes the Open Graph and Twitter description.
- `image` or `socialImage` becomes the preview image.
- Keep preview art absolute-URL safe and ideally close to a 1200x630 crop.
- After changing article metadata, run `node scripts/generate-share-pages.js` so every `/share/*.html` page is regenerated with the new server-rendered meta tags.
