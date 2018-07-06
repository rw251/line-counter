const glob = require('glob');
const fs = require('fs');

const getFiles = (src, extension, callback) => {
  glob(src + '/**/*.' + extension, callback);
};

const extensions = ['js','scss','jade','bat','sql'];
const dirs = ['app','server','shared','deploy'];
const application = 'pingr';
// app:       js:7851     scss:3217   jade:800
// server:    js:4274                 jade:1109
// shared:    js:48
// deploy:    js:29884                            bat:638     sql:28865

// const extensions = ['cs','bat','sql'];
// const dirs = ['Batches', 'ReportDataExtractor'];
// const application = 'safety-data-importer';
// Batches:                            bat:522     sql:4634
// ReportDataExtractor:    cs:1277                 sql:3194

// const extensions = ['js','html','css','bat'];
// const dirs = ['packages','packages/dashboard/server','server','importer'];
// const application = 'safety-dash';
// packages:                  js:6506     html:1233   css:370
// packages/dashboard/server: js:2874
// server:                    js:1003     html:170
// importer:                  js:46067                            bat:10

const maxDirLength = dirs.reduce((prev, cur) => {
  if(cur.length > +prev) return cur.length;
  return prev;
},0);
const output = {};
let todo = 0;
let done = 0;
let dirDone = 0;

dirs.forEach((dir) => {
  output[dir] = {};
  extensions.forEach((ext) => {
    output[dir][ext] = { files: {}, count: 0};
    getFiles(`../${application}/${dir}`, ext, (err, res) => {
      dirDone++;
      if (err) {
        console.log('Error', err);
      } else {
        res.forEach((file) => {
          todo++;
          output[dir][ext].files[file] = 0;
          fs.createReadStream(file)
            .on('data', function(chunk) {
              for (i=0; i < chunk.length; ++i)
                if (chunk[i] == 10) output[dir][ext].files[file]++;
            })
            .on('end', function() {
              done++;
              output[dir][ext].count += output[dir][ext].files[file];
              if(done === todo && dirDone === dirs.length * extensions.length) {
                dirs.forEach((d) => {
                  let line = `${d}:`;
                  while(line.length < maxDirLength+5) {
                    line += ' ';
                  }
                  extensions.forEach((e) => {
                    let linebit = '';
                    if(output[d][e].count > 0) {
                      linebit += `${e}:${output[d][e].count} `;
                    }
                    while(linebit.length < 12) {
                      linebit += ' ';
                    }
                    line += linebit;
                  });
                  console.log(line);
                });
              }
            });
        });
      }
    });
  });
});
