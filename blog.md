---
layout: page
title: Blog
permalink: /blog/
---

Welcome to my blog! Here I share insights from my development journey, tutorials, and thoughts on technology and problem-solving.

<div class="posts">
  {% for post in site.posts %}
    <article class="post">
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <time datetime="{{ post.date | date_to_xmlschema }}" class="post-date">{{ post.date | date: "%B %d, %Y" }}</time>
      <p>{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
      <a href="{{ post.url }}" class="read-more">Read more &rarr;</a>
    </article>
  {% endfor %}
</div>

{% if site.posts.size == 0 %}
## Coming Soon!

I'm working on some great content to share. Check back soon for posts about:

- Development tutorials and tips
- Project deep-dives and lessons learned  
- Technology insights and trends
- Problem-solving approaches

In the meantime, feel free to explore my [projects](/projects/) or [get in touch](/about/) if you'd like to connect!
{% endif %}

---

*Want to stay updated? Follow me on [GitHub](https://github.com/jillmetcalfe) or connect on [LinkedIn](https://linkedin.com/in/jillmetcalfe).*
