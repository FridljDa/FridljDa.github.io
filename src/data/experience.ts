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
    title: 'AI Engineer - Software Consultant',
    company: 'TNG Technology Consulting',
    companyUrl: 'https://www.tngtech.com/en/',
    companyLogo: 'tng_logo.svg',
    location: 'Munich, Germany',
    dateStart: '2025-12-01',
    description: `* **Industrial Process Intelligence (Aug 2026 – present)**: Sole engineer on a scrap-rate prediction proof of concept for an industrial manufacturer. Benchmarked ~40 model and feature combinations under time-ordered cross-validation; order attributes fixed at booking predicted scrap as well as the full sensor set, making raw-material batch tracking the top data request to the client, ahead of new sensors.
* **Retail Cashier-Fraud Detection (Jul 2026 – present)**: Scaled unsupervised point-of-sale anomaly scoring from a 7-store sample to a retail client's full estate by moving aggregation into SQL Server (~29.8M receipts to ~203K cashier-day rows), ranking cashiers comparably to the incumbent rule system without per-customer rule configuration.
* **Sandboxed Agent Platform (Jun 2026 – present)**: One of three developers on a self-hosted platform (Tauri/React, Rust) that lets non-technical colleagues run agentic workflows on sensitive local files. It cleared a 15-person adversarial red team, unlocking expansion from a 10-user pilot to a full department.
* **Document Validation and Email-to-Order Parsing (Apr – Jun 2026)**: Co-developed an LLM offer-review service on Kubernetes that inserts review comments directly into uploaded .docx offers, and designed an email-to-order pipeline (FastAPI, Streamlit review) with multimodal attachment handling.
* **Customer Support Automation (Dec 2025 – Apr 2026, live in production)**: Sole AI engineer from discovery to live rollout at a cinema-ticketing SaaS. A hybrid deterministic/agentic workflow on Temporal drafts each resolution for staff review before customer contact: 811 tickets in its first three months at 86.6% reviewer approval.`,
  },
  {
    title: 'Platform Engineer - Software Consultant',
    company: 'TNG Technology Consulting',
    companyUrl: 'https://www.tngtech.com/en/',
    companyLogo: 'tng_logo.svg',
    location: 'Munich, Germany',
    dateStart: '2024-12-01',
    dateEnd: '2025-12-01',
    description: `* Contributed to modernizing a supply-chain application from Java 8 to 17 and JBoss to WildFly, and migrated an internal virus-scanning service from SOAP to REST with Keycloak authentication.
* Deployed a JFrog Artifactory proxy in 3 days after it had been scoped as a multi-month migration, cutting a recurring CI step from 8 hours to 30 seconds and saving each developer ~1–2 hours a week.
* Built the CVE dashboards (OWASP scans in Jenkins, Prometheus, Grafana) that lead developers used to show modernization progress to management.
* Became the team's reference point for AI tooling: ran a coding-assistant workshop for 20 colleagues and wrote three editions of TNG's firm-wide AI Tool of the Week, which led to my move into AI engineering.`,
  },
  {
    title: 'Research Data Analyst - Computational Oncology',
    company: 'ETH Zürich',
    companyUrl: 'https://bsse.ethz.ch/',
    companyLogo: 'ETH_Logo.svg',
    location: 'Basel, Switzerland',
    dateStart: '2024-02-01',
    dateEnd: '2024-09-30',
    description: `* Extended a Bayesian non-parametric model (Hierarchical Dirichlet Process) with phylogenetic tree structure in R, so each subclone's signature distribution is drawn from its parent's.
* Applied it to whole-exome data from 187 cells across 10 melanoma tumors in the Tumor Profiler Study, identifying eight latent mutational signatures.
* Showed that reference signatures derived from bulk sequencing do not transfer to sparse single-cell data without informative priors.`,
  },
  {
    title: 'Research Data Analyst - Environmental Epidemiology',
    company: 'Stanford University School of Medicine',
    companyUrl: 'https://www.stanford.edu/',
    companyLogo: 'Stanford_Cardinal_logo.svg',
    location: 'Palo Alto, USA',
    dateStart: '2023-07-01',
    dateEnd: '2023-12-31',
    description: `* Led the statistical analysis as co-first author of a [*Nature Medicine* paper](https://www.nature.com/articles/s41591-024-03117-0) (2024), cited 66 times: over half the Black–White age-adjusted mortality gap in the US is attributable to air pollution.
* Engineered a [reproducible pipeline](https://github.com/FridljDa/pm25_inequality) harmonizing 63M+ death records with satellite pollution estimates and census demographics across 3,000+ US counties and 27 years (1990–2016).
* Built and open-sourced an R Shiny application that lets readers explore the published estimates without writing code.`,
  },
  {
    title: 'Exchange Scholar',
    company: 'Yale University',
    companyUrl: 'https://www.yale.edu/',
    companyLogo: 'Yale_University_Shield_1.svg',
    location: 'New Haven, USA',
    dateStart: '2022-08-01',
    dateEnd: '2023-05-31',
    description: `* Selected as one of two university-wide representatives from Heidelberg for the year-long exchange; DAAD stipend.
* Grade: Honors (full marks).
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
    description: `* Developed **IHW-Forest**, a multiple-testing method using random forests for hypothesis weighting, yielding >30% more discoveries than standard corrections on 16 billion genetic association tests.
* Optimized the core splitting and weighting logic in C++ via Rcpp.
* Presented in seminars at Yale and UNC Chapel Hill and in a competitively selected talk at DAGStat 2022; peer-reviewed for Bioinformatics Advances and Cell Biology.`,
  },
  {
    title: 'M.Sc. in Mathematics',
    company: 'University of Heidelberg',
    companyUrl: 'https://www.uni-heidelberg.de/en',
    companyLogo: 'Logo_University_of_Heidelberg.svg',
    location: 'Heidelberg, Germany',
    dateStart: '2020-10-01',
    dateEnd: '2023-05-31',
    description: `* Grade: 1.0 (full marks).
* Master's thesis: 'Better multiple Testing: Using multivariate co-data for hypothesis weighting', conducted at EMBL.
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
* Bachelor's thesis: 'Online estimation of the geometric median in a Hilbert space'.`,
  },
];
