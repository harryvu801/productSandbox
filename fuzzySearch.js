const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
// const player = require('play-sound')

const indexPath = path.resolve('modelIndex.csv');
const indexFile = fs.createReadStream(indexPath)
const modelsPath = path.resolve('uniqueModels.csv');
const modelsFile = fs.createReadStream(modelsPath);

const options = {
    shouldSort: true, 
    tokenize: true,
    findAllMatches: true,
    threshold: 0.8,
    keys: ['index'],
    location: 0
    // includeScore: true
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
        
        const fuse = new Fuse(index, options)
        
        // const searchResult = fuse.search('XT1200 Super Tenere')
        // console.log(searchResult);
        papa.parse(modelsFile, {
            header: true,
            skipEmptyLines: true,
            complete: (res, file) => {
                console.log('models parse complete');
                const models = res.data
                const sample = models.slice(0, parseInt(models.length/4))
            //     .forEach(row => {
            //         // console.log(row)
            //        if (!models.includes(row.model)) {
            //            console.log(row.model)
            //         //    models.push(row.model)
            //         //    uniqueModels.push({model: row.model})
            //        }
            //     });
            //    console.log('sort complete')
               
            //    console.log(uniqueModels)
            //    const uniqueModelsString = papa.unparse(uniqueModels, {
            //        skipEmptyLines: true,
            //    })
            //    fs.writeFile('uniqueModels.csv', uniqueModelsString, (err) => {
            //     if (err) console.log(err);
            //     console.log('writeFile complete')
            //     })
                models.map((item, id) => {
                    const matches = fuse.search(item.model);
                    const searchResultRow = {...item, 
                        closestMatch: matches[0] ? matches[0].index : 'No Match Found',
                        second: matches[1] ? matches[1].index : 'No Match',
                        third: matches[2] ? matches[2].index : 'No Match',
                    }
                    searchResults.push(searchResultRow)
                    console.log(id, searchResultRow);
                    if(matches.length < 1) {
                        noMatches.push(searchResultRow)
                    }
                })
            //    console.log(searchResults);
               const resultsToWrite = papa.unparse(searchResults)
               const noMatchToWrite = papa.unparse(noMatches)

               fs.writeFile('searchResults.csv', resultsToWrite, (err) => {
                if (err){
                        console.log(err);
                }
                })
                fs.writeFile('noMatches.csv', noMatchToWrite, (err) => {
                    if (err){
                            console.log(err);
                    }
                })
            }
        })
    }
})