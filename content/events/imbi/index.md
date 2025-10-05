---
title: Workshop on adaptive designs and multiple testing procedures

event: Workshop on adaptive designs and multiple testing procedures
event_url: https://www.klinikum.uni-heidelberg.de/medizinische-biometrie/veranstaltungen/workshop-adaptive-designs-and-multiple-testing-procedures

location: Institute of Medical Biometry, Heidelberg
#address:
 # street: 450 Serra Mall
 # city: Stanford
 # region: CA
 # postcode: '94305'
 # country: United States

summary:

abstract: "Consider a multiple testing task, where for each test we have access to its p-value and additional information represented by a uni- or multivariate covariate. The covariates may contain information on prior probabilities of null and alternative hypotheses and/or on the test’s power. As per several recent proposals, the independent hypothesis weighting (IHW, Ignatiadis and Huber, 2021) framework capitalizes on these covariates for the multiple testing procedure. IHW partitions the covariate space into a finite number of bins and learns weights, used to prioritize each bin a-priori based on the covariate. IHW guarantees false discovery rate control (FDR), while increasing the proportion of correct discoveries (power) compared to unweighted methods such as the Benjamini-Hochberg procedure (BH).

(Ignatiadis and Huber, 2021) use per-covariate quantiles for the partition. Limitations of this are, that the number of quantile combinations explode with multiple covariates and the bins have fixed side length. Here we propose a random forest-based approach (IHW-Forest), where the leaves of the trees form a partition for the covariates. The objective function is chosen such that the splits are sensitive to the prior probability of a hypothesis being true. IHW-Forest scales well to high-dimensional covariates and can detect small regions with signal. IHW-Forest can deal with heterogeneous covariates and ignore uninformative covariates. Latter is useful in practice, when the user does not know which covariates are relevant for the hypotheses under study. This extends the application of IHW by automatic selection of the most relevant covariate. Lastly, IHW-Forest takes advantage of the p-values to construct the partition, yielding homogeneous bins and hence increases power.

We demonstrate IHW-forest’s benefits in simulations and in a bioinformatic application.
IHWs power vanishes with increasing number of covariate dimensions, while IHW-Forest's power remains stable and well above BH and IHW. With the signal concentrated in a shrinking region, IHW-Forest outperforms BH, IHW and other competing methods in power. We apply IHW-Forest to a hQTL analysis, which looks for associations between genetic variation and histone modifications on the human chromosomes. This resulted in 16 billion tests on the first two chromosomes. We used 16 different covariates, among them the genomic distance and his-tone modifications. Due to an exponential increase of the number of per-covariate quantiles with the number of covariates, IHW is not applicable anymore. The updated package will be available from Bioconductor http://www.bioconductor.org/packages/IHW in release 3.15."

# Talk start and end times.
#   End time can optionally be hidden by prefixing the line with `#`.
date: '2022-06-29T13:00:00Z'  
#date_end: '2030-06-01T15:00:00Z'
all_day: true

# Schedule page publish date (NOT talk date).
publishDate: '2017-01-01T00:00:00Z'

authors: []
tags: []

# Is this a featured talk? (true/false)
featured: false

#image:
 # caption: 'Image credit: [**Unsplash**](https://unsplash.com/photos/bzdhc5b3Bxs)'
  #focal_point: Right

#links:
#- icon: twitter
#  icon_pack: fab
#  name: Follow
#  url: https://twitter.com/georgecushen
#url_code: ""
#url_pdf: ""
#url_slides: ""
#url_video: ""

# Markdown Slides (optional).
#   Associate this talk with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
#slides: example

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
#projects:
#- example
---
