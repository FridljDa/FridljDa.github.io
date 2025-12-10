import { SITE, BIOGRAPHY } from '../data/site';
import type { CollectionEntry } from 'astro:content';
import type { WithContext, Person, Organization, WebSite, CollectionPage, BlogPosting, Article } from 'schema-dts';

export function generatePersonSchema(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: BIOGRAPHY.name,
    jobTitle: BIOGRAPHY.role,
    url: SITE.url,
    sameAs: BIOGRAPHY.social.map((s) => s.url),
    worksFor: {
      '@type': 'Organization',
      name: BIOGRAPHY.organization.name,
      url: BIOGRAPHY.organization.url,
    },
  };
}

export function generateDetailedPersonSchema(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: BIOGRAPHY.name,
    jobTitle: BIOGRAPHY.role,
    url: SITE.url,
    description: BIOGRAPHY.bio,
    sameAs: BIOGRAPHY.social.map((s) => s.url),
    worksFor: {
      '@type': 'Organization',
      name: BIOGRAPHY.organization.name,
      url: BIOGRAPHY.organization.url,
    },
    alumniOf: BIOGRAPHY.education.map((edu) => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
    })),
  };
}

export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BIOGRAPHY.organization.name,
    url: BIOGRAPHY.organization.url,
  };
}

export function generateWebsiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    url: SITE.url,
    description: SITE.description,
  };
}

export function generateCollectionPageSchema(): WithContext<CollectionPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: SITE.title,
    url: SITE.url,
    description: SITE.description,
    mainEntity: {
      '@type': 'Person',
      name: BIOGRAPHY.name,
      jobTitle: BIOGRAPHY.role,
      url: SITE.url,
      sameAs: BIOGRAPHY.social.map((s) => s.url),
      worksFor: {
        '@type': 'Organization',
        name: BIOGRAPHY.organization.name,
        url: BIOGRAPHY.organization.url,
      },
    },
  };
}

export function generateBlogPostingSchema(
  post: CollectionEntry<'blog'>,
  postUrl: string,
  postImage: string
): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description || '',
    image: postImage,
    datePublished: post.data.pubDate.toISOString(),
    dateModified:
      post.data.updatedDate?.toISOString() ||
      post.data.pubDate.toISOString(),
    author: {
      '@type': 'Person',
      name: BIOGRAPHY.name,
      url: SITE.url,
      sameAs: BIOGRAPHY.social.map((s) => s.url),
    },
    publisher: {
      '@type': 'Organization',
      name: BIOGRAPHY.organization.name,
      url: BIOGRAPHY.organization.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.data.tags?.join(', ') || '',
  };
}

export function generateArticleSchema(
  post: CollectionEntry<'blog'>,
  postUrl: string,
  postImage: string
): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.data.title,
    description: post.data.description || '',
    image: postImage,
    datePublished: post.data.pubDate.toISOString(),
    dateModified:
      post.data.updatedDate?.toISOString() ||
      post.data.pubDate.toISOString(),
    author: {
      '@type': 'Person',
      name: BIOGRAPHY.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: BIOGRAPHY.organization.name,
      url: BIOGRAPHY.organization.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };
}

