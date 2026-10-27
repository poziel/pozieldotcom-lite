// Missing dates sort last. Equal dates retain the configured order.
export function sortProjectsByUpdate(projects, metadata) {
  const timestamp = (project) => {
    const value = Date.parse(metadata[project.repository]?.pushedAt)
    return Number.isFinite(value) ? value : -Infinity
  }
  return [...projects].sort((a, b) => {
    const first = timestamp(a)
    const second = timestamp(b)
    return first === second ? 0 : first > second ? -1 : 1
  })
}
