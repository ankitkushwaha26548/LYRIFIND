import { performance } from "node:perf_hooks";
import os from "node:os";
import {
  searchSongs,
  filterSongsByLanguage,
  validateSong,
} from "../src/songUtils.js";

const recordCount = Number(process.env.RECORDS || 5000);
const iterations = Number(process.env.ITERATIONS || 500);
const songs = Array.from({ length: recordCount }, (_, index) => ({
  title: `Song ${index + 1}`,
  artist: `Artist ${index % 250}`,
  album: `Album ${index % 80}`,
  language: ["English", "Hindi", "Spanish", "French"][index % 4],
}));

const percentile = (values, percentage) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(percentage * sorted.length) - 1)];
};

function measure(operation, callback) {
  const timings = [];
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    callback(index);
    timings.push(performance.now() - start);
  }

  const total = timings.reduce((sum, value) => sum + value, 0);
  return {
    operation,
    iterations,
    average_ms: +(total / iterations).toFixed(3),
    p50_ms: +percentile(timings, 0.5).toFixed(3),
    p95_ms: +percentile(timings, 0.95).toFixed(3),
    throughput_ops_sec: +(iterations / (total / 1000)).toFixed(1),
  };
}

for (let index = 0; index < 100; index += 1) {
  searchSongs(songs, "song 42");
  filterSongsByLanguage(songs, "Hindi");
  validateSong(songs[index]);
}

const memoryBefore = process.memoryUsage();
const cpuBefore = process.cpuUsage();
const results = [
  measure("Search title/artist/album", (index) =>
    searchSongs(songs, `song ${(index % 400) + 1}`)),
  measure("Filter by language", () => filterSongsByLanguage(songs, "Hindi")),
  measure("Validate one record", (index) => validateSong(songs[index % recordCount])),
];
const cpu = process.cpuUsage(cpuBefore);
const memoryAfter = process.memoryUsage();

console.log(
  JSON.stringify(
    {
      test_type: "local in-process microbenchmark; synthetic dataset; not HTTP load",
      node: process.version,
      platform: `${os.platform()} ${os.arch()}`,
      cpu_model: os.cpus()[0]?.model,
      logical_cpus: os.cpus().length,
      records: recordCount,
      iterations,
      heap_before_mb: +(memoryBefore.heapUsed / 1048576).toFixed(2),
      heap_after_mb: +(memoryAfter.heapUsed / 1048576).toFixed(2),
      rss_after_mb: +(memoryAfter.rss / 1048576).toFixed(2),
      cpu_user_ms: +(cpu.user / 1000).toFixed(2),
      cpu_system_ms: +(cpu.system / 1000).toFixed(2),
      results,
    },
    null,
    2,
  ),
);
