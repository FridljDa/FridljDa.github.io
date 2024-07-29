---
created: 2024-02-15T01:00
updated: 2024-05-02T09:51
---
Using [[HDP]] to [[Deriving mutational signatures]] as alternative to classical [[NMF]].
The advantage of the HDP-like approach is that we can impose prior knowledge that certain features should behave in certain, coordinated ways.

Let's assume we have a total of $V$ mutation classes/types.

> [!input] Input
> Observed mutations per mutation type and sample $x_{ji}$ encoded in the following way:
> 	- We observe a total of $M_j$ mutations in sample $j$
> 	- For $i\in \{1,\ldots, M_j\}$,  we have the label encoding $x_{ji}\in \{1,\ldots, V\}$

> [!input] Hyper parameter
> Parameters for Gamma distribution $\alpha_0, \beta_0$ initial and sample wise $\alpha_j, \beta_j$.
> base probability measure $H$ over $(\Theta, \mathcal{B})= (\{1,\ldots, V\}, \mathcal{P}(\{1,\ldots, V\}))$ mutation classes.
> - $H$ is our prior guess of how the mutations should generally be distributed for all samples

> [!output] Output
> Posterior estimates of the signature parameters $\theta_{j i}$  causing mutation type $i$ in sample $j$
> 	- w.l.o.g.: $\sum_{i \in \{1,\ldots, V\}} \theta_{j i}=1$ for each sample $j$
> 	- obtained via Gibbs sampling
> 

## Generating process
Generate concentration parameters $\gamma_0 \mid \alpha_0, \beta_0 \sim \operatorname{Gamma}\left(\alpha_0, \beta_0\right)$ and $\gamma_j \mid \alpha_j, \beta_j \sim \operatorname{Gamma}\left(\alpha_j, \beta_j\right)$. 
	We do not want to make a choice for $\gamma$ so we do that
Generate the sample specific mutation distributions $G_j \sim \mathrm{HDP}(\gamma_0, \gamma_j, H)$ according to [[HDP]]. Note that $\gamma_j$ varies between samples in deviation of the basic example described in [[HDP]].

Define $\theta_{j i}$ to be the signature that causes the $i$-th mutation $x_{j i}$ in cancer sample $j$. 
Each $\theta_{j i}$ is a probability vector over the $V$ classes, and each $x_{j i}$ is one categorical draw from that distribution, such that
$$
\begin{aligned}
\theta_{j i} \mid G_j & \sim G_j, \\
x_{j i} \mid \theta_{j i} & \sim \text { Categorical }\left(\theta_{j i}\right) \quad \text { for } i=1, \ldots, M_j .
\end{aligned}
$$
## Visual
Graphical representation for one group of cancer samples
![[Media/zotero/robertsPatternsSomaticGenome/robertsPatternsSomaticGenome-235-x168-y165.png|500]] 


> [!related] Related Work
> - Used in: Li, Y., Roberts, N. D., Wala, J. A., Shapira, O., Schumacher, S. E., Kumar, K., Khurana, E., Waszak, S., Korbel, J. O., Haber, J. E., Imielinski, M., PCAWG Structural Variation Working Group, Akdemir, K. C., Alvarez, E. G., Baez-Ortega, A., Beroukhim, R., Boutros, P. C., Bowtell, D. D. L., Brors, B., … Von Mering, C. (2020). Patterns of somatic structural variation in human cancer genomes. _Nature_, _578_(7793), 112–121. [https://doi.org/10.1038/s41586-019-1913-9](https://doi.org/10.1038/s41586-019-1913-9)
> - https://github.com/nicolaroberts/hdp
> - Roberts, N. D. (n.d.). _Patterns of somatic genome rearrangement in human cancer_.
> 	- Appendix B
> 	- Chapter 4
> - Talk to Lara about it?
>


> [!question] Title
> Does it really make sense to model? Seems unusual. 
> $$
\begin{aligned}
\theta_{j i} \mid G_j & \sim G_j, \\
x_{j i} \mid \theta_{j i} & \sim \text { Categorical }\left(\theta_{j i}\right) \quad \text { for } i=1, \ldots, M_j .
\end{aligned}
$$
