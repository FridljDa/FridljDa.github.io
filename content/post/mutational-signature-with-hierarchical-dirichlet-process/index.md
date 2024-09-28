The Hierarchical Dirichlet Process (HDP) is a popular and elegant model that has gained traction in various fields, including cancer genomics. While researching methods for mutational signature estimation, I noticed that several studies employed HDPs for this purpose. However, many of these studies were published in biological journals and often lacked detailed explanations of how HDPs can be effectively applied to mutational signature estimation.
title: Mutational signature estimation with Hierarchical Dirichlet Process
math: true 
image: 
  placement: 2 
  caption: "Visualised mutational signature"

Nicola Roberts' [dissertation](https://doi.org/10.17863/CAM.22674) includes some descriptions of the mathematical model in the appendix, but even these are not fully comprehensive. In this blog post, I aim to bridge this gap by introducing the problem of mutational signature estimation using HDPs in a mathematically rigorous manner. I will begin by discussing a simpler mixture component model for mutational signatures, then explore the Dirichlet Process model, and finally delve into the Hierarchical Dirichlet Process model.

## Introduction

A key characteristic of cancer is the elevated mutation rate in somatic cells. Recognizing the patterns of somatic mutations in cancer is essential for understanding the underlying mechanisms that drive the disease (Fischer et al., 2013). This knowledge is crucial for advancing cancer treatment and prevention.

One type of somatic mutation is the single nucleotide variant (SNV), also referred to as a single base substitution. This involves the replacement of one base pair in the genome with another. There are six possible base pair mutations: C:G\>A:T, C:G\>G:C, C:G\>T:A, T:A\>A:T, T:A\>C:G, and T:A\>G:C. When considering the context of the immediate 5' and 3' neighboring bases, the total number of mutations increases to 96, calculated as $6 \times 4 \times 4 = 96$. These are known as trinucleotide mutation channels. Examples of such mutations include ACA:TGT\>AAA:TTT and ACT:TGA\>AGT:TCA. For simplicity, we will abbreviate these mutations as ACA\>AAA and ACT\>AGT respectively.

## Mutational Signature

A mutational signature $\theta$ with respect to trinucleotide mutation channels is a discrete probability distribution over the 96 mutational channels i.e. $\theta\in \Delta^{96}$ where

{{< math >}}
$$
\Delta^{n} = \left\{ (x_1, x_2, \ldots, x_{n}) \in \mathbb{R}^{n} \mid x_i \geq 0 \text{ for all } i \text{ and } \sum_{i=1}^{n} x_i = 1 \right\}.
$$
{{< /math >}}

A mutational signature $\theta$ can be visualised as in the following.

<figure>
<img
src="media/a9711185bb2959bf64bf6004e591ab8de652fedf.png"
 alt="500" />

</figure>

The framework for studying somatic mutations through mutational signatures was introduced in a landmark study by Alexandrov et al. (2013), where over 7,000 bulk-sequenced cancer samples were analyzed. Conceptually, a mutational signature represents a biological process acting on the genome, leaving a distinct imprint captured in a probability vector, $\theta$. A comprehensive list of mutational signatures and their proposed underlying biological processes is available through the [COSMIC project](https://cancer.sanger.ac.uk/signatures/sbs/). Some of the mutational signatures and their associated probability vectors $\theta$ in the COSMIC project are consistently identifiable across most examined cohorts and signature identification algorithms \[@kohMutationalSignaturesEmerging2021\].

To estimate mutational signatures and their activities, \[@alexandrovDecipheringSignaturesMutational2013\] employed Non-Negative Matrix Factorization (NMF). NMF and its variations remain the most widely used methods for estimating mutational signatures and mutational signature activities.

## Dirichlet Process (DP)

A key mathematical tool for our study is the Dirichlet Process (DP). Formally, the Dirichlet process, denoted as $\mathrm{DP}(\alpha, H)$, is a distribution over probability measures. When we sample $G \sim \mathrm{DP}(\alpha, H)$, we obtain a probability measure $G$. The Dirichlet Process has two parameters: the concentration parameter $\alpha>0$, and the base measure $H$. The support of $G$ is a subset of the support of the base measure $H$.

To sample from the Dirichlet process, we begin by drawing an infinite sequence of i.i.d. samples $\tilde{\theta}\_1, \tilde{\theta}\_2, \ldots \sim H$. Then, we draw a vector $\boldsymbol{e} = \\{e\_1, e\_2, \ldots\\} \sim \operatorname{Stick}(\alpha)$, where $\operatorname{Stick}(\alpha)$ refers to the stick-breaking process. Intuitively, the stick-breaking process works by repeatedly breaking off and discarding a random fraction of a "stick" that is initially of length $1$. Each broken off part of the stick has a length $e\_k$. The stick-breaking process generates a sequence $\boldsymbol{e} \in \Delta^\infty$, where the total length of all the broken pieces is 1.

Finally, we construct the random measure $G$ as:
{{< math >}}
$$G = \sum_{k=1}^{\infty} e_k \delta_{\tilde{\theta}_k}$$
{{< /math >}}
where $\delta\_{\tilde{\theta}\_k}$ is a Dirac delta function centered at $\tilde{\theta}\_k$. The resulting measure $G$ is discrete, with countable support given by $\\{\tilde{\theta}\_1, \tilde{\theta}\_2, \ldots\\}$.

### Mathematical properties of Dirichlet Process

The base measure $H$ serves as the mean of the random measure $G$. Specifically, for any measurable set $A$, the expectation of $G(A)$ under the Dirichlet process is given by \[@millerDirichletProcessModels\]:

{{< math >}}
$$
\mathrm{E}_{G \sim \mathrm{DP}(\alpha, H)}[G(A)]=H(A)
$$
{{< /math >}}

As $\alpha \rightarrow \infty$, the distribution of $G$ converges to $H$ in the weak topology, meaning that larger values of $\alpha$ make $G$ more closely resemble the base measure $H$.

In summary, $G$ is centered around the prior distribution $H$, with the concentration parameter $\alpha$ controlling how tightly $G$ clusters around $H$. A higher $\alpha$ reduces variability, causing $G$ to approximate $H$ more closely.

### References

<details>

<summary>

Recommended material for Dirichlet Process
</summary>

- https://en.wikipedia.org/wiki/Dirichlet_process
- https://www.geeksforgeeks.org/dirichlet-process-mixture-models-dpmms/
- https://towardsdatascience.com/dont-be-afraid-of-nonparametric-topic-models-d259c237a840
- https://pawel-czyz.github.io/posts/dirichlet-process.html

</details>

<details>

<summary>

NoteBook Impelementation of the Dirichlet Process
</summary>

- https://datamicroscopes.github.io/ncluster.html
- https://github.com/tdhopper/notes-on-dirichlet-processes/tree/master
- https://github.com/tdhopper/notes-on-dirichlet-processes/blob/master/pages/2015-07-28-dirichlet-distribution-dirichlet-process.ipynb

</details>

## Modelling mutational signature with DP

Dirichlet processes have been utilized in previous studies to model trinucleotide mutations associated with mutational signatures \[@robertsPatternsSomaticGenome\] and \[@liPatternsSomaticStructural2020\]. Although Appendix B (p. 234) and Chapter 4 (p. 132) in \[@robertsPatternsSomaticGenome\] provide a mathematical overview of the model, they lack sufficient detail and are not fully comprehensive. This section aims to address that gap by deriving the Dirichlet Process model for trinucleotide mutations in a thorough and accessible manner. We will begin by introducing a more intuitive approach to modeling trinucleotide mutations using a mixture model. To illustrate, consider the trinucleotide mutations within a single sample, which can be encoded as $x \in \\{1, \ldots, 96\\}$, representing the 96 possible trinucleotide mutation types.

#### Step 1: Known number of mutational signatures $K$

Let's begin by assuming we know the number of active mutational signatures, denoted as $K$. Each signature is represented by a discrete probability distribution, $\tilde{\theta}\_k \in \Delta^{96}$, where $k=1, \ldots, K$. Since we assume that we have no prior knowledge of the specific mutational signatures, we model these distributions as:
{{< math >}}
$$
\begin{aligned}
\tilde{\theta}_k  & \sim \operatorname{Dir}\left(\frac{1}{96} \cdot \mathbf{1}_{96}\right) 
\text{ for } k=1,\ldots, K\\
\end{aligned},
$$
{{< /math >}}
where $\operatorname{Dir}$ denotes the Dirichlet distribution, serving as a symmetric prior. Similarly, we assume no prior information about the activity of these mutational signatures. We model the activity of the $K$ mutational signatures $\boldsymbol{e} \in \Delta^K$ in a sample as:
{{< math >}}
$$
\begin{aligned}
\boldsymbol{e} \mid \alpha,K & \sim \operatorname{Dir}\left(\frac{\alpha}{K} \cdot \mathbf{1}_K\right). 
\end{aligned}
$$
{{< /math >}}
where $\alpha$ is a hyperparameter controlling the concentration of the distribution. Next, let $z\_i=k$ represent the event that the $i$-th mutation was generated by the $k$-th mutational signature. If we observe a total of $M$ trinucleotide mutations in our sample, we draw each $z\_i\in \\{{1,\ldots, K}\\}$ according to the mutational signature activity $\boldsymbol{e}$, as follows:

{{< math >}}
$$
\begin{aligned}
 z_i \mid \boldsymbol{e} & \sim \operatorname{Categorical} \left(\boldsymbol{e}\right)  \text{ for } i=1,\ldots, M,
\end{aligned}
$$
{{< /math >}}

indicating that the probability $\mathrm{P}\left(z\_i=k\right)=e\_k$, where $e\_k$ is the activity level of signature $k$. Finally, the observed trinucleotide mutation $x\_i \in\\{1, \ldots, 96\\}$ is drawn from a categorical distribution based on the corresponding mutational signature $z\_i=k$ and its distribution $\tilde{\theta}\_k$ :

{{< math >}}
$$
\begin{aligned}
\{{1,\ldots, 96}\} \ni x_i \mid z_i=k, \tilde{\theta}_k & \sim \operatorname{Categorical} \left(\tilde{\theta}_{k}\right)  \text{ for } i=1,\ldots, M
\end{aligned}
$$
{{< /math >}}
This completes our model, which describes how the mutational signatures $\left\\{\tilde{\theta}\_1, \ldots, \tilde{\theta}\_K\right\\}$ generate the observed trinucleotide mutations $\left\\{x\_1, \ldots, x\_M\right\\}$

##### Graphical model for known number of components $K$

We can visualize the process that generates trinucleotide mutations in a sample using a graphical model:

<figure>
<img
src="media/7d5261339cd5d516f8153605fe36589a23255d8d.png"
 alt="300" />

</figure>

Here the grey background color indicates that $x\_i$ is an observed random variable.

#### Step 2: Equivalent model as mixture

In the next step, we aim to integrate out the indicator variable $z\_i=k$ in our model, seeking a different representation of the same model. As before, we draw the mutational signature activities as follows:
{{< math >}}
$$
\begin{aligned}
\boldsymbol{e} \mid \alpha,K & \sim \operatorname{Dir}\left(\frac{\alpha}{K} \cdot \mathbf{1}_K\right). 
\end{aligned}
$$
{{< /math >}}
Let $H=\operatorname{Dir}\left(\frac{1}{96} \cdot \mathbf{1}\_{96}\right)$. Similar to the last step, we generate the mutational signatures as
{{< math >}}
$$
\begin{aligned}
\tilde{\theta}_k & \sim H \text{ for } k=1,\ldots, K.
\end{aligned}
$$
{{< /math >}}

Now, instead of assuming that each observation $i=1, \ldots, M$ is first assigned a mutational signature $z\_i \in\\{1, \ldots, K\\}$ and then drawn from the corresponding signature $\tilde{\theta}\_{z\_i}$ we directly draw $\theta\_i$ from $\left\\{\tilde{\theta}\_1, \ldots, \tilde{\theta}\_K\right\\}$, with probabilities $\left\\{e\_1, \ldots, e\_K\right\\}$ for each observation:

{{< math >}}
$$
\begin{aligned}
\theta_i \mid \boldsymbol{e}, \tilde{\theta}_1, \ldots \tilde{\theta}_K & \sim G=\sum_{k=1}^K e_k \delta_{\tilde{\theta}_k}\left(\theta_i\right) \text{ for } i=1,\ldots, M.
\end{aligned}
$$
{{< /math >}}
Here, $G$ represents a finite mixture distribution with support on the acting mutational signatures. Finally, we draw the trinucleotide mutation as follows:
{{< math >}}
$$
\begin{aligned}
x_i \mid \theta_i & \sim \operatorname{Categorical} \left(\theta_i\right) \text{ for } i=1,\ldots, M. 
\end{aligned}
$$
{{< /math >}}

#### Step 3: Unknown, unbounded number of components $K$

Let
{{< math >}}
$$
\Delta^{\infty} = \left\{ (\theta_1, \theta_2, \ldots, ) \in \mathbb{R}^{\infty} \mid \theta_i \geq 0 \text{ for all } i \text{ and } \sum_{i=1}^{\infty} \theta_i = 1 \right\}.
$$
{{< /math >}}

We now extend the model from the previous step to allow for an unknown number of components $K$, with any $K \in \mathbb{N}$ being possible. As in the previous step, we generate the underlying mutational signatures $\tilde{\theta}\_k\in \Delta^{96}$ from $H$ as follows:
{{< math >}}
$$
\begin{aligned}
\tilde{\theta}_k & \sim H \text{ for } k=1,2,\ldots 
\end{aligned}
$$
{{< /math >}}
Previously, we sampled a finite set of $K$ mutational signatures $\tilde{\theta}\_k$, but now we generate an infinite sequence of signatures. Accordingly, the mutational signature activities $\boldsymbol{e}$ now lie in $\Delta^{\infty}$. To model these activities, we use the Stick-breaking process, which defines a distribution over $\Delta^{\infty}$. Thus, we sample the mutational signature activities as:

{{< math >}}
$$
\begin{aligned}
\boldsymbol{e} \mid \alpha &\sim \operatorname{Stick}(\alpha).
\end{aligned}
$$
{{< /math >}}
Intuitively, the stick-breaking process works by repeatedly breaking off and discarding a random fraction of a "stick" that is initially of length $1$. Each broken off part of the stick has a length $e\_k$. The stick-breaking process generates a sequence $\boldsymbol{e} \in \Delta^\infty$, where the total length of all the broken pieces is $1$. Consequently, the mixture distribution $G$, which previously had finite support, now has countably infinite support $\left\\{\tilde{\theta}\_1, \tilde{\theta}\_2, \ldots\right\\}$ and takes the form:
{{< math >}}
$$
\begin{aligned}
\mathcal{P}(\Delta^{96}) \ni G&=\sum_{k=1}^{\infty} e_k \delta_{\tilde{\theta}_k}\left(\theta_i\right) , 
\end{aligned}
$$
{{< /math >}}
where $\mathcal{P}(\Delta^{96})$ denotes the space of probability distributions on $\Delta^{96}$. We draw $\theta\_i$ from the support of $G$, which is $\left\\{\tilde{\theta}\_1, \tilde{\theta}\_2, \ldots\right\\}$, as follows:
{{< math >}}
$$
\begin{aligned}
\theta_i \mid  G & \sim G \text{ for } i=1,\ldots, M \\  
\end{aligned}
$$
{{< /math >}}

Finally, we observe the mutations as
{{< math >}}
$$
\begin{aligned}
\{{1,\ldots, 96}\} \ni x_i \mid \theta_i & \sim \operatorname{Categorical} \left(\theta_i\right) \text{ for } i=1,\ldots, M 
\end{aligned}
$$
{{< /math >}}
\#### Step 4: Short hand notation

We summarize the first three lines in the last equation and say that $G$ was genereated by the Dirichlet Process $\mathrm{DP}$ with the parameters $\alpha$ and $H$. This way the above equations simplify to

{{< math >}}
$$
\begin{aligned}
G &\sim \mathrm{DP}(\alpha, H)\\ 
\Delta^{96}\ni \theta_i \mid G &\sim G \text{ for } i=1,\ldots, M \\
\{{1,\ldots, 96}\} \ni x_i \mid \theta_i & \sim \operatorname{Categorical} \left(\theta_i\right) \text{ for } i=1,\ldots, M   
\end{aligned}
$$
{{< /math >}}

This concludes our derivation of how we can model trinucleotide mutations with a Dirichlet Process, as used in \[@liPatternsSomaticStructural2020\]. The Dirichlet Process approach presents an alternative approach to estimate mutational signature and signature activity as alternative to the classical approach based on Non-negative Matrix Factorisation used in \[@alexandrovSignaturesMutationalProcesses2013a\].

##### Graphical Model of Dirichlet Process

We can visualise the Dirichlet process as a graphical model:

<figure>
<img
src="media/cae3659c625ecead8e187392389b2cc3e01df00c.png"
 alt="ThegraphicalmodelofaDirichletProcess." />
<figcaption
aria-hidden="true">ThegraphicalmodelofaDirichletProcess.</figcaption>
</figure>

## Hierarchical Dirichlet Process (HDP)

By taking composition of multiple Dirichlet Processes, we obtain a Hierarchical Dirichlet Process (HDP) \[@tehHierarchicalDirichletProcesses2006\]. Recall that Dirichlet processes excel at modelling mixtures with an unknown number of components. HDPs are tailored for the situation when we have groups of mixture components and/or hierarchies between mixture components. For our model of trinucleotide mutations, we can use HDP to account for multiple samples. We expect from biology that there are general trends of mutational signature activity. However, we expect those trends to be more similar within a sample than between samples. In a mixture modelling approach, this would be captured by separate mixture models for each sample and information sharing between the weights of each sample. In the Dirichlet Process approach, this can be reflected by the HDP model. As before, we start with the prior distribution $H$. We draw a common base distribution $G\_0$ from a Dirichlet Process as
{{< math >}}
$$
\begin{aligned}
G_0 &\sim \mathrm{DP}(\alpha_0, H).\\ 
\end{aligned}
$$
{{< /math >}}
Let's assume we have $N$ samples. For each sample, we draw a seperate Dirichlet Process $G\_j$ from the common base distribution $G\_0$ as
{{< math >}}
$$
\begin{aligned}
G_j \mid G_0 &\sim \mathrm{DP}(\alpha_j, G_0) \text{ for } j = 1,2,\ldots N. 
\end{aligned}
$$
{{< /math >}}
In other words, we have a Dirichlet Process $G\_0$ at the top and other Dirichlet Processes $G\_j$ at the lower hierarchies. As described in the section of the mathematical properties of the Dirichlet Process, each $G\_j$ will vary around $G\_0$. This allows the different samples $G\_j$ to share information via $G\_0$. Let's assume we observe $M\_j$ mutations in the $j$-th sample. We draw the mutations as before:

{{< math >}}
$$
\begin{aligned}
\theta_{j i} \mid G_j &\sim G_j \text{ for } i = 1,2,\ldots M_j , \\
x_{ji} \mid \theta_{j i} & \sim \operatorname{Categorical} \left(\theta_{j i}\right). 
\end{aligned}
$$
{{< /math >}}

The corresponding graphical model is:

<figure>
<img
src="media/7ed449672108468c8b92b5be803a1b3bf01459e5.png"
 alt="500" />

</figure>

### Estimation of mutational signature and mutational signature activity

Let's assume we have the mutational signatures $\left(\theta\_k\right)\_{k\in \mathbb{N}}\subset \Delta^{96}$ acting on the genome. Borrowing notation from the model with a finite number of mutational signatures, let $z\_{ji}\in \mathbb{N}$ denote the mutational signature that generated the mutation $x\_{ji}\in \\{1,\ldots,96\\}$. By fitting a HDP to our data we will obtain an estimate $\hat{z}\_{ji}$ of $z\_{ji}$. Our estimate $\hat{\theta}\_k$ for the associated probability vector $\theta\_k \in \Delta^{96}$ of mutational signature $k$ is

{{< math >}}
$$\hat{\theta}_k=\frac{\sum_{l=1}^{96}\sum_{j=1}^N\sum_{i=1}^{M_j} \mathbb{I}(\hat{z}_{ji}=k)\mathbb{I}(x_{ji}=l)\delta_l}{\sum_{j=1}^N\sum_{i=1}^{M_j} \mathbb{I}(\hat{z}_{ji}=k)},$$
{{< /math >}}
where $\delta\_l\in \Delta^{96}$ has mass $1$ at position $l$. Further, we estimate the mutational signature activity $e\_{kj}$ of mutational signature $k$ in sample $j$ by  
{{< math >}}
$$\hat{e}_{kj}=1/M_j\sum_{i=1}^{M_j} \mathbb{I}(\hat{z}_{ji}=k).$$
{{< /math >}}

### Advantages of HDP approach compared to the classical NMF approach for mutational signature estimation

The Hierarchical Dirichlet Process (HDP) approach offers several advantages over the classical Non-negative Matrix Factorization (NMF) method. It allows for the incorporation of prior knowledge and the imposition of group structures, such as the expectation that certain features should behave in coordinated ways \[@robertsPatternsSomaticGenome\]. In mutational signature analysis, two key tasks---(1) de novo discovery of mutational signatures and (2) estimation of signature activity---can be performed simultaneously using HDP. The method can match the observed mutational catalog to an existing signature library while also identifying new signatures by pseudo-counting the existing library as observational data. Additionally, HDP facilitates the direct learning of the number of signatures from the data, overcoming a common challenge in NMF, which often struggles to select the appropriate number of signatures. While some NMF variants can quantify uncertainty, HDP provides this capability more easily.
\### References

<details>

<summary>

Python Implementations 1
</summary>

- https://radimrehurek.com/gensim/models/hdpmodel.html
- Gensim is a Python library for *topic modelling*, *document indexing* and *similarity retrieval* with large corpora. Target audience is the *natural language processing* (NLP) and *information retrieval* (IR) community.
- https://github.com/piskvorky/gensim/blob/develop/gensim/models/hdpmodel.py
- based on https://github.com/blei-lab/online-hdp
- https://towardsdatascience.com/dont-be-afraid-of-nonparametric-topic-models-d259c237a840
- https://towardsdatascience.com/dont-be-afraid-of-nonparametric-topic-models-part-2-python-e5666db347a
- https://github.com/ecoronado92/hdp
- https://github.com/morrisgreenberg/hdp-py

</details>

<details>

<summary>

Python Implementations 2
</summary>

- https://radimrehurek.com/gensim/models/hdpmodel.html
- Gensim is a Python library for *topic modelling*, *document indexing* and *similarity retrieval* with large corpora. Target audience is the *natural language processing* (NLP) and *information retrieval* (IR) community.
- https://github.com/piskvorky/gensim/blob/develop/gensim/models/hdpmodel.py
- based on https://github.com/blei-lab/online-hdp
- https://towardsdatascience.com/dont-be-afraid-of-nonparametric-topic-models-d259c237a840
- https://towardsdatascience.com/dont-be-afraid-of-nonparametric-topic-models-part-2-python-e5666db347a
- https://github.com/ecoronado92/hdp
- https://github.com/morrisgreenberg/hdp-py
- Simple Jupyter notebook: https://github.com/tdhopper/notes-on-dirichlet-processes/blob/master/pages/2015-07-30-sampling-from-a-hierarchical-dirichlet-process.ipynb (just for sampling?)

</details>

<details>

<summary>

Recommended Material for HDP
</summary>

- https://en.wikipedia.org/wiki/Hierarchical_Dirichlet_process
- https://mlg.eng.cam.ac.uk/zoubin/tut06/ywt.pdf

</details>
