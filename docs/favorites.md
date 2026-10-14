# Editing Favorites

Edit `src/config/favorites.json`. The order in each array is the display order; each section displays up to five entries.

Anime fields:

- `name`: title.
- `type`: genre or format, such as `Fantasy · TV series`.
- `years`: display text, such as `2012–2020` or `2023–present`.
- `seasons`: number of seasons; use `null` to omit.
- `image`: a path inside `public/`, such as `/favorites/my-anime.webp`, or a full HTTPS image URL.
- `comment`: optional personal recommendation.

Game fields:

- `name`: title.
- `type`: genre, such as `RPG`.
- `releaseYear`: release year or a range for a franchise, such as `1997–present`; use `null` to omit.
- `platforms`: optional display text, such as `PC · PlayStation`.
- `image`: same format as anime images.
- `comment`: optional personal recommendation.

For local images, add the files to `public/favorites/` and reference them as `/favorites/filename.webp`. A portrait cover works best; images are cropped to a 3:4 ratio. Blank image fields show a numbered placeholder. Empty metadata fields are hidden.

Both lists follow the owner’s supplied order. Edit the entries to change the selections or their ranking.

## Initial anime metadata

The five anime follow the owner's supplied order. Season counts describe the main TV series, excluding films and spin-offs. Solo Leveling includes two TV seasons. Demon Slayer includes four TV seasons through Hashira Training; its films are not counted as TV seasons. Counts were checked in October 2026 and remain manually editable.

Metadata references: [Mushoku Tensei official site](https://mushokutensei.jp/), [Tensura official site](https://www.ten-sura.com/news/anime/tensura/news/post/11253), [Sword Art Online episodes](https://en.wikipedia.org/wiki/List_of_Sword_Art_Online_episodes), [Solo Leveling official site](https://sololeveling-anime.net/), and [Demon Slayer official site](https://demonslayer-anime.com/worldtour2024/introduction/). Cover art uses external image URLs, which can be replaced with local files.

Set `imageFit` to `contain` for logos or artwork that should not be cropped. The default is `cover`. Diablo represents the entire franchise; its year field is a range, not an individual game release. Minecraft uses its full-release year (2011), rather than the first public version (2009).
