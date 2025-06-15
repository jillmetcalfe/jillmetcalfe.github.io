# Content Templates

This directory contains templates for creating new content on the site.

## Book Template

For adding new books to the bookshelf, copy the template below:

### File Location
Create new books in: `_books/book-title.md`

### Front Matter Template
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

# Book Title
**by Author Name**

⭐⭐⭐⭐⭐ (X/5 stars) <!-- Only for finished books -->

**Status:** [Status]  
**Started:** [Date]
**Finished:** [Date] <!-- Only for finished books -->

## My Thoughts

[Your review/thoughts about the book]

### Key Takeaways

- Point 1
- Point 2
- Point 3

### Personal Application

[How you're applying what you learned]

### Who Should Read This

[Recommendations for target audience]

### Favorite Quote

> "Quote from the book"

---

**Would I recommend it?** [Yes/No and why]
```

## Blog Post Template

For future blog posts, use this template:

### File Location
Create new posts in: `_posts/YYYY-MM-DD-post-title.md`

### Front Matter Template
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
categories: [category1, category2]
tags: [tag1, tag2, tag3]
---

Your blog post content here...
```

## Project Template

For adding new projects:

### File Location
Create new projects in: `_projects/project-name.md`

### Front Matter Template
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

# Project Name

## Overview
[Brief description of what the project does]

## Problem Solved
[What problem this project addresses]

## Technologies Used
- Technology 1
- Technology 2
- Technology 3

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Challenges & Solutions
[Any interesting challenges you overcame]

## What I Learned
[Skills/knowledge gained from this project]

## Links
- [GitHub Repository](link) <!-- If applicable -->
- [Live Demo](link) <!-- If applicable -->
```

---

*These templates help maintain consistency across the site. Copy and modify as needed for your content.*
