// ok.
/**
 * - i want to read through every line that starts with '- ✅' or '- 🎵'
 * - (because i want to catch one's NOT from the beatles, and also to know if we're missing any due to punctuation edge cases)
 *
 * - and then I want to group them, according to the names of songs from beatles albums
 * - So we ultimately have something like...
 *
 * {
 *   "rubber soul": {
 *     "drive my car": ["Ch. 4, p. 131", "Ch. 7, p. 255"],
 *     ...
 *   }
 * }
 */

const { readFileSync, writeFileSync } = require("fs");

const songsText = readFileSync("./ALL_SONGS.MD", "utf-8");
const notesText = readFileSync("./README.MD", "utf-8");

const numberOfSongsPerAlbum = [
  14,
  14,
  13,
  14,
  14,
  14,
  14,
  13, // ah, had a wrong number, whoops
  11,
  30,
  6,
  17,
  12,
  8, // extras
];

// console.log(songsText.slice(0, 50));

// Ahhh the "m" is crucial -- it means "multiline"!
const songRegex = /^\d+\.\s.+$/gm;

const albumsRegex = /^##\s.*$/gm;

const songMatches = songsText.match(songRegex);
const albumMatches = songsText
  .match(albumsRegex)
  .map((l) => l.slice(3, l.indexOf("(") - 1));

const songInnerRegex = /"([^"]+)"/g;

const allSongs = songMatches.map((line) => {
  const match = line.match(songInnerRegex);
  // return match ? match[1] : null;
  return match ? match[0].replace(/"/g, "") : null;
  //   return match;
});
//   .filter(Boolean);

// console.log(songMatches.length);
// console.log(allSongs.slice(-10));
// console.log(albumMatches);

const finalObject = {};

let count = 0;
let albumIdx = 0;
let songIdx = 0;
albumMatches.forEach((album) => {
  //   console.log("album:", album, albumIdx, numberOfSongsPerAlbum[albumIdx]);
  finalObject[album] = {};
  while (count < numberOfSongsPerAlbum[albumIdx]) {
    const song = allSongs[songIdx];
    // if (album === "Extr")
    //   console.log(song, "and", songIdx, allSongs[songIdx]);
    songIdx++;
    finalObject[album][song] = [];
    count++;
  }
  albumIdx++;
  count = 0;
});

console.log(finalObject);

// const songSet = new Set();
// allSongs.forEach((song) => {
//   const sanitizedSong = song.trim().toLocaleLowerCase();
//   songSet.add(sanitizedSong);
// });

// Phew. Ok. Finally we can take this and use it to store everything, when we run through each line of notesText.

console.log(notesText.slice(0, 50));
console.log("Total songs", allSongs.length);

const notesLines = notesText.split("\n");

console.log(notesLines.length);
let dontGot = 0;
let got = 0;
notesLines.forEach((line) => {
  if (line.trim().includes("✅") || line.trim().includes("🎵")) {
    // console.log("Got a live one", line.trim().slice(5));
    let sanitizedSongName = line.trim().slice(4).trim().toLocaleLowerCase();
    // Heck yeah, that catches like 60 more.
    // Now we have 222, don't have 84. That almost sounds right.
    if (sanitizedSongName.startsWith("_")) {
      sanitizedSongName = sanitizedSongName.slice(1);
    }

    if (
      allSongs.some((song) => {
        return sanitizedSongName.startsWith(song.trim().toLocaleLowerCase());
      })
    ) {
      // console.log("We got it", song);
      const songName = allSongs.find((s) =>
        sanitizedSongName.startsWith(s.trim().toLocaleLowerCase())
      );
      const album = Object.keys(finalObject).find((k) =>
        Object.keys(finalObject[k]).includes(songName)
      );
      //   console.log(album);

      if (!album) {
        console.log("We don't have album...", songName);
        return;
      }
      // Lol idk what info to put here, so for now putting "x"
      finalObject[album][songName] = finalObject[album][songName].concat("x");
      got++;
    } else {
      dontGot++;
      //   console.log("Don't got", sanitizedSongName);
    }

    // if (songSet.has(sanitizedSongName)) {
    //   console.log("We got it!", sanitizedSongName);
    //   got++;
    // } else {
    //   console.log("We don't got it!", sanitizedSongName);
    //   dontGot++;
    // }
  }
});

console.log(dontGot, got);

// Ok we got 222, Don't got 84. Almost sounds right.
// Ok nice, got it to 229 / 77. Feels really right. Lot of early covers, and some mention of others' songs.
// We have 195 total Beatles songs in the mix. Ok.
// Ok so now let's see how many we've hit... and how many are empty....
// I'd bet about 2/3 of them are "hit" right now, say, 130. With 65 empty. That's my guess.

// Oh i'm realizing now... we'll have to extract the page numbers somehow... by writing them...
// we could theoretically extract the chapter numbers... but i'm not going to do that right now.

let empty = 0;
let commented = 0;

// let c1 = 0;
// let c2 =0;
// let c3=0;

let counts = {
  0: 0,
  1: 0,
  2: 0,
};

Object.keys(finalObject).forEach((album) => {
  const songs = finalObject[album];

  Object.keys(songs).forEach((song) => {
    // if (songs[song].length > 0) {
    //   commented++;
    // } else {
    //   empty++;
    // }
    const commentCount = songs[song].length;
    counts[commentCount] = (counts[commentCount] || 0) + 1;
  });
});

console.log({ empty, commented });

console.log("COMMENT COUNTS PER SONG:");
console.log(counts);
