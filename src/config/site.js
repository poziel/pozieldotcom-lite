import localdevLogo from '../assets/projects/localdev.svg'
import refinimoLogo from '../assets/projects/refinimo.svg'
import upkeepLogo from '../assets/projects/upkeep.svg'
import prismixLogo from '../assets/projects/prismix.png'
import wintoolsLogo from '../assets/projects/wintools-dark.svg'
import refletLogo from '../assets/projects/reflet.svg'
import frameLogo from '../assets/projects/frame.svg'
import pixenLogo from '../assets/projects/pixen.png'

export const site = {
  name: 'Alexandre Sauvé',
  alias: 'Pøziel',
  portrait: `${import.meta.env.BASE_URL}portraits/alexandre-studio-violet.png`,
  location: 'Drummondville, Québec, Canada',
  locationUrl: 'https://www.google.com/maps/search/?api=1&query=Drummondville%2C%20Qu%C3%A9bec%2C%20Canada',
  employer: { name: 'Progi', url: 'https://progi.com/' },
  roles: 'Developer. Creator. Gamer.',
  bio: 'I try to build apps to make everyone’s lives easier. Also, I’m an unofficial professional gamer with no talent.',
}

// url is the main destination; repository powers the GitHub link and star count.
export const projects = [
  { name: 'Frame', category: 'Application framework', description: 'A Vue framework for desktop-style apps, with flexible workspaces, panels, commands, and shared controls.', url: 'https://github.com/poziel/frame', repository: 'poziel/frame', icon: frameLogo },
  { name: 'Pixen', category: 'Pixel art & animation', description: 'A desktop pixel-art editor with animation, AI-assisted drawing, and flexible exports for games and apps.', url: 'https://github.com/poziel/pixen', repository: 'poziel/pixen', icon: pixenLogo },
  { name: 'localdev', category: 'Developer tools', description: 'Local projects, services, and development workflows. One command-line tool.', url: 'https://github.com/poziel/localdev', repository: 'poziel/localdev', icon: localdevLogo },
  { name: 'Refinimo', category: 'Team collaboration', description: 'Planning poker that helps teams estimate work together, in real time.', url: 'https://refinimo.com/', repository: 'poziel/refinimo', icon: refinimoLogo },
  { name: 'Upkeep', category: 'Personal finance', description: 'A clearer picture of subscriptions, recurring expenses, and what’s coming next.', url: 'https://github.com/poziel/upkeep', repository: 'poziel/upkeep', icon: upkeepLogo },
  { name: 'KWIQ', category: 'Social gaming', description: 'Live quizzes for parties, classrooms, and communities. Everyone plays along.', url: 'https://github.com/poziel/kwiq', repository: 'poziel/kwiq', mark: 'K' },
  { name: 'WinTools', category: 'Windows utilities', description: 'Windows utilities that download on demand and clean up after themselves.', url: 'https://wintools.poziel.dev', repository: 'poziel/wintool', icon: wintoolsLogo },
  { name: 'Reflet', category: 'Cloud backups', description: 'A Windows desktop app that brings local folders, cloud accounts, and backup destinations together. Give your files a second home.', url: 'https://github.com/poziel/reflet', repository: 'poziel/reflet', icon: refletLogo },
  { name: 'Prismix', category: 'Vue components', description: 'A lightweight Vue 3 component library for accessible, composable, and customizable interfaces with a unified design system.', url: 'https://github.com/poziel/prismix', repository: 'poziel/prismix', icon: prismixLogo },
]
