---
layout: post
title: "Setting Up a Jekyll Blog with GitHub Pages"
date: 2025-06-19
categories: [tutorial, web-development]
tags: [jekyll, github-pages, blogging]
excerpt: "A practical guide to creating and customizing a Jekyll blog hosted on GitHub Pages, including tips for styling and organization."
---

Creating a blog with Jekyll and GitHub Pages is a fantastic way to share your thoughts and technical insights with the world. Here's what I learned while setting up this very blog.

## Why Jekyll?

Jekyll is a static site generator that's perfect for developers who want:

- **Version control** for their content (it's all in Git!)
- **Markdown support** for easy writing
- **Customizable themes** and layouts
- **Free hosting** with GitHub Pages

## The Basic Setup

Setting up a Jekyll blog involves a few key components:

### 1. Directory Structure

```
_posts/          # Your blog posts go here
_layouts/        # Templates for different page types
_sass/           # Styling files
_config.yml      # Site configuration
```

### 2. Writing Posts

Blog posts follow a specific naming convention: `YYYY-MM-DD-title.md`

Each post needs front matter at the top:

```yaml
---
layout: post
title: "Your Post Title"
date: 2025-06-19
categories: [category1, category2]
tags: [tag1, tag2]
---
```

### 3. Creating Layouts

The `post` layout defines how individual blog posts are displayed. It typically includes:

- Post title and metadata
- Publication date
- Categories and tags
- The post content
- Navigation back to the blog

## Styling Tips

Here are some things I learned about styling:

- **Use SCSS** for better organization of your styles
- **Import styles modularly** to keep things maintainable
- **Consider responsive design** from the start
- **Test your styles** in both light and dark modes if you support them

## Deployment

One of the best things about GitHub Pages is automatic deployment. Simply:

1. Push your changes to the main branch
2. GitHub automatically builds and deploys your site
3. Your changes are live within minutes

## Next Steps

Some features I'm planning to add:

- Search functionality
- Categories and tags pages
- RSS feed optimization
- Social sharing buttons

Building a blog is an iterative process. Start simple and add features as you need them!

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)

---

*Have questions about Jekyll or blog setup? Feel free to reach out on [LinkedIn](https://linkedin.com/in/jillmetcalfe)!*
