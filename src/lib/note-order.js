export function sortNotes(notes) {
  return [...notes].reverse().sort((a, b) => Number(Boolean(b.canEdit)) - Number(Boolean(a.canEdit))
    || (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0))
}
