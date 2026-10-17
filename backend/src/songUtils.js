export function searchSongs(songs, query = "") {
  const q = String(query ?? "").trim().toLowerCase();
  if (!Array.isArray(songs)) return [];
  if (!q) return [...songs];
  return songs.filter(song => [song?.title, song?.artist, song?.album]
    .filter(value => typeof value === "string")
    .join(" ").toLowerCase().includes(q));
}
export function filterSongsByLanguage(songs, language = "") {
  if (!Array.isArray(songs)) return [];
  const lang = String(language ?? "").trim().toLowerCase();
  if (!lang) return [...songs];
  return songs.filter(song => typeof song?.language === "string" &&
    song.language.trim().toLowerCase() === lang);
}
export function validateSong(song) {
  if (!song || typeof song !== "object" || Array.isArray(song)) return ["Song must be an object."];
  const errors = [];
  if (typeof song.title !== "string" || !song.title.trim()) errors.push("Title is required.");
  if (typeof song.artist !== "string" || !song.artist.trim()) errors.push("Artist is required.");
  if (song.language != null && typeof song.language !== "string") errors.push("Language must be a string when provided.");
  return errors;
}
