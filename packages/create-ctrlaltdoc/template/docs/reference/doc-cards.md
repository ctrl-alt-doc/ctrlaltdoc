---
title: Documentation Cards
description: Automatically generate cards from documentation pages.
---

# Documentation cards

Documentation cards automatically generate a group of cards from the documentation structure.

They are particularly useful on category index pages, where you want the available pages to be displayed without maintaining a separate list.

## Usage

Add a `:::doc-cards` block to a category index page.

The block is automatically populated from the documentation pages belonging to that category.

On the homepage, directories are included when they contain an `index.md` document. That document supplies the card title, description, and destination.

If a page defines a `sidebar.badge` value in its frontmatter, the same badge appears on its documentation card. Supported values are `New`, `Updated`, and `Beta`.

## Example

The [Reference](/reference) category uses documentation cards to present its child pages.

Add the following to a category index page:

`:::doc-cards`

The closing `:::` completes the block.

## When to use them

Documentation cards are useful when:

- a category contains several related pages
- you want the list to stay in sync with the documentation structure
- you want a category landing page to act as a visual index

Unlike regular [Cards](/reference/cards), documentation cards do not require you to define each destination manually.
