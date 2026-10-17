import test from "node:test";
import assert from "node:assert/strict";
import { searchSongs, filterSongsByLanguage, validateSong } from "../src/songUtils.js";
const songs = [
 {title:"Rain Again",artist:"A. Singer",album:"Blue Sky",language:"English"},
 {title:"Raat Ki Baat",artist:"B. Singer",album:"Safar",language:"Hindi"},
 {title:"Ocean",artist:"Rain Makers",album:"Waves",language:"English"},
 {title:"Solo",language:"Instrumental"}
];
test("case-insensitive title search",()=>assert.equal(searchSongs(songs,"RAIN AGAIN")[0].title,"Rain Again"));
test("search by artist",()=>assert.equal(searchSongs(songs,"rain makers")[0].title,"Ocean"));
test("search by album",()=>assert.equal(searchSongs(songs,"safar")[0].title,"Raat Ki Baat"));
test("blank query returns copied list",()=>{const r=searchSongs(songs,"  ");assert.equal(r.length,4);assert.notEqual(r,songs)});
test("missing optional fields do not crash",()=>assert.equal(searchSongs([{title:"Solo"},null],"solo").length,1));
test("invalid list returns empty list",()=>assert.deepEqual(searchSongs(null,"x"),[]));
test("language is case/space insensitive",()=>assert.equal(filterSongsByLanguage(songs," ENGLISH ").length,2));
test("empty language returns copied list",()=>{const r=filterSongsByLanguage(songs,"");assert.equal(r.length,4);assert.notEqual(r,songs)});
test("unknown language returns no matches",()=>assert.deepEqual(filterSongsByLanguage(songs,"French"),[]));
test("empty list stays empty",()=>assert.deepEqual(filterSongsByLanguage([],"English"),[]));
test("validates missing title and artist",()=>assert.deepEqual(validateSong({title:" ",artist:""}),["Title is required.","Artist is required."]));
test("valid record passes",()=>assert.deepEqual(validateSong({title:"Demo",artist:"Artist"}),[]));
test("malformed song rejected",()=>assert.deepEqual(validateSong(null),["Song must be an object."]));
test("non-string language rejected",()=>assert.deepEqual(validateSong({title:"Demo",artist:"A",language:7}),["Language must be a string when provided."]));
test("search does not mutate input",()=>{const before=structuredClone(songs);searchSongs(songs,"ocean");assert.deepEqual(songs,before)});
