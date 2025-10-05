---
# Documentation: https://wowchemy.com/docs/managing-content/

title: "German Region of the International Biometric Society"
event: German Region of the International Biometric Society
event_url: http://www.biometrische-gesellschaft.de/fileadmin/AG_Daten/Nachwuchs/PDFs/YS_Lecture_Series_2022-06-01_Flyer.pdf
location: virtual presentation
address:
  street:
  city:
  region:
  postcode:
  country:
summary: "Young Statisticians Lecture Series: Modern Statistical Methods for Life Sciences"
abstract: "Consider a multiple testing task, where for each test we have access to its p-value and additional information represented by a uni- or multivariate covariate. The covariates may contain information on prior probabilities of null and alternative hypotheses and/or on the test’s power. As per several recent proposals, the independent hypothesis weighting (IHW, Ignatiadis and Huber, 2021) framework capitalizes on these covariates for the multiple testing procedure. IHW partitions the covariate space into a finite number of bins and learns weights, used to prioritize each bin a-priori based on the covariate. IHW guarantees false discovery rate control (FDR), while increasing the proportion of correct discoveries (power) compared to unweighted methods such as the Benjamini-Hochberg procedure (BH).

(Ignatiadis and Huber, 2021) use per-covariate quantiles for the partition. Limitations of this are, that the number of quantile combinations explode with multiple covariates and the bins have fixed side length. Here we propose a random forest-based approach (IHW-Forest), where the leaves of the trees form a partition for the covariates. The objective function is chosen such that the splits are sensitive to the prior probability of a hypothesis being true. IHW-Forest scales well to high-dimensional covariates and can detect small regions with signal. IHW-Forest can deal with heterogeneous covariates and ignore uninformative covariates. Latter is useful in practice, when the user does not know which covariates are relevant for the hypotheses under study. This extends the application of IHW by automatic selection of the most relevant covariate. Lastly, IHW-Forest takes advantage of the p-values to construct the partition, yielding homogeneous bins and hence increases power.

We demonstrate IHW-forest’s benefits in simulations and in a bioinformatic application.
IHWs power vanishes with increasing number of covariate dimensions, while IHW-Forest's power remains stable and well above BH and IHW. With the signal concentrated in a shrinking region, IHW-Forest outperforms BH, IHW and other competing methods in power. We apply IHW-Forest to a hQTL analysis, which looks for associations between genetic variation and histone modifications on the human chromosomes. This resulted in 16 billion tests on the first two chromosomes. We used 16 different covariates, among them the genomic distance and his-tone modifications. Due to an exponential increase of the number of per-covariate quantiles with the number of covariates, IHW is not applicable anymore. The updated package will be available from Bioconductor http://www.bioconductor.org/packages/IHW in release 3.15."

# Talk start and end times.
#   End time can optionally be hidden by prefixing the line with `#`.
date: 2022-06-01T15:07:03+02:00
#date_end: 2022-05-21T15:07:03+02:00
all_day: true

# Schedule page publish date (NOT event date).
publishDate: 2022-05-21T15:07:03+02:00

authors: []
tags: []

# Is this a featured event? (true/false)
featured: false

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Focal points: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight.
image:
  caption: ""
  focal_point: ""
  preview_only: false

# Custom links (optional).
#   Uncomment and edit lines below to show custom links.
# links:
# - name: Follow
#   url: https://twitter.com
#   icon_pack: fab
#   icon: twitter

# Optional filename of your slides within your event's folder or a URL.
url_slides:

url_code:
url_pdf:
url_video:

# Markdown Slides (optional).
#   Associate this event with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
slides: ""

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
---
