#mutational-signature-with-hierarchical-dirichlet-process


#copy all files in /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post to /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process
# Define variables for the paths
SOURCE_DIR="/Users/default/Desktop/temporary"
DEST_DIR="/Users/default/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process"
MEDIA_DIR="$DEST_DIR/media"
INDEX_FILE="$DEST_DIR/index.md"
SOURCE_MD="$SOURCE_DIR/Blog_post_hugo.md"

# Copy directories and files using the variables
cp -r "$SOURCE_DIR" "$MEDIA_DIR"
cp "$SOURCE_MD" "$INDEX_FILE"

# Change to the destination directory
cd "$DEST_DIR"

#----- find and replace stuff-----
#Consider the file index.md. replace the second line ---, add a line math: true
sed -i '' '2i\
title: Mutational signature estimation with Hierarchical Dirichlet Process\
math: true \
image: \
  placement: 2 \
  caption: "Visualised mutational signature"
' index.md

#Consider the file index.md. Copy the line starting with "updated:" to the next line
awk '/^updated:/ {print; print} !/^updated:/' index.md > temp && mv temp index.md

#Consider the file index.md. In line 6, replace "updated:" with "date:"
#Consider the file index.md. In the line starting with "date:", remove everything from "T"
sed -i '' '8s/updated:/date:/' index.md

#Consider the file index.md. In line 6, remove everything from "T"
sed -i '' '7s/T.*//' index.md
#Consider the file index.md. In line 7, remove everything from "T"
sed -i '' '8s/T.*//' index.md
#Consider the file index.md. In line 8, remove everything from "T"
sed -i '' '9s/T.*//' index.md

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

####-----reformat cross references------  [Go to Mutational Signature](#mutational-signature)
#Consider the file index.md. Use bash to replace every "Final_report#" with "#"
sed -i '' 's/Final_report#/#/g' index.md

#Consider the file index.md. Use bash. Replace all [#text](label) by [text](label)  
sed -i '' 's/\[\#\([^]]*\)\](\([^)]*\))/[\1](\2)/g' index.md

#Consider the file index.md. Use bash. Consider all [text](label). Replace every " " within label by "-". Take inspiartion from sed -i '' 's/\[\#\([^]]*\)\](\([^)]*\))/[\1](\2)/g' index.md.
#Consider the file index.md. Use bash. Consider all ](label). Replace every " " within label by "-". 
#sed -i '' -E 's/\]\(([^)]*)\)/\](\1)/g' index.md
#sed -i '' 's/\(\[[^]]*\](\)\([^)]*\)\()/\1\2\3/g' index.md
#TODO 
#sed -i '' 's/\(\[[^]]*\](\)\([^)]*\))/\1\2/g' index.md

# It would convert any uppercase letter within '\url{...}' to lowercase in the file Final_report_latex.tex
#sed -i '' -E 's|(\\url\{[^}]*)[A-Z]|\1\L&|g' Final_report_latex.tex
#TODO

#compare 
#code /Users/dfridljand/Desktop/FridljDa.github.io/content/post/mutational-signature-with-hierarchical-dirichlet-process/index.md
#code /Users/dfridljand/Desktop/FridljDa.github.io/content/post_template_inspiration/writing-technical-content/index_subset_relevant.md