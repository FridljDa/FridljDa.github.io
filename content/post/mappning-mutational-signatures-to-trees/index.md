---
created: 2024-08-22T10:54
updated: 2024-09-19T13:36
share_link: https://share.note.sx/k79axvpd#vcB8TNWwNkt+qQJ42Lujx8bYcVBG8iqyZs2LPljiUAE
share_updated: 2024-09-18T07:57:46+02:00
---

# Proposed Model: Mutational signature estimation with HDP and trees

## Motivation of proposed model

With the advent of high-resolution techniques such as single-cell sequencing, there is now an opportunity to model the varying activities of mutational signatures within a tumor. In the following, a subclone is a set of tumor cells descending from the same ancestor and hence sharing mutations. In particular, a subclone can consist of a single cell. For many measurement modalities, there are methods available to infer relationships between subclones, often represented as a tree structure. Examples of such tree-based methods include:

- SNV: SCITE [@jahnTreeInferenceSinglecell2016] Onconem [@rossOncoNEMInferringTumor2016] 
- CN: SCICoNE [@kuipersSinglecellCopyNumber2020]  
- SNV+CN: COMPASS [@sollierCOMPASSJointCopy2023]
- CN+RNA: SCATrEx [@ferreiraMappingSinglecellTranscriptomes]
- SCI Phi [@singerSinglecellMutationIdentification2018]
- SIEVE [@kangSIEVEJointInference2022]

For our purposes, we expect that it should be irrelevant if it is a mutational event tree or a phylogenetic tree. Depending on the type of mutational event under consideration and the available data, we can use any of these methods to infer relationships.

Consider the following example tree, where edges represent evolutionary relatedness:

![[tree.png|300]]

Note, that we have varying number of cells per node. In particular, we can have 0 cells attached to a node of the tree. Let's drop the number of cells per node and enumerate the nodes: 

![[LateX/202409_Graphs/20240906_basic_tree_colored.png|500]]


Let $\mathcal{T}$ represent the topology of the tree. Without loss of generality, we assume a single tree for our input data. If multiple trees exist, such as when separate trees are constructed for different tumors, we can combine them by introducing a new root node and connecting the root nodes of the individual trees to this new root. 

This tree consists of nodes $V(\mathcal{T})=\{$ $\color{#BEBEBE} v_1,$ $\color{#BB6438} v_2,$ $\color{#B25870} v_3,$ $\color{#7630A9} v_4,$ $\color{#6672C9} v_5$ $\}$. Each node can represent a subclone or not be assigned a subclone but instead serve as connecting node. For each node $v_j$ we observe trinucleotide mutations $x_{j,1},\ldots, x_{j,M_j}\in \{1,\ldots,96\}$. Note, that $M_j=0$ is allowed. Let $e_{\cdot j}\in \Delta^{\infty}$ denote the activity catalogue in node $j$.   

Biologically, we expect that subclones which have a closer evolutionary history have more similar mutational signature activity. Let $d$ be a measure of dissimilarity on $\Delta^{\infty}$. In the above example we expect that  $d($ $\color{#7630A9} e_{\cdot 4}$ $,$ $\color{#6672C9} e_{\cdot 5}$ $)\leq d($ $\color{#BB6438} e_{\cdot 2}$ $,$  $\color{#6672C9} e_{\cdot 5}$ $)$. When we have access to tree topology $\mathcal{T}$, we can incorporate $\mathcal{T}$ into our model as prior knowledge when inferring $\hat{z}_{ji}$ and consequently $\hat{\theta}_k$ and $\hat{e}_{kj}$.     

## Graphical model of proposed model 
Sticking to the color coding from above, the graphical model of the proposed model looks as follows:  

![[LateX/202409_Graphs/20240502_hdp_mutationalsignature_graphicalmodel_tree_colored.png|500]]

Each variable $G$ is a Dirichlet Process. For simplicity, we have omitted the scaling parameters $\alpha_j$ for each Dirichlet process from the graph. In this example, we observe trinucleoteide mutations in nodes $v_2, v_4, v_5$ but not in $v_1, v_3$. Recall from the mathematical properties of the Dirichlet Process that $G_4$ and $G_5$ vary around $G_3$. Similarly, $G_2$ and $G_3$ vary around $G_1$. Hence, we can expect that the distribution of  $G_5$ is more similar to $G_4$ than to $G_2$. Hence, we can expect that $\color{#6672C9} e_{\cdot 5}$  is more similar to $\color{#7630A9} e_{\cdot 4}$ than to $\color{#BB6438} e_{\cdot 2}$. This addresses the motivation for the proposed model.

In the above example, $G_2$ is the base probability distribution of $G_1$. Therefore, the support of $G_2$ is a subset of the support of $G_1$, i.e., $\operatorname{supp}(G_2) \subset \operatorname{supp}(G_1) = {\tilde{\theta}_1^{G_1}, \tilde{\theta}_2^{G_1}, \dots}$. A major shift in signature activity from node $v_1$ to $v_2$ could present a challenge for the model. It would be valuable to investigate whether such a shift is biologically plausible and, if so, to test the model in that scenario.

## Generating process of proposed model 

The sampling of $G_0$, $\theta_{j i}$, and $x_{ji}$ works exactly as in the classical HDP model, namely 
$$
\begin{aligned}
G_0 &\sim \mathrm{DP}(\alpha_0, H),\\ 
 \theta_{j i} \mid G_j &\sim G_j \text{ for } i = 1,2,\ldots M_j,  \\
x_{ji} \mid \theta_{j i} & \sim \operatorname{Categorical} \left(\theta_{j i}\right) .
\end{aligned}
$$

The key difference is in the sampling of $G_j$. Consider a tree topology $\mathcal{T}$. We write $(v_i,v_s)\in \mathcal{T}$ if and only if the $i$-th node is a child of the $s$-th node. Then we model the Dirichlet Process at each node $v_j$ of the tree  $\mathcal{T}$ as 

$$
\begin{aligned}
G_j \mid G_s &\sim \mathrm{DP}(\alpha_j, G_s) \text{ for } (v_i,v_s)\in \mathcal{T}.
\end{aligned}
$$

In words, at each node of the tree we draw $G_j$ from  a Dirichlet Process with an individual scaling parameter $\alpha_j$ and the base probability distribution $G_s$ from the parent node. By the mathematical properties of the Dirichlet Process $G_j$ is varying around the probability distribution $G_s$ of its parent node. Hence, distribution properties of $G_s$ get propagated to $G_j$ and further down the tree.     

## Anticipated challenges
There are several challenges anticipated in making the proposed model practical. The first set of challenges relates to the input data requirements. To construct a tree of relatedness, we need sequencing at a subtumor level, such as sequencing at single-cell or subclonal level. The tumor sample must contain a sufficient number of trinucleotide mutations, typically seen in late-stage tumors. To be able to measure a sufficient number of the trinucleotide mutations,  sequencing must cover a large enough genomic region. 


# Further possible steps

## Implementation 

The current implemented prototype is a fork of the [HDP implementation by Nicola Roberts](https://github.com/nicolaroberts/hdp) in R with some hecky helper functions. As a next step, an implementation of the package in Python would be interesting.  


## Benchmark method
Pick a dataset suitable for the proposed method. Construct a relatedness tree $\mathcal{T}$ for the data set. Estimate the mutational signatures $\Theta^{\text{NMF}}$ and $E^{\text{NMF}}$ using the classical NMF approach and $\Theta^{\text{Tree-HDP}}$ and $E^{\text{Tree-HDP}}$ using the proposed method. In practise, we will have finite numbers of mutational signatures $K^{\text{NMF}}$ and $K^{\text{Tree-HDP}}$ in each a approach. Choose a family of dissimilarity measures $(d_k)_{k\in \mathbb{N}}$ on  $(\Delta_k)_{k\in \mathbb{N}}$. Calculate $d^{\text{NMF}}_{i,j}=d\left(E_{\cdot i}^{\text{NMF}},E_{\cdot j}^{\text{NMF}}\right)$ and $d^{\text{Tree-HDP}}_{i,j}=d\left(E_{\cdot i}^{\text{Tree-HDP}},E_{\cdot j}^{\text{Tree-HDP}}\right)$. Compare how well $D^{\text{NMF}}$ and $D^{\text{Tree-HDP}}$ map to the a relatedness tree $\mathcal{T}$. 

## Alternative Ansatz 
The goal of the proposed model is to ensure that subclones which have a closer mutation history have more similar mutational signature activity. Instead of going for the Hierarchical Dirichlet Process Ansatz, we could utilise variations of the Non-negative Matrix Factorisation approach. Given observed mutation catalogue $X$ and a constructed tree topology   $\mathcal{T}$, we introduce a penalisation term $R_{\mathcal{T}}(E)$ to ensure that the tree topology $\mathcal{T}$ is respected. With the regularisation parameter $\lambda$ our optimisation problem becomes 

$$
\min _{S, E \geq 0} D(X, S E)+\lambda R_{\mathcal{T}}(E).
$$

A desirable property of the function $R_{\mathcal{T}}$ would be that for samples $i,j\in \{1,...,l \}$ attached to nodes in the graph $\mathcal{T}$ which are close to each other, we have similar $E_{\cdot i}$ and $E_{\cdot j}$. 

Or we could use some sort of hierarchical NMF. There is abundant literature on NMF and its variations. We recommend having a look at [@sugaharaHierarchicalMatrixFactorization2024], [@dingPopulationBasedHierarchicalNonnegative2022], [@ferreiraDeepExponentialFamilies2022], [@schmidtRegressionBasedApproach2024].

## Conditioning on existing signature libraries 
We have observed in when we compared our results to the COSMIC dataset that there is little similarity between the COSMIC database mutational signatures and the ones estimated by our model. A possible explanation is the limited sample size of our input dataset. We could include established mutational signatures as prior knowledge in our HDP model. An approach to achieve this is described in section 4.2.3 of [@robertsPatternsSomaticGenome].

## Other mutational events
Instead of focusing on trinucleotide mutational events, we could study other mutational events with the proposed model. For example, we could study chromosomal instability events. An approach to quantify chromosomal instability is described in [@drewsPancancerCompendiumChromosomal2022]. However, this would introduce additional requirements to the input data. For example, we would need high read depth. Such data sets do not exist yet.

<details>
<summary>
Recommended material for chromosomal instability event
</summary>
- https://markowetz.cruk.cam.ac.uk/cincompendium/ 
- https://github.com/markowetzlab/CINSignatureQuantification
	- calculateFeatures function
	- R package to quantify signatures of chromosomal instability on absolute copy number profiles as described in [@drewsPancancerCompendiumChromosomal2022] 
</details>

## Compare to existing literature
It would beneficial to explore how the proposed approach compares to existing literature, such as [@alamTreeStructuredHierarchicalDirichlet2019].