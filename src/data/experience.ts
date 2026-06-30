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
    description: `* **Secure Desktop AI Agent (Jun 2026 – present)**: Core developer on a privacy-first desktop AI agent application combining a Tauri/React frontend with a Rust backend; full-stack contributions across a Bun/Rust monorepo covering the desktop UI, agent runtime, and secure auditable LLM tool execution.
* **LLM-Powered Document Validation System (May–Jun 2026)**: Core developer in a 3-person team for a production-grade automated proposal review service, co-developing complex .docx document processing with automated comment insertion.
* **AI-Powered Email to Order Parsing (Apr–May 2026)**: Designed a field-centric email-processing pipeline with FastAPI ingestion and Streamlit review dashboard; attachment-aware LLM processing with multimodal fallbacks for scanned PDFs, plus parallel candidate-resolution combining sender lookup, text extraction, and external address search.
* **AI Customer Support Automation (Dec 2025 – Apr 2026, live in production)**: Sole AI engineer end-to-end on a cinema-ticketing SaaS — **770+ live B2C tickets** processed with **86.6% strict / 88.9% content-supported approval**; daily volume scaled 5x post-CEO showcase; 13+ feature improvements driven from live reviewer feedback.
* Architected a hybrid deterministic + agentic workflow over 19 customer-intent categories using Temporal for durable orchestration, with human-in-the-loop approval via Signals and DSPy/GEPA prompt optimization.
* Built a production evaluation suite (Langfuse: 6 evaluation types, 8 score metrics, 14-label outcome taxonomy) and a reproducible 22-stage Snakemake data pipeline with Microsoft Presidio PII detection for GDPR-compliant training data.
* **Tech Stack**: Python, FastAPI, Streamlit, PydanticAI, Temporal, Langfuse, Snakemake, Docker, DSPy, MCP, Tauri, React, Rust.`,
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
* Shipped a [JFrog Artifactory](https://jfrog.com/artifactory/) proxy in 3 days that reduced a recurring CI pipeline runtime from 8 hours to 30 seconds, saving developers ~1–2 hours per week each.
* Established DevSecOps governance: integrated [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) scans into CI, built Grafana dashboards for CVE monitoring, and migrated internal services from SOAP to REST with Keycloak.`,
  },
  {
    title: 'Research Data Analyst - Computational Oncology',
    company: 'ETH Zürich',
    companyUrl: 'https://bsse.ethz.ch/',
    companyLogo: 'ETH_Logo.svg',
    location: 'Basel, Switzerland',
    dateStart: '2024-02-01',
    dateEnd: '2024-09-30',
    description: `* Developed novel Bayesian non-parametric methods (Hierarchical Dirichlet Process) for estimating mutational signatures in cancer genomes, extended to incorporate phylogenetic tree structures.
* Analyzed single-cell whole-exome sequencing data from the Tumor Profiler Study (187 cells, 10 melanoma tumors), identifying eight latent mutational signatures.
* Implemented hierarchical dependency structures in R such that signature distributions for child phylogenetic nodes are drawn from parent distributions, enforcing biological inheritance patterns.`,
  },
  {
    title: 'Research Data Analyst - Environmental Epidemiology',
    company: 'Stanford University School of Medicine',
    companyUrl: 'https://www.stanford.edu/',
    companyLogo: 'Stanford_Cardinal_logo.svg',
    location: 'Palo Alto, USA',
    dateStart: '2023-07-01',
    dateEnd: '2023-12-31',
    description: `* **Nature Medicine Publication (2024)**: Led the statistical analysis as first co-author, quantifying air pollution's contribution to racial and socioeconomic mortality disparities in the US — [published in Nature Medicine](https://www.nature.com/articles/s41591-024-03117-0).
* Engineered a big-data pipeline harmonizing 63+ million death records, satellite pollution estimates, and census demographics across 3,000+ US counties (1990–2016).
* Implemented confounder-adjusted causal inference (DAGs, propensity scoring, multivariate regression), revealing >50% of the Black–White all-cause mortality difference is attributable to environmental factors.
* Built and shipped an R Shiny analytical web application used directly by epidemiologists and policy researchers to explore 17-dimensional data and detect outliers.`,
  },
  {
    title: 'Exchange Scholar',
    company: 'Yale University',
    companyUrl: 'https://www.yale.edu/',
    companyLogo: 'Yale_University_Shield_1.svg',
    location: 'New Haven, USA',
    dateStart: '2022-08-01',
    dateEnd: '2023-05-31',
    description: `* Selected as one of two university-wide representatives for the year-long exchange program from the University of Heidelberg.
* Grade: Honors (highest academic distinction at Yale); DAAD Stipend for academic excellence.
* Coursework: Deep Learning, Geometric & Topological Methods in Machine Learning (Prof. Smita Krishnaswamy), Differentiable Manifolds, Statistical Methods in Human Genetics.`,
  },
  {
    title: 'Research Data Analyst - Statistical Genomics (Master\'s Thesis)',
    company: 'European Molecular Biology Laboratory',
    companyUrl: 'https://www.embl.org/',
    companyLogo: 'European_Molecular_Biology_Laboratory_Logo.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2021-10-01',
    dateEnd: '2022-05-31',
    description: `* Developed **IHW-Forest**, a novel multiple-testing method using Random Forests for hypothesis weighting, increasing discovery power by >30% on a benchmark of 16 billion genetic association tests.
* Optimized core splitting and weighting logic in C++ via Rcpp for high-performance processing of large-scale genomic data.
* Presented at seven scientific events including Yale University and a competitively selected oral contribution at DAGStat 2022.`,
  },
  {
    title: 'M.Sc. in Mathematics',
    company: 'University of Heidelberg',
    companyUrl: 'https://www.uni-heidelberg.de/en',
    companyLogo: 'Logo_University_of_Heidelberg.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2020-10-01',
    dateEnd: '2023-05-31',
    description: `* Grade: 1.0 (summa cum laude, highest distinction).
* Master's Thesis: "Better multiple Testing: Using multivariate co-data for hypothesis weighting", conducted at EMBL.
* Awards: Gerhard C. Starck Foundation Stipend, Baden-Württemberg Stipend.`,
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
    title: 'B.Sc. in Mathematics',
    company: 'University of Heidelberg',
    companyUrl: 'https://www.uni-heidelberg.de/en',
    companyLogo: 'Logo_University_of_Heidelberg.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2017-10-01',
    dateEnd: '2020-09-30',
    description: `* Grade: 1.4 (top 10% of cohort).
* Bachelor's Thesis: "Online estimation of the geometric median in a Hilbert space".`,
  },
];
