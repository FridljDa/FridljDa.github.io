export interface ExperienceItem {
  title: string;
  company: string;
  companyUrl: string;
  companyLogo: string;
  location: string;
  dateStart: string;
  dateEnd?: string;
  description: string;
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    title: 'Software Consultant - Applied AI',
    company: 'TNG Technology Consulting',
    companyUrl: 'https://www.tngtech.com/en/',
    companyLogo: 'tng_logo.svg',
    location: 'Munich, Germany',
    dateStart: '2025-12-01',
    description: `* **AI-Powered Email to Order Parsing (May 2026 – present)**: Designing a field-centric email-processing pipeline that resolves customer, site, and service-order data from inbound emails, attachments, and external business-system context before order creation. Built a FastAPI ingestion service and Streamlit review dashboard with ranked candidate values and human-in-the-loop overrides for ambiguous cases. Integrated attachment-aware LLM processing with multimodal fallbacks — text extraction from structured files, vision-capable paths for scanned PDFs and images, and runtime service-catalog classification.
* **AI Customer Support Automation (Dec 2025 – Apr 2026, live in production)**: Sole AI engineer owning end-to-end delivery for a cinema-ticketing SaaS enterprise customer — from discovery and architecture through live production rollout in April 2026.
* <details><summary>Production results and architecture</summary>
  <ul>
  <li><b>Live in production:</b> 175 unique B2C support tickets processed during a two-week live observation window, reviewed by 9 customer-side support staff and the TNG implementation lead. <b>Approval rate 72.9% strict / 81.3% content-supported</b> on model-relevant tickets (n=144); <b>79.6% / 88.6%</b> when the decisive context is fully accessible to the system.</li>
  <li><b>Customer-trust signals:</b> daily ticket volume scaled 5x (4–7 → 14–36 tickets/workday) following an internal CEO showcase, with approval mix stable across the volume increase; operator-error rate fell from ~25% to under 10% as staff converged on correct tool usage.</li>
  <li><b>Architecture:</b> hybrid deterministic + agentic resolution workflow over 19 customer-intent categories, with Temporal for durable orchestration, human-in-the-loop approval via Signals, and DSPy/GEPA prompt optimization. Independently designed 20+ REST endpoints (OpenAPI 3.1) following Hexagonal Architecture.</li>
  <li><b>Evaluation infrastructure:</b> production evaluation suite in Langfuse — 6 evaluation types, 8 score metrics, a 14-label outcome taxonomy, and LLM-as-judge semantic evaluation — driving 13+ feature improvements directly from live reviewer feedback.</li>
  <li><b>Data engineering:</b> reproducible 22-stage Snakemake pipeline (Microsoft Presidio PII detection, balanced sampling, automated LLM labeling) with separate censored/uncensored data paths for GDPR compliance.</li>
  <li><b>Stakeholder engagement:</b> embedded on-site with weekly working sessions with the head of support and monthly executive reviews with the parent holding's CEO.</li>
  </ul>
  </details>
* **Tech Stack**: Python, FastAPI, Streamlit, PydanticAI, Temporal, Langfuse, Snakemake, Microsoft Presidio, Docker, DSPy (with GEPA), MCP.`,
  },
  {
    title: 'Software Consultant - Enterprise Modernization',
    company: 'TNG Technology Consulting',
    companyUrl: 'https://www.tngtech.com/en/',
    companyLogo: 'tng_logo.svg',
    location: 'Munich, Germany',
    dateStart: '2024-12-01',
    dateEnd: '2025-12-01',
    description: `* Member of the platform team modernizing a mission-critical global supply-chain application (Java 8 → 17, JBoss → WildFly) in a multi-year transformation program.
* Shipped a [JFrog Artifactory](https://jfrog.com/artifactory/) proxy in 3 days after the work had been repeatedly postponed due to overestimated effort — reduced a recurring CI pipeline runtime from 8 hours to 30 seconds and continues to save developers ~1–2 hours per person per week.
* Established DevSecOps governance: integrated [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) into the Jenkins CI pipeline and built Grafana dashboards for CVE monitoring, enabling proactive risk visibility for stakeholders.
* Migrated an internal virus-scanning service from SOAP to REST with Keycloak authentication; architected fully containerized dev/build environments using Docker and Podman (daemonless, rootless).
* Selected for Program Increment (PI) planning sessions in a multinational distributed Scrum team under SAFe, contributing to strategic planning and cross-team coordination.
* Co-organized the internal "AI Tool of the Week" blog series, providing weekly summaries of AI advancements including agentic workflows, AI-assisted coding, and multi-modal processing tools.
* **Tech Stack**: TypeScript, React, Java 17, Spring Framework, JBoss/WildFly, Oracle DB, Gradle, JUnit, Docker, Podman, Jenkins, SonarQube, JFrog Artifactory, Prometheus, Grafana.`,
  },
  {
    title: 'Research Assistant',
    company: 'ETH Zürich',
    companyUrl: 'https://applied.math.yale.edu/',
    companyLogo: 'ETH_Logo.svg',
    location: 'Basel, Switzerland',
    dateStart: '2024-02-01',
    dateEnd: '2024-09-30',
    description: `* Researching statistical methods for mutational patterns estimation with tree structures in the lab of [Niko Beerenwinkel](https://bsse.ethz.ch/cbg/group.html) with focus on data from the [Tumor Profiler](https://eth-nexus.github.io/tu-pro_website/).
* Lecture on Statistical Models in Computational Biology covering hidden Markov models, EM algorithm, Variational inference.
* I developed a novel Bayesian model using Hierarchical Dirichlet Processes (HDP) to analyze mutational signatures by integrating data from evolutionary trees. The model is designed to leverage the phylogenetic relationships between cancer subclones, assuming that evolutionarily closer cells exhibit more similar mutational signature activities. This non-parametric approach learns the number of signatures directly from the data while using the tree structure as a prior to guide the estimation of signature activities. A prototype was implemented and applied to single-cell sequencing data, allowing for the simultaneous discovery of signatures and the mapping of their activities across the cellular phylogeny. My blog post can be found [here](https://danielfridljand.de/post/mutational-signature-with-hierarchical-dirichlet-process/).`,
  },
  {
    title: 'Research Assistant',
    company: 'Stanford University',
    companyUrl: 'https://www.stanford.edu/',
    companyLogo: 'Stanford_Cardinal_logo.svg',
    location: 'Palo Alto, USA',
    dateStart: '2023-07-01',
    dateEnd: '2023-11-30',
    description: `* Led the end-to-end statistical analysis for a landmark study on US health disparities, resulting in a [first-author publication in Nature Medicine](https://www.nature.com/articles/s41591-024-03117-0)
* Analyzed the role of air pollution in the race-ethnicity to premature mortality causal chain, under [Pascal Geldsetzer](https://profiles.stanford.edu/pascal-geldsetzer)'s guidance
* Spearheaded the project with minimal supervision, [implementing](https://github.com/FridljDa/pm25_inequality) comprehensive statistical analysis in R and synthesizing findings from 150 pertinent publications
* <details><summary>Key achievements and detailed contributions</summary>
  <ul>
  <li>Harmonized geospatial and tabular data on air pollution, mortality, population numbers, and orchestrated analyses of 10 different steps.</li>
  <li>Executed major revisions of the manuscript and conducted new analyses, including 15 new figures, within a strict 2-month deadline as part of the 'Revise and Resubmit' response.</li>
  <li>Developed an interactive <a href="https://github.com/FridljDa/ui_pm_attributable">Shiny web application</a> to visualize 17-dimensional data, enhancing collaboration and data interpretation among the research team.</li>
  <li>Collaborated with seven Stanford co-authors to systematically gather and integrate critical feedback throughout various project stages, driving a significant enhancement in research quality.</li>
  </ul>
  </details>`,
  },
  {
    title: 'Exchange student',
    company: 'Yale University',
    companyUrl: 'https://www.yale.edu/',
    companyLogo: 'Yale_University_Shield_1.svg',
    location: 'New Haven, USA',
    dateStart: '2022-09-01',
    dateEnd: '2023-05-30',
    description: `Chosen as one of two Master's students to represent the University of Heidelberg in a year-long study abroad program at Yale University. Hosted by the [Applied Mathematics Program](https://applied.math.yale.edu/). Advised by [Smita Krishnaswamy](https://krishnaswamylab.org/). Course work on Geometric & Topological Methods in Machine Learning, Differentiable Manifolds, Deep Learning, Statistical Methods in Human Genetics`,
  },
  {
    title: 'Research Assistant',
    company: 'European Molecular Biology Laboratory',
    companyUrl: 'https://www.embl.org/',
    companyLogo: 'European_Molecular_Biology_Laboratory_Logo.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2021-10-01',
    dateEnd: '2022-05-31',
    description: `* Developed IHW-Forest, a scalable solution to the "curse of dimensionality" that previously limited the standard [IHW method](https://bioconductor.org/packages/release/bioc/html/IHW.html) for high-dimensional datasets.
* Supervised by [Wolfgang Huber](https://www.huber.embl.de/) and [Nikos Ignatiadis](https://nignatiadis.github.io/).
* Designed an innovative stratification algorithm that automatically selects and ranks informative covariates, enhancing robustness to noisy and unknown features in real-world data.
* Led the project from inception to dissemination, presenting results at seven scientific events, including invited talks at [Yale University](https://www.yale.edu/), [University of North Carolina at Chapel Hill](https://www.unc.edu/), and a competitively selected oral presentation at [DAGStat 2022](https://www.dagstat2022.uni-hamburg.de/bilder/booklet.pdf) before 100 scholars.
* Applied IHW-Forest in a large-scale production analysis of 16 billion genetic tests, utilizing 11 covariates to boost the discovery of significant SNP-histone associations by over 30% compared to alternative methods.
* Incorporated concepts from selective inference, machine learning, and empirical Bayes.
* Served as a peer reviewer for Bioinformatics Advances and Cell Biology.`,
  },
  {
    title: 'Master Student in Mathematics',
    company: 'Heidelberg University',
    companyUrl: 'https://www.uni-heidelberg.de/en',
    companyLogo: 'Logo_University_of_Heidelberg.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2020-10-01',
    dateEnd: '2023-06-01',
    description: `* Final Grade: 1.0
* Thesis advisor: Dr. Wolfgang Huber (EMBL), Prof. Dr. Jan Johannes
* Thesis title: Better Multiple Testing: Using multivariate co-data for hypotheses
* Course work on high-dimensional statistics, Probability theory, nonparametric and parametric statistics, Algebraic Topology.`,
  },
  {
    title: 'Exchange Student',
    company: 'Hebrew University of Jerusalem',
    companyUrl: 'https://en.huji.ac.il/en',
    companyLogo: 'Hebrew_University_Logo.svg',
    location: 'Jerusalem, Israel',
    dateStart: '2019-09-01',
    dateEnd: '2020-03-12',
    description: `* Graduate-level coursework in Functional Analysis, Algebraic Combinatorics, and Quantitative Models at the Einstein Institute of Mathematics.`,
  },
  {
    title: 'Bachelor Student in Mathematics',
    company: 'Heidelberg University',
    companyUrl: 'https://www.uni-heidelberg.de/en',
    companyLogo: 'Logo_University_of_Heidelberg.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2017-10-01',
    dateEnd: '2020-09-30',
    description: `* Final grade: 1.4
* Thesis advisor: Prof. Dr. Jan Johannes
* Thesis title: Online Estimation of the Geometric Median in Hilbert Spaces
* Thesis summary: Mathematically analyzed a novel, efficient algorithm for estimating the geometric median in Hilbert spaces, proving its almost sure consistency, convergence rate, and asymptotic normality.
* Minor in Computer Science
* Coursework in Statistics, Algorithms and Data Structures, Linear Algebra, Abstract Algebra`,
  },
];

