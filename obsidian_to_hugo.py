from obsidian_to_hugo import ObsidianToHugo

obsidian_to_hugo = ObsidianToHugo(
    obsidian_vault_dir="content/post/writing-technical-content",
    hugo_content_dir="content/post/writing-technical-content",
)

obsidian_to_hugo.run()