/** Normalize user-provided text once so all helpers use the same rules. */
const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export function searchSongs(songs, query = "") {
  const q = normalizeText(query);
  if (!Array.isArray(songs)) return [];
  if (!q) return [...songs];
  return songs.filter((song) =>
    [song?.title, song?.artist, song?.album]
      .filter((value) => typeof value === "string")
      .map((value) => value.toLowerCase())
      .join(" ")
      .includes(q)
  );
}
export function filterSongsByLanguage(songs, language = "") {
  if (!Array.isArray(songs)) return [];
  const lang = normalizeText(language);
  if (!lang) return [...songs];
  return songs.filter((song) => normalizeText(song?.language) === lang);
}
export function validateSong(song) {
  if (!song || typeof song !== "object" || Array.isArray(song)) return ["Song must be an object."];
  const errors = [];
  if (!normalizeText(song.title)) errors.push("Title is required.");
  if (!normalizeText(song.artist)) errors.push("Artist is required.");
  if (song.language != null && typeof song.language !== "string") errors.push("Language must be a string when provided.");
  return errors;
}
