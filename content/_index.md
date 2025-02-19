---
# Leave the homepage title empty to use the site title
title: ''
date: 2022-10-24
type: landing

sections:
  - block: hero
    demo: true # Only display this section in the Hugo Blox Builder demo site
    content:
      title: Hugo Academic Theme
      image:
        filename: hero-academic.png
      cta:
        label: '**Get Started**'
        url: https://hugoblox.com/templates/
      cta_alt:
        label: Ask a question
        url: https://discord.gg/z8wNYzb
      cta_note:
        label: >-
          <div style="text-shadow: none;"><a class="github-button" href="https://github.com/HugoBlox/hugo-blox-builder" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star">Star Hugo Blox Builder</a></div><div style="text-shadow: none;"><a class="github-button" href="https://github.com/HugoBlox/theme-academic-cv" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star">Star the Academic template</a></div>
      text: |-
        **Generated by Hugo Blox Builder - the FREE, Hugo-based open source website builder trusted by 500,000+ sites.**

        **Easily build anything with blocks - no-code required!**

        From landing pages, second brains, and courses to academic resumés, conferences, and tech blogs.

        <!--Custom spacing-->
        <div class="mb-3"></div>
        <!--GitHub Button JS-->
        <script async defer src="https://buttons.github.io/buttons.js"></script>
    design:
      background:
        gradient_end: '#1976d2'
        gradient_start: '#004ba0'
        text_color_light: true
  - block: about.biography
    id: about
    content:
      title: Biography
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
  #- block: skills
  #  content:
  #    title: Skills
  #    text: ''
  #    # Choose a user to display skills from (a folder name within `content/authors/`)
  #    username: admin
  #  design:
  #    columns: '1'
  - block: experience
    id: experience
    content:
      title: Experience
      # Date format for experience
      #   Refer to https://docs.hugoblox.com/customization/#date-format
      date_format: Jan 2006
      # Experiences.
      #   Add/remove as many `experience` items below as you like.
      #   Required fields are `title`, `company`, and `date_start`.
      #   Leave `date_end` empty if it's your current employer.
      #   Begin multi-line descriptions with YAML's `|2-` multi-line prefix.
      items:
        - title: Software Consultant
          company: TNG Technology
          company_url: 'https://www.tngtech.com/en/'
          company_logo: tng_logo 
          location: Munich, Germany
          date_start: '2024-12-01'
          #date_end: '2023-05-30'
          description: |2-
              * Modernization and further development of a supply chain management application in an international development team
              * Service for requesting quotation, bidding, displaying and confirming delivery orders
              * Agile development with a two-week sprint cycle, continuous integration, and regular production releases within the sprint
              * Setup of CI pipelines (Jenkins, SonarQube, Gradle)
              * Enhancement of test automation capabilities
              * Full-stack development with
                * React, TypeScript, Java 8/17, JBoss, Oracle DB, Gradle, JUnit, Docker, Podman, Jenkins, SonarQube
        - title: Research Assistant
          company: ETH Zürich
          company_url: 'https://applied.math.yale.edu/'
          company_logo: ETH_Logo
          location: Basel, Switzerland
          date_start: '2024-02-01'
          date_end: '2024-09-30'
          description: Researching statistical methods for mutational patterns estimation with tree structures in the lab of [Niko Beerenwinkel](https://bsse.ethz.ch/cbg/group.html) with focus on data from the [Tumor Profiler](https://eth-nexus.github.io/tu-pro_website/).
        - title: Research Assistant
          company: Stanford University
          company_url: 'https://www.stanford.edu/'
          company_logo: Stanford_Cardinal_logo
          location: Palo Alto, USA
          date_start: '2023-07-01'
          date_end: '2023-11-30'
          description: |2-
              * Analyzed the role of air pollution in the race-ethnicity to premature mortality causal chain, under [Pascal Geldsetzer](https://profiles.stanford.edu/pascal-geldsetzer)'s guidance, leading to key insights that contribute to policy-shaping discussions.
              * Spearheaded the project with minimal supervision. 
              * Devised and [implemented](https://github.com/FridljDa/pm25_inequality) a comprehensive statistical analysis in R, synthesized findings from 150 pertinent publications, wrote the initial manuscript and technical supplement, and drove the manuscript from conceptualization to successful publication.
              * <details>
                * Harmonized geospatial and tabular data on air pollution, mortality, population numbers, and orchestrated analyses of 10 different steps. 
                * Executed major revisions of the manuscript and conducted new analyses, including 15 new figures, within a strict 2-month deadline as part of the 'Revise and Resubmit' response.
                * Developed an interactive [Shiny web application](https://github.com/FridljDa/ui_pm_attributable) to visualize 17-dimensional data, enhancing collaboration and data interpretation among the research team.
                * Collaborated with seven Stanford co-authors to systematically gather and integrate critical feedback throughout various project stages, driving a significant enhancement in research quality.
                </details>
        - title: Exchange student
          company: Yale University
          company_url: 'https://www.yale.edu/'
          company_logo: Yale_University_Shield_1
          location: New Haven, USA
          date_start: '2022-09-01'
          date_end: '2023-05-30'
          description: Chosen as one of two master's students to represent the University of Heidelberg in a year-long study abroad program at Yale University. Hosted by the [Applied Mathematics Program](https://applied.math.yale.edu/). Advised by [Smita Krishnaswamy](https://krishnaswamylab.org/).
        - title: Research Assistant 
          company: European Molecular Biology Laboratory
          company_url: '(https://www.embl.org/'
          company_logo: European_Molecular_Biology_Laboratory_Logo
          location: Heidelberg, Germany
          date_start: '2021-10-01'
          date_end: '2022-05-31'
          description: |2-
              * Developed and implemented a novel statistical method in R under the guidance of [Wolfgang Huber](https://www.huber.embl.de/) and [Nikos Ignatiadis](https://nignatiadis.github.io/) to identify outliers in large-scale data sets, enhancing detection capabilities in the presence of high-dimensional side-information.
              * Tripled statistical detection power in a high-dimensional setting by integrating Selective Inference, Machine Learning, and Empirical Bayes approaches.
              * Successfully applied the developed method to genome-wide association study, identifying key genetic markers linked to diseases.
              * Presented research findings at seven scientific events, including a seminar talks at [Yale University](https://www.yale.edu/) and [University of North Carolina at Chapel Hill](https://www.unc.edu/) and a competitively selected oral contribution at [DAGStat 2022](https://www.dagstat2022.uni-hamburg.de/bilder/booklet.pdf), attended by 100 scholars.
              * Conducted the peer review for manuscript at Bioinformatics Advances, contributed the peer review for manuscript at Cell Biology.
        - title: Master Student in Mathematics
          company: Heidelberg University
          company_url: 'https://www.uni-heidelberg.de/en'
          company_logo: Logo_University_of_Heidelberg
          location: Heidelberg, Germany
          date_start: '2020-10-01'
          date_end: '2023-06-01'
          description: |2-
              * Final Grade: 1.0
              * Thesis advisor: Dr. Wolfgang Huber (EMBL), Prof. Dr. Jan Johannes
              * Thesis title: Better multiple Testing: Using multivariate co-data for hypotheses
        - title: Exchange student
          company: Hebrew University of Jerusalem
          company_url: 'https://en.huji.ac.il/en'
          company_logo: Hebrew_University_Logo
          location: Jerusalem, Israel
          date_start: '2019-09-01'
          date_end: '2020-03-12'
          description: Graduate-level courses in Functional Analysis, Algebraic Combinatorics, and Quantitative Models at Einstein Institute of Mathematics.
        - title: Bachelor Student in Mathematics
          company: Heidelberg University
          company_url: 'https://www.uni-heidelberg.de/en'
          company_logo: Logo_University_of_Heidelberg
          location: Heidelberg, Germany
          date_start: '2017-10-01'
          date_end: '2020-09-30'
          description: |2-
              * Final Grade: 1.4
              * Thesis advisor: Prof. Dr. Jan Johannes
              * Online estimation of the geometric median in Hilbert spaces
    design:
      columns: '2'
  - block: collection
    id: posts
    content:
      title: Posts
      subtitle: ''
      text: ''
      # Choose how many pages you would like to display (0 = all pages)
      count: 5
      # Filter on criteria
      filters:
        folders:
          - post
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      # Choose how many pages you would like to offset by
      offset: 0
      # Page order: descending (desc) or ascending (asc) date.
      order: desc
    design:
      # Choose a layout view
      view: compact
      columns: '2'
#  - block: portfolio
#    id: projects
#    content:
#      title: Projects
#      filters:
#        folders:
#          - project
#      # Default filter index (e.g. 0 corresponds to the first `filter_button` instance below).
#      default_button_index: 0
#      # Filter toolbar (optional).
#      # Add or remove as many filters (`filter_button` instances) as you like.
#      # To show all items, set `tag` to "*".
#      # To filter by a specific tag, set `tag` to an existing tag name.
#      # To remove the toolbar, delete the entire `filter_button` block.
#      buttons:
#        - name: All
#          tag: '*'
#        - name: Deep Learning
#          tag: Deep Learning
#        - name: Other
#          tag: Demo
#    design:
#      # Choose how many columns the section has. Valid values: '1' or '2'.
#      columns: '1'
#      view: showcase
#      # For Showcase view, flip alternate rows?
#      flip_alt_rows: false
  - block: collection
    id: publications
    content:
      title: Publications
      text: |-
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      columns: '2'
      view: citation
---
