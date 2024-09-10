#cp Obsidian_Vault/Output/Blog_post/Blog_post_hugo.md /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content/hdp_mutational_signature.md
#cp -r Obsidian_Vault/Output/Blog_post/Blog_post_hugo /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content/hdp_mutational_signature
#cd /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content

#ls /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post

#copy all files in /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post to /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content
cp -r /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post/Blog_post_hugo /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content/media 
cp /Users/dfridljand/Desktop/mutational_signature_with_trees_hdp/Obsidian_Vault/Output/Blog_post/Blog_post_hugo.md /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content/index.md
cd /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content

#----- find and replace stuff-----
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

#Consider the file index.md. replace the second line ---, add a line math: true
sed -i '' '4i\
math: true
' index.md
#Consider the file index.md. Copy the line starting with "updated:" to the next line
awk '/^updated:/ {print; print} !/^updated:/' index.md > temp && mv temp index.md
#Consider the file index.md. Replace the first "updated:"" with "date:" using sed 
sed -i '' '0,/updated:/s//date:/' index.md

#compare 
#code /Users/dfridljand/Desktop/FridljDa.github.io/content/post/writing-technical-content/index.md
#code /Users/dfridljand/Desktop/FridljDa.github.io/content/post_template_inspiration/writing-technical-content/index_subset_relevant.md