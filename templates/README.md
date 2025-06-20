# Content Templates

This directory contains templates for creating new content on the site.

**⚠️ IMPORTANT:** Never start your content with a heading (`# Title`) that matches the `title:` in the front matter, as the layouts automatically create the page heading from the front matter.

## Blog Post Template

For creating new blog posts:

### File Location
Create new posts in: `_posts/YYYY-MM-DD-post-title.md`

### Template
```yaml
---
layout: post
title: "Your Post Title Here"
date: YYYY-MM-DD
categories: [category1, category2]
tags: [tag1, tag2, tag3]
excerpt: "Brief description of your post (optional but recommended)"
---

Your blog post content starts here without a duplicate heading.

## First Section

Content for your first section...

## Second Section

Content for your second section...

### Subsection

More detailed content...

## Conclusion

Wrap up your thoughts...

---

*Have questions? Feel free to reach out on [LinkedIn](https://linkedin.com/in/jillmetcalfe)!*
```

## Page Template

For creating new standalone pages:

### File Location
Create new pages in the root directory: `page-name.md`

### Template
```yaml
---
layout: page
title: "Page Title"
permalink: /page-name/
---

Your page content starts here without a duplicate heading.

## First Section

Content for your first section...

## Second Section

Content for your second section...
```

## Project Template

For adding new projects:

### File Location
Create new projects in: `_projects/project-name.md`

### Template
```yaml
---
layout: page
title: "Project Name"
description: "Brief description of the project"
categories: [web-development, automation, etc]
technologies: [JavaScript, Python, etc]
status: "Completed" # Options: "In Progress", "Completed", "On Hold"
github: "https://github.com/username/repo" # Optional
demo: "https://demo-url.com" # Optional
---

## Overview
Brief description of what the project does and why it matters.

## Problem Solved
What specific problem this project addresses and for whom.

## Technologies Used
- Technology 1 - Brief explanation of why you chose it
- Technology 2 - What role it plays in the project
- Technology 3 - Any specific benefits it provided

## Key Features
- Feature 1 - Description of functionality
- Feature 2 - User benefit or technical achievement
- Feature 3 - Any unique aspects

## Development Process
Brief overview of how you approached building this project.

## Challenges & Solutions
Any interesting technical challenges you overcame and how you solved them.

## What I Learned
Skills, technologies, or insights gained from working on this project.

## Future Improvements
Ideas for enhancing the project further (if applicable).

## Links
{% if page.github %}
- [GitHub Repository]({{ page.github }})
{% endif %}
{% if page.demo %}
- [Live Demo]({{ page.demo }})
{% endif %}
```

## Book Template

For adding new books to the bookshelf:

### File Location
Create new books in: `_books/book-title.md`

### Template
```yaml
---
layout: page
title: "Book Title"
author: "Author Name"
categories: [category1, category2]
status: "Currently Reading" # Options: "Currently Reading", "Finished", "Want to Read"
started: "YYYY-MM-DD"
finished: "YYYY-MM-DD" # Only for finished books
stars: 5 # Only for finished books (1-5 stars)
---

**by {{ page.author }}**

{% if page.stars %}⭐⭐⭐⭐⭐ ({{ page.stars }}/5 stars){% endif %}

**Status:** {{ page.status }}  
**Started:** {{ page.started }}
{% if page.finished %}**Finished:** {{ page.finished }}{% endif %}

## My Thoughts

Your review and thoughts about the book...

### Key Takeaways

- Important insight 1
- Important insight 2
- Important insight 3

### Personal Application

How you're applying what you learned or plan to apply it...

### Who Should Read This

Recommendations for target audience and why they'd benefit...

### Favorite Quote

> "Insert your favorite quote from the book here"

---

**Would I recommend it?** [Yes/No and brief explanation why]
```

## Template Guidelines

### Do's ✅
- Always include proper front matter with required fields
- Start content directly without duplicate headings
- Use consistent heading hierarchy (## for main sections, ### for subsections)
- Include relevant categories and tags for discoverability
- Add excerpts for blog posts to improve the blog listing page
- Use liquid template tags when beneficial (like in the book template)

### Don'ts ❌
- **Never start content with `# Title`** - the layout handles this automatically
- Don't skip front matter - it's required for Jekyll to process the file
- Don't use inconsistent date formats - stick to YYYY-MM-DD
- Don't forget to include the layout field in front matter

### Front Matter Reference

**Required for all content:**
- `layout:` - Determines which template to use (post, page, etc.)
- `title:` - The page/post title (becomes the H1 heading)

**Required for blog posts:**
- `date:` - Publication date in YYYY-MM-DD format

**Optional but recommended:**
- `categories:` - For organization and navigation
- `tags:` - For more granular categorization
- `excerpt:` - For blog post previews
- `permalink:` - For custom URLs (mainly for pages)

---

*These templates help maintain consistency across the site and prevent common layout issues. Copy and modify as needed for your content.*
