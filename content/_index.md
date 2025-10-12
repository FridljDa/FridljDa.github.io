---
# Leave the homepage title empty to use the site title
title: ''
date: 2022-10-24
type: landing

design:
  # Default section spacing
  spacing: '6rem'

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      text: ''
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download CV
        url: uploads/resume.pdf
      headings:
        about: ''
        education: ''
        interests: ''
    design:
      # Apply a gradient background
      css_class: hbx-bg-gradient
      # Avatar customization
      avatar:
        size: medium # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
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
              * Modernizing and developing a supply chain management application within an international development team
              * Selected by the team to participate in Program Increment (PI) planning sessions, contributing to strategic planning and cross-team coordination
              * Maintaining up CI pipelines based on Jenkins, particularly the OWASP scan
              * Driving initiatives to address developer pain points across teams, reducing artifactory pipeline runtime from 8 hours to 30 seconds, minimizing wait times for feature developers using new libraries
              * Creating synergies between feature teams working on different applications
              * Navigating complex client projects with diverse stakeholder teams and legacy system constraints
              * Full-stack development using Java 17, JBoss, Spring, Oracle DB, Gradle, JUnit, Docker, Podman, Jenkins, React, and TypeScript
              * Co-organizing and contributing to the internal "AI Tool of the Week" blog series, providing weekly summaries of AI advancements including AI-assisted coding, agentic workflows, and multi-modal processing tools     
        
        - title: Research Assistant
          company: ETH Zürich
          company_url: 'https://applied.math.yale.edu/'
          company_logo: ETH_Logo
          location: Basel, Switzerland
          date_start: '2024-02-01'
          date_end: '2024-09-30'
          description: |2-
              * Researching statistical methods for mutational patterns estimation with tree structures in the lab of [Niko Beerenwinkel](https://bsse.ethz.ch/cbg/group.html) with focus on data from the [Tumor Profiler](https://eth-nexus.github.io/tu-pro_website/).
              * Lecture on Statistical Models in Computational Biology covering hidden Markov models, EM algorithm, Variational inference.
              * I developed a novel Bayesian model using Hierarchical Dirichlet Processes (HDP) to analyze mutational signatures by integrating data from evolutionary trees. The model is designed to leverage the phylogenetic relationships between cancer subclones, assuming that evolutionarily closer cells exhibit more similar mutational signature activities. This non-parametric approach learns the number of signatures directly from the data while using the tree structure as a prior to guide the estimation of signature activities. A prototype was implemented and applied to single-cell sequencing data, allowing for the simultaneous discovery of signatures and the mapping of their activities across the cellular phylogeny. My blog post can be found [here](https://danielfridljand.de/post/mutational-signature-with-hierarchical-dirichlet-process/).
        - title: Research Assistant
          company: Stanford University
          company_url: 'https://www.stanford.edu/'
          company_logo: Stanford_Cardinal_logo
          location: Palo Alto, USA
          date_start: '2023-07-01'
          date_end: '2023-11-30'
          description: |2-
              * Led the end-to-end statistical analysis for a landmark study on US health disparities, resulting in a [first-author publication in Nature Medicine](https://www.nature.com/articles/s41591-024-03117-0)
              * Analyzed the role of air pollution in the race-ethnicity to premature mortality causal chain, under [Pascal Geldsetzer](https://profiles.stanford.edu/pascal-geldsetzer)'s guidance
              * Spearheaded the project with minimal supervision, [implementing](https://github.com/FridljDa/pm25_inequality) comprehensive statistical analysis in R and synthesizing findings from 150 pertinent publications
              * <details><summary>Key achievements and detailed contributions</summary>
                <ul>
                <li>Harmonized geospatial and tabular data on air pollution, mortality, population numbers, and orchestrated analyses of 10 different steps.</li>
                <li>Executed major revisions of the manuscript and conducted new analyses, including 15 new figures, within a strict 2-month deadline as part of the 'Revise and Resubmit' response.</li>
                <li>Developed an interactive <a href="https://github.com/FridljDa/ui_pm_attributable">Shiny web application</a> to visualize 17-dimensional data, enhancing collaboration and data interpretation among the research team.</li>
                <li>Collaborated with seven Stanford co-authors to systematically gather and integrate critical feedback throughout various project stages, driving a significant enhancement in research quality.</li>
                </ul>
                </details>
        - title: Exchange student
          company: Yale University
          company_url: 'https://www.yale.edu/'
          company_logo: Yale_University_Shield_1
          location: New Haven, USA
          date_start: '2022-09-01'
          date_end: '2023-05-30'
          description: Chosen as one of two Master's students to represent the University of Heidelberg in a year-long study abroad program at Yale University. Hosted by the [Applied Mathematics Program](https://applied.math.yale.edu/). Advised by [Smita Krishnaswamy](https://krishnaswamylab.org/). Course work on Geometric & Topological Methods in Machine Learning, Differentiable Manifolds, Deep Learning, Statistical Methods in Human Genetics
        - title: Research Assistant 
          company: European Molecular Biology Laboratory
          company_url: 'https://www.embl.org/'
          company_logo: European_Molecular_Biology_Laboratory_Logo
          location: Heidelberg, Germany
          date_start: '2021-10-01'
          date_end: '2022-05-31'
          description: |2-
              * Developed IHW-Forest, a scalable solution to the "curse of dimensionality" that previously limited the standard [IHW method](https://bioconductor.org/packages/release/bioc/html/IHW.html) for high-dimensional datasets.
              * Supervised by [Wolfgang Huber](https://www.huber.embl.de/) and [Nikos Ignatiadis](https://nignatiadis.github.io/).
              * Designed an innovative stratification algorithm that automatically selects and ranks informative covariates, enhancing robustness to noisy and unknown features in real-world data.
              * Led the project from inception to dissemination, presenting results at seven scientific events, including invited talks at [Yale University](https://www.yale.edu/), [University of North Carolina at Chapel Hill](https://www.unc.edu/), and a competitively selected oral presentation at [DAGStat 2022](https://www.dagstat2022.uni-hamburg.de/bilder/booklet.pdf) before 100 scholars.
              * Applied IHW-Forest in a large-scale production analysis of 16 billion genetic tests, utilizing 11 covariates to boost the discovery of significant SNP-histone associations by over 30% compared to alternative methods.
              * Incorporated concepts from selective inference, machine learning, and empirical Bayes.
              * Served as a peer reviewer for Bioinformatics Advances and Cell Biology.     
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
              * Thesis title: Better Multiple Testing: Using multivariate co-data for hypotheses
              * Course work on high-dimensional statistics, Probability theory, nonparametric and parametric statistics, Algebraic Topology. 
        - title: Exchange Student
          company: Hebrew University of Jerusalem
          company_url: 'https://en.huji.ac.il/en'
          company_logo: Hebrew_University_Logo
          location: Jerusalem, Israel
          date_start: '2019-09-01'
          date_end: '2020-03-12'
          description: |2-
              * Graduate-level coursework in Functional Analysis, Algebraic Combinatorics, and Quantitative Models at the Einstein Institute of Mathematics.
        - title: Bachelor Student in Mathematics
          company: Heidelberg University
          company_url: 'https://www.uni-heidelberg.de/en'
          company_logo: Logo_University_of_Heidelberg
          location: Heidelberg, Germany
          date_start: '2017-10-01'
          date_end: '2020-09-30'
          description: |2-
              * Final grade: 1.4
              * Thesis advisor: Prof. Dr. Jan Johannes
              * Thesis title: Online Estimation of the Geometric Median in Hilbert Spaces
              * Thesis summary: Mathematically analyzed a novel, efficient algorithm for estimating the geometric median in Hilbert spaces, proving its almost sure consistency, convergence rate, and asymptotic normality.
              * Minor in Computer Science
              * Coursework in Statistics, Algorithms and Data Structures, Linear Algebra, Abstract Algebra
    design:
      columns: '2'
  - block: collection
    id: paper
    content:
      title: Publication
      text: ''
      filters:
        folders:
          - publication
        exclude_featured: false
    design:
      view: citation
  - block: collection
    id: talks
    content:
      title: Recent & Upcoming Talks
      filters:
        folders:
          - events
    design:
      view: card
  - block: collection
    id: posts
    content:
      title: Recent Posts
      subtitle: ''
      text: ''
      # Page type to display. E.g. post, talk, publication...
      page_type: blog
      # Choose how many pages you would like to display (0 = all pages)
      count: 5
      # Filter on criteria
      filters:
        author: ''
        category: ''
        tag: ''
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ''
      # Choose how many pages you would like to offset by
      offset: 0
      # Page order: descending (desc) or ascending (asc) date.
      order: desc
    design:
      # Choose a layout view
      view: card
      # Reduce spacing
      spacing:
        padding: [0, 0, 0, 0]
  - block: cta-card
    demo: true # Only display this section in the Hugo Blox Builder demo site
    content:
      title: 👉 Build your own academic website like this
      text: |-
        This site is generated by Hugo Blox Builder - the FREE, Hugo-based open source website builder trusted by 250,000+ academics like you.

        <a class="github-button" href="https://github.com/HugoBlox/hugo-blox-builder" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star HugoBlox/hugo-blox-builder on GitHub">Star</a>

        Easily build anything with blocks - no-code required!

        From landing pages, second brains, and academic resumés to conferences, and tech blogs.
      button:
        text: Get Started
        url: https://hugoblox.com/templates/
    design:
      card:
        # Card background color (CSS class)
        css_class: 'bg-primary-300'
        css_style: ''
---
