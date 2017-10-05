var engine = require('./engine');
var fs = require('fs');
var rmdirSync = require('rmdir-sync');;
var touch = require('touch');

// clear
rmdirSync('download');
fs.mkdirSync('download');
touch('download/.gitkeep');

const name = process.argv[2];
const path = process.argv[3];
const start = process.argv[4];
const end = process.argv[5];

engine.startByFile(name, path, start, end);