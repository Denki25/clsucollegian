Article setup per section:

- `news.js` uses `category: "News"`
- `features.js` uses `category: "Features"`
- `opinion.js` uses `category: "Opinion"`
- `devcom.js` uses `category: "DevCom"`
- `infographics.js` uses `category: "Komiks"`
- `literary.js` uses `category: "Literary"`

Rules when adding an article:

- Put the article in the matching section file.
- Keep `category` exactly the same as the section name above.
- Keep `slug` unique across all files.
- Use `date` format `YYYY-MM-DD`.
- Put images in the matching `PHOTOS/` folder when possible.

Minimum article object shape:

```js
{
    slug: "unique-slug",
    category: "SectionName",
    title: "Article title",
    summary: "Short summary",
    author: "Author Name",
    authorLine: "By Author Name, CLSU Collegian",
    date: "2026-04-23",
    readTime: "3 min read",
    image: "PHOTOS/SECTION/example.jpg",
    imageAlt: "Image description",
    body: `
        <p><strong>SECTION | Article title</strong></p>
        <p>Full article body here.</p>
    `
}
```

Optional structured credits:

```js
{
    credits: {
        by: "Author Name, CLSU Collegian",
        photosBy: "Photographer Name, CLSU Collegian",
        layoutBy: "Layout Artist Name, CLSU Collegian",
        illustratedBy: "Illustrator Name, CLSU Collegian",
        extra: [
            { label: "Edited By", value: "Editor Name, CLSU Collegian" }
        ]
    }
}
```

Rendered labels are standardized as `Report by:`, `Photo by:` or `Photos by:`, `Layout by:`, and `Illustrated by:`.
Only include the credit fields you actually need. Missing ones are skipped automatically on the article page.
