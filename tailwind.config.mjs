/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(55 65 81)', // gray-700
            '--tw-prose-headings': 'rgb(17 24 39)', // gray-900
            '--tw-prose-lead': 'rgb(75 85 99)', // gray-600
            '--tw-prose-links': 'rgb(30 136 229)', // primary-600
            '--tw-prose-bold': 'rgb(17 24 39)', // gray-900
            '--tw-prose-counters': 'rgb(107 114 128)', // gray-500
            '--tw-prose-bullets': 'rgb(156 163 175)', // gray-400
            '--tw-prose-hr': 'rgb(229 231 235)', // gray-200
            '--tw-prose-quotes': 'rgb(17 24 39)', // gray-900
            '--tw-prose-quote-borders': 'rgb(229 231 235)', // gray-200
            '--tw-prose-captions': 'rgb(107 114 128)', // gray-500
            '--tw-prose-code': 'rgb(17 24 39)', // gray-900
            '--tw-prose-pre-code': 'rgb(243 244 246)', // gray-100
            '--tw-prose-pre-bg': 'rgb(243 244 246)', // gray-100
            '--tw-prose-th-borders': 'rgb(229 231 235)', // gray-200
            '--tw-prose-td-borders': 'rgb(243 244 246)', // gray-100
            // Dark mode colors
            '--tw-prose-invert-body': 'rgb(209 213 219)', // gray-300
            '--tw-prose-invert-headings': 'rgb(255 255 255)', // white
            '--tw-prose-invert-lead': 'rgb(156 163 175)', // gray-400
            '--tw-prose-invert-links': 'rgb(100 181 246)', // primary-400
            '--tw-prose-invert-bold': 'rgb(255 255 255)', // white
            '--tw-prose-invert-counters': 'rgb(156 163 175)', // gray-400
            '--tw-prose-invert-bullets': 'rgb(107 114 128)', // gray-500
            '--tw-prose-invert-hr': 'rgb(55 65 81)', // gray-700
            '--tw-prose-invert-quotes': 'rgb(243 244 246)', // gray-100
            '--tw-prose-invert-quote-borders': 'rgb(55 65 81)', // gray-700
            '--tw-prose-invert-captions': 'rgb(156 163 175)', // gray-400
            '--tw-prose-invert-code': 'rgb(255 255 255)', // white
            '--tw-prose-invert-pre-code': 'rgb(209 213 219)', // gray-300
            '--tw-prose-invert-pre-bg': 'rgb(31 41 55)', // gray-800
            '--tw-prose-invert-th-borders': 'rgb(55 65 81)', // gray-700
            '--tw-prose-invert-td-borders': 'rgb(31 41 55)', // gray-800
            // Custom heading styles to match current design
            h1: {
              fontSize: '2.25rem',
              fontWeight: '700',
              marginTop: '0',
              marginBottom: '1rem',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '700',
              marginTop: '3rem',
              marginBottom: '1rem',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '700',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            h4: {
              fontSize: '1.25rem',
              fontWeight: '700',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h5: {
              fontSize: '1.125rem',
              fontWeight: '700',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h6: {
              fontSize: '1.125rem',
              fontWeight: '700',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
}

