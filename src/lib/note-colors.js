export const presetColors = {
  butter: '#f4df86', rose: '#edb4bb', lavender: '#cbb9ef',
  mint: '#b9d8b2', sky: '#afd3ee', peach: '#f5c19b',
}
export const noteColors = Object.keys(presetColors)
export function noteAppearance(color) {
  const paper = presetColors[color] || (/^#[0-9a-f]{6}$/i.test(color || '') ? color : presetColors.butter)
  const channels = paper.slice(1).match(/../g).map(channel => {
    const value = parseInt(channel, 16) / 255
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
  return { '--note-color': paper, '--note-ink': luminance > .179 ? '#181818' : '#ffffff' }
}
