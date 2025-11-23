export interface Publication {
  title: string;
  authors: string[];
  authorNotes?: string[];
  date: string;
  publication: string;
  publicationShort: string;
  abstract: string;
  summary: string;
  urlPdf?: string;
  urlCode?: string;
  urlDataset?: string;
}

export const PUBLICATIONS: Publication[] = [
  {
    title: 'Disparities in air pollution attributable mortality in the US population by race/ethnicity and sociodemographic factors',
    authors: [
      'Pascal Geldsetzer',
      'Daniel Fridljand',
      'Mathew Kiang',
      'Eran Bendavid',
      'Sam Heft-Neal',
      'Marshall Burke',
      'Alexander H. Thieme',
      'Tarik Benmarhnia',
    ],
    authorNotes: ['Equal contribution', 'Equal contribution'],
    date: '2024-07-01',
    publication: 'Journal article in Nature Medicine',
    publicationShort: 'Nature Medicine',
    abstract: 'There are large differences in premature mortality in the USA by race/ethnicity, education, rurality and social vulnerability index groups. Using existing concentration–response functions, published particulate matter (PM2.5) air pollution estimates, population estimates at the census tract level and county-level mortality data from the US National Vital Statistics System, we estimated the degree to which these mortality discrepancies can be attributed to differences in exposure and susceptibility to PM2.5. We show that differences in PM2.5-attributable mortality were consistently more pronounced by race/ethnicity than by education, rurality or social vulnerability index, with the Black American population having the highest proportion of deaths attributable to PM2.5 in all years from 1990 to 2016. Our model estimates that over half of the difference in age-adjusted all-cause mortality between the Black American and non-Hispanic white population was attributable to PM2.5 in the years 2000 to 2011. This difference decreased only marginally between 2000 and 2015, from 53.4% (95% confidence interval 51.2–55.9%) to 49.9% (95% confidence interval 47.8–52.2%), respectively. Our findings underscore the need for targeted air quality interventions to address environmental health disparities.',
    summary: 'In the US between 2000 and 2011, over half of the gap in mortality between Black and non-Hispanic White adults can be explained by the fact that Black adults are, on average, more exposed and more susceptible to air pollution than non-Hispanic White adults.',
    urlPdf: 'https://www.nature.com/articles/s41591-024-03117-0',
    urlCode: 'https://github.com/FridljDa/pm25_inequality',
    urlDataset: 'https://zenodo.org/records/10038691',
  },
];

