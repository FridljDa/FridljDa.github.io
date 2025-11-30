# Daniel Fridljand - Curriculum Vitae

## Biography

I am a driven software consultant with a strong academic background in mathematics, statistics, and bioinformatics. My passion for machine learning, software development, and statistics has led me to work on projects across diverse domains, including public health, genetics, and oncology. With three years of scientific software development experience and a first-author publication in a high-impact journal, I'm committed to leveraging computational skills to solve real-world challenges.

**Role:** Software Consultant  
**Organization:** TNG technology (https://www.tngtech.com/en/)  
**Interests:** Statistics, Machine Learning, Software Development

## Education

### Master of Science in Mathematics
**University of Heidelberg** (2020-2023)  
- Final Grade: 1.0
- Thesis advisor: Dr. Wolfgang Huber (EMBL), Prof. Dr. Jan Johannes
- Thesis title: Better Multiple Testing: Using multivariate co-data for hypotheses
- Course work on high-dimensional statistics, Probability theory, nonparametric and parametric statistics, Algebraic Topology

### Bachelor of Science in Mathematics
**University of Heidelberg** (2017-2020)  
- Final grade: 1.4
- Thesis advisor: Prof. Dr. Jan Johannes
- Thesis title: Online Estimation of the Geometric Median in Hilbert Spaces
- Thesis summary: Mathematically analyzed a novel, efficient algorithm for estimating the geometric median in Hilbert spaces, proving its almost sure consistency, convergence rate, and asymptotic normality.
- Minor in Computer Science
- Coursework in Statistics, Algorithms and Data Structures, Linear Algebra, Abstract Algebra

### Exchange Programs
- **Yale University** (2022-2023): Chosen as one of two Master's students to represent the University of Heidelberg in a year-long study abroad program. Hosted by the Applied Mathematics Program. Advised by Smita Krishnaswamy. Course work on Geometric & Topological Methods in Machine Learning, Differentiable Manifolds, Deep Learning, Statistical Methods in Human Genetics
- **Hebrew University of Jerusalem** (2019-2020): Graduate-level coursework in Functional Analysis, Algebraic Combinatorics, and Quantitative Models at the Einstein Institute of Mathematics

## Professional Experience

### Software Consultant
**TNG Technology** | Munich, Germany | December 2024 - Present
- Modernizing and developing a supply chain management application within an international development team
- Selected by the team to participate in Program Increment (PI) planning sessions, contributing to strategic planning and cross-team coordination
- Maintaining CI pipelines based on Jenkins, particularly the OWASP scan
- Driving initiatives to address developer pain points across teams, reducing artifactory pipeline runtime from 8 hours to 30 seconds, minimizing wait times for feature developers using new libraries
- Creating synergies between feature teams working on different applications
- Navigating complex client projects with diverse stakeholder teams and legacy system constraints
- Full-stack development using Java 17, JBoss, Spring, Oracle DB, Gradle, JUnit, Docker, Podman, Jenkins, React, and TypeScript
- Co-organizing and contributing to the internal "AI Tool of the Week" blog series, providing weekly summaries of AI advancements including AI-assisted coding, agentic workflows, and multi-modal processing tools

### Research Assistant
**ETH Zürich** | Basel, Switzerland | February 2024 - September 2024
- Researching statistical methods for mutational patterns estimation with tree structures in the lab of Niko Beerenwinkel with focus on data from the Tumor Profiler
- Lecture on Statistical Models in Computational Biology covering hidden Markov models, EM algorithm, Variational inference
- Developed a novel Bayesian model using Hierarchical Dirichlet Processes (HDP) to analyze mutational signatures by integrating data from evolutionary trees. The model is designed to leverage the phylogenetic relationships between cancer subclones, assuming that evolutionarily closer cells exhibit more similar mutational signature activities. This non-parametric approach learns the number of signatures directly from the data while using the tree structure as a prior to guide the estimation of signature activities. A prototype was implemented and applied to single-cell sequencing data, allowing for the simultaneous discovery of signatures and the mapping of their activities across the cellular phylogeny.

### Research Assistant
**Stanford University** | Palo Alto, USA | July 2023 - November 2023
- Led the end-to-end statistical analysis for a landmark study on US health disparities, resulting in a first-author publication in Nature Medicine
- Analyzed the role of air pollution in the race-ethnicity to premature mortality causal chain, under Pascal Geldsetzer's guidance
- Spearheaded the project with minimal supervision, implementing comprehensive statistical analysis in R and synthesizing findings from 150 pertinent publications
- Key achievements:
  - Harmonized geospatial and tabular data on air pollution, mortality, population numbers, and orchestrated analyses of 10 different steps
  - Executed major revisions of the manuscript and conducted new analyses, including 15 new figures, within a strict 2-month deadline as part of the 'Revise and Resubmit' response
  - Developed an interactive Shiny web application to visualize 17-dimensional data, enhancing collaboration and data interpretation among the research team
  - Collaborated with seven Stanford co-authors to systematically gather and integrate critical feedback throughout various project stages, driving a significant enhancement in research quality

### Research Assistant
**European Molecular Biology Laboratory** | Heidelberg, Germany | October 2021 - May 2022
- Developed IHW-Forest, a scalable solution to the "curse of dimensionality" that previously limited the standard IHW method for high-dimensional datasets
- Supervised by Wolfgang Huber and Nikos Ignatiadis
- Designed an innovative stratification algorithm that automatically selects and ranks informative covariates, enhancing robustness to noisy and unknown features in real-world data
- Led the project from inception to dissemination, presenting results at seven scientific events, including invited talks at Yale University, University of North Carolina at Chapel Hill, and a competitively selected oral presentation at DAGStat 2022 before 100 scholars
- Applied IHW-Forest in a large-scale production analysis of 16 billion genetic tests, utilizing 11 covariates to boost the discovery of significant SNP-histone associations by over 30% compared to alternative methods
- Incorporated concepts from selective inference, machine learning, and empirical Bayes
- Served as a peer reviewer for Bioinformatics Advances and Cell Biology

## Publications

### Disparities in air pollution attributable mortality in the US population by race/ethnicity and sociodemographic factors
**Nature Medicine** (2024)  
**Authors:** Pascal Geldsetzer, Daniel Fridljand (equal contribution), Mathew Kiang, Eran Bendavid, Sam Heft-Neal, Marshall Burke, Alexander H. Thieme, Tarik Benmarhnia

**Summary:** In the US between 2000 and 2011, over half of the gap in mortality between Black and non-Hispanic White adults can be explained by the fact that Black adults are, on average, more exposed and more susceptible to air pollution than non-Hispanic White adults.

**Abstract:** There are large differences in premature mortality in the USA by race/ethnicity, education, rurality and social vulnerability index groups. Using existing concentration–response functions, published particulate matter (PM2.5) air pollution estimates, population estimates at the census tract level and county-level mortality data from the US National Vital Statistics System, we estimated the degree to which these mortality discrepancies can be attributed to differences in exposure and susceptibility to PM2.5. We show that differences in PM2.5-attributable mortality were consistently more pronounced by race/ethnicity than by education, rurality or social vulnerability index, with the Black American population having the highest proportion of deaths attributable to PM2.5 in all years from 1990 to 2016. Our model estimates that over half of the difference in age-adjusted all-cause mortality between the Black American and non-Hispanic white population was attributable to PM2.5 in the years 2000 to 2011. This difference decreased only marginally between 2000 and 2015, from 53.4% (95% confidence interval 51.2–55.9%) to 49.9% (95% confidence interval 47.8–52.2%), respectively. Our findings underscore the need for targeted air quality interventions to address environmental health disparities.

**Links:**
- Publication: https://www.nature.com/articles/s41591-024-03117-0
- Code: https://github.com/FridljDa/pm25_inequality
- Dataset: https://zenodo.org/records/10038691

## Contact Information

- **Email:** daniel.fridljand@gmail.com
- **Google Scholar:** https://scholar.google.com/citations?user=SIoMbdMAAAAJ
- **GitHub:** https://github.com/FridljDa
- **LinkedIn:** https://www.linkedin.com/in/daniel-fridljand-8707a2208/
- **Resume PDF:** Available for download on the website

