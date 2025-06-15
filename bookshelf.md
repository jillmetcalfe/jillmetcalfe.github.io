---
layout: page
title: Bookshelf
permalink: /bookshelf/
---

# My Bookshelf

> What an astonishing thing a book is. It's a flat object made from a tree with flexible parts on which are imprinted lots of funny dark squiggles. But one glance at it and you're inside the mind of another person, maybe somebody dead for thousands of years. Across the millennia, an author is speaking clearly and silently inside your head, directly to you. Writing is perhaps the greatest of human inventions, binding together people who never knew each other, citizens of distant epochs. Books break the shackles of time. A book is proof that humans are capable of working magic.
>
> -- Carl Sagan, Cosmos, Part 11: The Persistence of Memory (1980)

## Books I'm Reading, Have Read, and Plan to Read

{% assign books_by_status = site.books | group_by: "status" %}

{% for status_group in books_by_status %}
  {% if status_group.name == "Currently Reading" %}
### 📖 Currently Reading
    {% for book in status_group.items %}
- **[{{ book.title }}]({{ book.url }})** by {{ book.author }}
    {% endfor %}
  {% endif %}
{% endfor %}

{% for status_group in books_by_status %}
  {% if status_group.name == "Finished" %}
### ✅ Recently Finished
    {% assign finished_books = status_group.items | sort: "finished" | reverse %}
    {% for book in finished_books limit: 5 %}
- **[{{ book.title }}]({{ book.url }})** by {{ book.author }} {% if book.stars %}({{ book.stars }}⭐){% endif %}
    {% endfor %}
  {% endif %}
{% endfor %}

{% for status_group in books_by_status %}
  {% if status_group.name == "Want to Read" %}
### 📚 Want to Read
    {% for book in status_group.items %}
- **{{ book.title }}** by {{ book.author }}
    {% endfor %}
  {% endif %}
{% endfor %}

---

*Books are added as I read them. Each book links to my notes and thoughts about it.*

### About My Reading

I try to maintain a mix of technical books, business insights, and fiction. I'm particularly interested in books about:

- Development practices and software engineering
- Automation and productivity 
- Problem-solving approaches
- Interesting fiction that offers new perspectives

Have a book recommendation? Feel free to reach out on [LinkedIn](https://linkedin.com/in/jillmetcalfe)!
