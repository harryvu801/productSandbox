const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
// const player = require('play-sound')

const indexPath = path.resolve('ebayPowerSportsMasterList.csv');
const indexFile = fs.createReadStream(indexPath)
const modelsPath = path.resolve('searchTestBatch1.csv');
const modelsFile = fs.createReadStream(modelsPath);

const options = {
    shouldSort: true, 
    tokenize: true,
    threshold: 0.5,
    findAllMatches: true,
    keys: ["Make", "Model"],
};

const searchResults = []; 
const noMatches = []

papa.parse(indexFile, {
    delimiter: ',',
    header: true, 
    skipEmptyLines: true,
    complete: (results, file) => {
        const index = results.data;
        console.log('index parse complete')
        console.log(index.slice(0,2));
        
        const fuse = new Fuse(index, options)
        
        papa.parse(modelsFile, {
            header: true,
            skipEmptyLines: true,
            complete: (res, file) => {
                const models = res.data
                console.log('models parse complete');
                console.log(models.slice(0, 2));
                const sample = models.slice(0, 2000)
           
                sample.forEach((item, id) => {
                    console.log(item.searchTerm);
                    const matches = fuse.search(item.searchTerm);
                    const searchResultRow = {
                        searchTerm: item.searchTerm, 
                        closestMatch: matches[0] ? matches[0]['Model'] : 'No Match Found',
                        second: matches[1] ? matches[1]['Model'] : 'No Match',
                        third: matches[2] ? matches[2]['Model'] : 'No Match',
                    }
                    console.log(id, searchResultRow);
                    searchResults.push(searchResultRow)
                    if(matches.length < 1) {
                        noMatches.push(searchResultRow)
                    }
                })
            //    console.log(searchResults);
            //    const resultsToWrite = papa.unparse(searchResults)
            //    const noMatchToWrite = papa.unparse(noMatches)

            //    fs.writeFile('searchResults.csv', resultsToWrite, (err) => {
            //     if (err){
            //             console.log(err);
            //     }
            //     })
            //     fs.writeFile('noMatches.csv', noMatchToWrite, (err) => {
            //         if (err){
            //                 console.log(err);
            //         }
            //     })
            }
        })
    }
})