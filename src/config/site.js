import localdevLogo from '../assets/projects/localdev.png'
import refinimoLogo from '../assets/projects/refinimo.png'
import subfolioLogo from '../assets/projects/subfolio.svg'
import prismixLogo from '../assets/projects/prismix.png'

export const site = {
  name: 'Alexandre Sauvé',
  alias: 'Pøziel',
  portrait: `${import.meta.env.BASE_URL}portraits/alexandre-studio-violet.png`,
  location: 'Drummondville, Québec, Canada',
  locationUrl: 'https://www.google.com/maps/search/?api=1&query=Drummondville%2C%20Qu%C3%A9bec%2C%20Canada',
  employer: { name: 'Progi', url: 'https://progi.com/' },
  roles: 'Developer. Creator. Gamer.',
  bio: 'I try to build apps to make everyone’s lives easier. Also, I’m an unofficial professional gamer with no talent.',
  announcement: 'I’m working on a new site.',
  announcementDetail: 'It’ll have more about my life and what I’m up to.',
}

// url is the main destination; repository powers the GitHub link and star count.
export const projects = [
  { name: 'localdev', category: 'Developer tools', description: 'Local projects, services, and development workflows. One command-line tool.', url: 'https://github.com/poziel/localdev', repository: 'poziel/localdev', icon: localdevLogo },
  { name: 'Refinimo', category: 'Team collaboration', description: 'Planning poker that helps teams estimate work together, in real time.', url: 'https://refinimo.com/', repository: 'poziel/refinimo', icon: refinimoLogo },
  { name: 'Subfolio', note: 'Soon to be Upkeep', category: 'Personal finance', description: 'A clearer picture of subscriptions, recurring expenses, and what’s coming next.', url: 'https://github.com/poziel/subfolio', repository: 'poziel/subfolio', icon: subfolioLogo },
  { name: 'KWIQ', category: 'Social gaming', description: 'Live quizzes for parties, classrooms, and communities. Everyone plays along.', url: 'https://github.com/poziel/kwiq', repository: 'poziel/kwiq', mark: 'K' },
  { name: 'WinTool', category: 'Windows utilities', description: 'Windows utilities that download on demand and clean up after themselves.', url: 'https://github.com/poziel/wintool', repository: 'poziel/wintool', mark: 'W' },
  { name: 'Prismix', note: 'In progress', category: 'Vue components', description: 'A customizable Vue component library I’m working on finishing.', url: 'https://github.com/poziel/prismix', repository: 'poziel/prismix', icon: prismixLogo },
]
