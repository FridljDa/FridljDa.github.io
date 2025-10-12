---
title: "Extending HDP for Mutational Signatures: Incorporating Evolutionary Trees"
math: true
image: 
  placement: 2 
  caption: "Tree-structured mutational signature model"
created: 2024-08-22T10:54
date: 2024-09-20
updated: 2024-09-20
tags:
- Science
- Follow-up
---

# Extending HDP for Mutational Signatures: Incorporating Evolutionary Trees

In my [previous blog post](https://danielfridljand.de/post/mutational-signature-with-hierarchical-dirichlet-process/), I introduced the Hierarchical Dirichlet Process (HDP) as an elegant approach for mutational signature estimation. The HDP model allows us to simultaneously discover mutational signatures and estimate their activities across multiple samples while learning the number of signatures directly from the data.

However, the standard HDP approach treats each sample independently, missing a crucial biological insight: **evolutionarily related cells should exhibit more similar mutational signature activities**. In this follow-up post, I'll present an extension of the HDP model that incorporates phylogenetic tree structures to capture this evolutionary relationship.

## The Biological Motivation

With the advent of high-resolution techniques such as single-cell sequencing, we can now model the varying activities of mutational signatures within a tumor at unprecedented resolution. A key insight is that **evolutionarily related cells should have more similar mutational signature activities** than distantly related ones.

In cancer, a subclone represents a set of tumor cells descending from the same ancestor and hence sharing mutations. For many measurement modalities, there are established methods to infer relationships between subclones, often represented as tree structures. Examples include:

- SNV: [SCITE](https://doi.org/10.1186/s13059-016-0936-x) [OncoNEM](https://doi.org/10.1186/s13059-016-0929-9) 
- CN: [SCICoNE](http://biorxiv.org/lookup/doi/10.1101/2020.04.28.065755)  
- SNV+CN: [COMPASS](https://www.nature.com/articles/s41467-023-40378-8)
- [SCI Phi](https://www.nature.com/articles/s41467-018-07627-7)
- [SIEVE](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-022-02813-9)

For our purposes, the specific tree construction method is less important than having a reliable tree topology. Depending on the type of mutational event under consideration and the available data, we can use any of these methods to infer relationships.

Consider the following example tree, where edges represent evolutionary relatedness:

<figure>
<img src="media/tree.png"
 alt="300" />

</figure>

Note that we have varying numbers of cells per node. In particular, we can have 0 cells attached to a node of the tree. Let's drop the number of cells per node and enumerate the nodes: 

<figure>
<img src="media/LateX/202409_Graphs/20240906_basic_tree_colored.png"
 alt="500" />

</figure>

Let $\mathcal{T}$ represent the topology of the tree. Without loss of generality, we assume a single tree for our input data. If multiple trees exist, such as when separate trees are constructed for different tumors, we can combine them by introducing a new root node and connecting the root nodes of the individual trees to this new root. 

This tree consists of nodes $V(\mathcal{T})=\{\color{#BEBEBE} v_1, \color{#BB6438} v_2, \color{#B25870} v_3, \color{#7630A9} v_4, \color{#6672C9} v_5\}$. Each node can represent a subclone or serve as a connecting node. For each node $v_j$ we observe trinucleotide mutations $x_{j,1},\ldots, x_{j,M_j}\in \{1,\ldots,96\}$. Note that $M_j=0$ is allowed. Let $e_{\cdot j}\in \Delta^{\infty}$ denote the activity catalogue in node $j$.   

**The key biological insight**: Subclones with closer evolutionary history should have more similar mutational signature activity. Let $d$ be a measure of dissimilarity on $\Delta^{\infty}$. In the above example we expect that $d(\color{#7630A9} e_{\cdot 4}, \color{#6672C9} e_{\cdot 5}) \leq d(\color{#BB6438} e_{\cdot 2}, \color{#6672C9} e_{\cdot 5})$. When we have access to tree topology $\mathcal{T}$, we can incorporate $\mathcal{T}$ into our model as prior knowledge when inferring $\hat{z}_{ji}$ and consequently $\hat{\theta}_k$ and $\hat{e}_{kj}$.     

## The Tree-Structured HDP Model

Building on the standard HDP framework from my previous post, I now extend it to incorporate tree structure. The key modification is that instead of having all samples share a common base distribution $G_0$, we now have a hierarchical structure where each node in the tree has its own Dirichlet Process that depends on its parent.

Sticking to the color coding from above, the graphical model of the proposed model looks as follows:  

<figure>
<img src="media/LateX/202409_Graphs/20240502_hdp_mutationalsignature_graphicalmodel_tree_colored.png"
 alt="500" />

</figure>

Each variable $G$ is a Dirichlet Process. For simplicity, we have omitted the scaling parameters $\alpha_j$ for each Dirichlet process from the graph. In this example, we observe trinucleotide mutations in nodes $v_2, v_4, v_5$ but not in $v_1, v_3$. 

**The key insight**: Recall from the mathematical properties of the Dirichlet Process that $G_4$ and $G_5$ vary around $G_3$. Similarly, $G_2$ and $G_3$ vary around $G_1$. Hence, we can expect that the distribution of $G_5$ is more similar to $G_4$ than to $G_2$. This means that $\color{#6672C9} e_{\cdot 5}$ should be more similar to $\color{#7630A9} e_{\cdot 4}$ than to $\color{#BB6438} e_{\cdot 2}$, which directly addresses our biological motivation.

In the above example, $G_2$ is the base probability distribution of $G_1$. Therefore, the support of $G_2$ is a subset of the support of $G_1$, i.e., $\operatorname{supp}(G_2) \subset \operatorname{supp}(G_1) = {\tilde{\theta}_1^{G_1}, \tilde{\theta}_2^{G_1}, \dots}$. A major shift in signature activity from node $v_1$ to $v_2$ could present a challenge for the model. It would be valuable to investigate whether such a shift is biologically plausible and, if so, to test the model in that scenario.

## Mathematical Formulation

The sampling of $G_0$, $\theta_{j i}$, and $x_{ji}$ works exactly as in the classical HDP model from my previous post:

$$
\begin{aligned}
G_0 &\sim \mathrm{DP}(\alpha_0, H),\\ 
\theta_{j i} \mid G_j &\sim G_j \text{ for } i = 1,2,\ldots M_j, \\
x_{ji} \mid \theta_{j i} & \sim \operatorname{Categorical} \left(\theta_{j i}\right).
\end{aligned}
$$

**The key innovation** is in the sampling of $G_j$. Consider a tree topology $\mathcal{T}$. We write $(v_i,v_s)\in \mathcal{T}$ if and only if the $i$-th node is a child of the $s$-th node. Then we model the Dirichlet Process at each node $v_j$ of the tree $\mathcal{T}$ as:

$$
\begin{aligned}
G_j \mid G_s &\sim \mathrm{DP}(\alpha_j, G_s) \text{ for } (v_i,v_s)\in \mathcal{T}.
\end{aligned}
$$

In words, at each node of the tree we draw $G_j$ from a Dirichlet Process with an individual scaling parameter $\alpha_j$ and the base probability distribution $G_s$ from the parent node. By the mathematical properties of the Dirichlet Process, $G_j$ varies around the probability distribution $G_s$ of its parent node. Hence, distribution properties of $G_s$ get propagated to $G_j$ and further down the tree, ensuring that evolutionarily related nodes have similar mutational signature activities.     

## Challenges and Limitations

There are several challenges anticipated in making the proposed model practical. The first set of challenges relates to the input data requirements. To construct a tree of relatedness, we need sequencing at a subtumor level, such as sequencing at single-cell or subclonal level. The tumor sample must contain a sufficient number of trinucleotide mutations, typically seen in late-stage tumors. To be able to measure a sufficient number of the trinucleotide mutations, sequencing must cover a large enough genomic region.

## Next Steps and Future Directions

### Implementation 

The current implemented prototype is a fork of the [HDP implementation by Nicola Roberts](https://github.com/nicolaroberts/hdp) in R with some helper functions. As a next step, an implementation of the package in Python would be interesting to make it more accessible to the broader community.

### Benchmarking Against Standard Methods

A crucial next step is to benchmark the tree-structured HDP against standard approaches. The evaluation strategy would involve:

1. **Dataset Selection**: Choose a dataset suitable for the proposed method with available tree topology
2. **Method Comparison**: Estimate mutational signatures using:
   - Classical NMF approach: $\Theta^{\text{NMF}}$ and $E^{\text{NMF}}$
   - Tree-structured HDP: $\Theta^{\text{Tree-HDP}}$ and $E^{\text{Tree-HDP}}$
3. **Evaluation**: Compare how well the estimated signature activities $D^{\text{NMF}}$ and $D^{\text{Tree-HDP}}$ respect the known tree topology $\mathcal{T}$

### Alternative Approaches

Instead of the Hierarchical Dirichlet Process approach, we could utilize variations of Non-negative Matrix Factorization. Given observed mutation catalogue $X$ and a constructed tree topology $\mathcal{T}$, we could introduce a penalization term $R_{\mathcal{T}}(E)$ to ensure that the tree topology is respected:

$$
\min_{S, E \geq 0} D(X, S E) + \lambda R_{\mathcal{T}}(E).
$$

A desirable property of the function $R_{\mathcal{T}}$ would be that for samples $i,j\in \{1,...,l \}$ attached to nodes in the graph $\mathcal{T}$ which are close to each other, we have similar $E_{\cdot i}$ and $E_{\cdot j}$. 

Alternatively, we could explore hierarchical NMF approaches. There is abundant literature on NMF and its variations, including [Sugahara et al.](http://arxiv.org/abs/2311.13277), [Ding et al.](http://arxiv.org/abs/2209.04968), [Ferreira et al.](http://biorxiv.org/lookup/doi/10.1101/2022.10.15.512383), and [Schmidt & Raphael](http://biorxiv.org/lookup/doi/10.1101/2024.04.23.590844).

### Integration with Existing Signature Libraries

We observed that when comparing our results to the COSMIC dataset, there is little similarity between the COSMIC database mutational signatures and the ones estimated by our model. A possible explanation is the limited sample size of our input dataset. We could include established mutational signatures as prior knowledge in our HDP model, as described in section 4.2.3 of [Roberts](https://danielfridljand.de/content/post/mappning-mutational-signatures-to-trees/media/zotero_library.bib#robertsPatternsSomaticGenome).

### Extension to Other Mutational Events

Instead of focusing solely on trinucleotide mutational events, we could study other mutational events with the proposed model. For example, we could study chromosomal instability events using the approach described in [Drews et al.](https://www.nature.com/articles/s41586-022-04789-9). However, this would introduce additional requirements to the input data, such as high read depth, and such datasets are not yet widely available.

<details>
<summary>
Recommended material for chromosomal instability events
</summary>
<ul>
<li><a href="https://markowetz.cruk.cam.ac.uk/cincompendium/">https://markowetz.cruk.cam.ac.uk/cincompendium/</a></li>
<li><a href="https://github.com/markowetzlab/CINSignatureQuantification">https://github.com/markowetzlab/CINSignatureQuantification</a>
	<ul>
	<li>calculateFeatures function</li>
	<li>R package to quantify signatures of chromosomal instability on absolute copy number profiles as described in <a href="https://www.nature.com/articles/s41586-022-04789-9">Drews et al.</a></li>
	</ul>
</li>
</ul>
</details>

### Comparison with Existing Literature

It would be beneficial to explore how the proposed approach compares to existing literature, such as [Alam et al.](https://doi.org/10.1007/978-3-319-99608-0_33), to understand the theoretical and practical advantages of our tree-structured approach.

## Conclusion

This follow-up post has presented an extension of the standard HDP model for mutational signature estimation that incorporates evolutionary tree structure. By leveraging the biological insight that evolutionarily related cells should have more similar mutational signature activities, the tree-structured HDP model provides a principled way to incorporate phylogenetic information into mutational signature analysis.

The key innovation lies in the hierarchical structure where each node in the tree has its own Dirichlet Process that depends on its parent, ensuring that distribution properties propagate down the tree. This addresses a fundamental limitation of standard approaches that treat samples independently.

While there are practical challenges related to data requirements and implementation, the theoretical framework provides a solid foundation for future work in this area. The next steps involve implementation, benchmarking, and exploring alternative approaches to validate and improve upon this initial proposal.