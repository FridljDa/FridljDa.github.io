#mutational-signature-with-hierarchical-dirichlet-process

#cp Obsidian_Vault/Output/Blog_post/Blog_post_hugo.md /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process/hdp_mutational_signature.md
#cp -r Obsidian_Vault/Output/Blog_post/Blog_post_hugo /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process/hdp_mutational_signature
#cd /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process

#ls /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post

#copy all files in /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post to /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process
cp -r /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post/Blog_post_hugo /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process/media 
cp /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post/Blog_post_hugo.md /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process/index.md
cd /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process

#----- find and replace stuff-----
#Consider the file index.md. replace the second line ---, add a line math: true
sed -i '' '2i\
title: Mutational signature estimation with Hierarchical Dirichlet Process
' index.md

sed -i '' '4i\
math: true
' index.md

#Consider the file index.md. Copy the line starting with "updated:" to the next line
awk '/^updated:/ {print; print} !/^updated:/' index.md > temp && mv temp index.md
#Consider the file index.md. In line 6, replace "updated:" with "date:"
sed -i '' '6s/updated:/date:/' index.md
#Consider the file index.md. In line 6, remove everything from "T"
sed -i '' '6s/T.*//' index.md

# Consider the file index.md. Replace all {{< mathjax >}} with {{< math >}} using bash 
sed -i '' 's/{{< mathjax >}}/{{< math >}}/g' index.md

# Consider the file index.md. Replace all {{</mathjax >}} with {{< /math >}} using bash
sed -i '' 's/{{<\/mathjax >}}/{{< \/math >}}/g' index.md

#Consider the file index.md. Replace all ../Blog_post_hugo/ by media/ using bash
sed -i '' 's|\.\./Blog_post_hugo/|media/|g' index.md

#Consider the file index.md. Replace all [300] and [500] by [] using bash 
sed -i '' 's/\[300\]/\[\]/g; s/\[500\]/\[\]/g' index.md

#Consider the file index.md. remove all <figcaption aria-hidden="true">500</figcaption> and <figcaption aria-hidden="true">300</figcaption>
# Remove all occurrences of <figcaption aria-hidden="true">500</figcaption> and <figcaption aria-hidden="true">300</figcaption>
sed -i '' 's|<figcaption aria-hidden="true">500</figcaption>||g' index.md
sed -i '' 's|<figcaption aria-hidden="true">300</figcaption>||g' index.md
# Remove all occurrences of title="wikilink"
sed -i '' 's|title="wikilink"||g' index.md
sed -i '' 's|"wikilink"||g' index.md

#replace \alpha {=tex} by $\alpha$
sed -i '' 's|`\\alpha `{=tex}|$\\alpha$ |g' index.md

#compare 
#code /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process/index.md
#code /Users/dfridljand/Desktop/FridljDa.github.io/content/post_template_inspiration/writing-technical-content/index_subset_relevant.md