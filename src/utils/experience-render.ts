export function renderExperienceDescription(description: string): string {
  return description
    .replace(/\n/g, '<br />')
    .replace(/\* /g, '• ')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-link-hover">$1</a>'
    )
    .replace(/<details>/g, '<details class="my-2">')
    .replace(
      /<summary>/g,
      '<summary class="cursor-pointer font-medium text-link-hover">'
    )
    .replace(/<ul>/g, '<ul class="list-disc list-inside ml-4 mt-2">')
    .replace(/<li>/g, '<li class="mb-1">');
}

