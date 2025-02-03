# Download Hugo:
https://docs.hugoblox.com/getting-started/install-hugo/
`brew install git golang hugo nodeo`

To fix error on this branch:
Upgrade Hugo (address module compatibility warning): The warning indicates you need Hugo v0.134.1+ extended. Current version is v0.123.7. Follow Hugo's installation guide to get the latest extended version.

Fix missing shortcode (main error): Either:

Add the missing staticref shortcode in layouts/shortcodes/staticref.html
Or ensure Hugo Blox modules are properly installed:
hugo mod tidy
hugo mod npm pack
npm install


# Important bash commands:
```
bash update.sh -"
bash view.sh
```

# Important file locations:
- content/_index.md #main everything
- content/authors/admin/_index.md # Author Information

- static/uploads/resume.pdf # Resume
- assets/media/icons/brands

  Publication:
- content/publication/journal-article/cite.bib
- content/publication/journal-article/index.md

# Activate in block with id: posts in content/_index.md
Post:
- content/post/writing-technical-content/index.md
- content/post_template_inspiration/writing-technical-content
#- content/project/external-project/index.md
#- content/post/blog-with-jupyter/index.md

- ./assets/media/icon.png

- config/_default/params.yaml
  - marketing
    - description
    - Short description of Website which displayed sometimes.
--------------
Old locations?
- content/home/experience.md # Experiences
- content/_index.md

- content/publication/preprint/index.md

- content/publication/conference-paper/cite.bib
- content/publication/conference-paper/index.md

- post/getting-started/index.md
