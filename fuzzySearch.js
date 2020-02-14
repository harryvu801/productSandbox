const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
// const player = require('play-sound')

const indexPath = path.resolve('ebayModelIndex.csv');
const indexFile = fs.createReadStream(indexPath)
const modelsPath = path.resolve('dZoneMakes&modelsVer6.csv');
const modelsFile = fs.createReadStream(modelsPath);

const options = {
    shouldSort: true, 
    tokenize: true,
    threshold: 0.6,
    findAllMatches: true,
    keys: ['model'],
};

const indexObj = {};
const searchResults = [];


papa.parse(modelsFile, {
    delimiter: ',',
    header: true, 
    skipEmptyLines: true,
    complete: (results, file) => {
        const models = results.data;
        console.log('models parse complete')
        // console.log(models.slice(0,2));
        models.forEach(row => {
            indexObj[row.make] ? indexObj[row.make].modelsToFix.push(row.model) : indexObj[row.make] = {index:[], modelsToFix: [row.model]}
        })
        // console.log(indexObj);
        
        papa.parse(indexFile, {
            header: true,
            skipEmptyLines: true,
            complete: (res, file) => {
                const index = res.data
                console.log('index parse complete');
                // console.log(index.slice(0, 2));
                const sample = index.slice(0, 2000)
                
                index.forEach((item, id) => {
                    if (indexObj[item.make]) indexObj[item.make].index.push({model:item.model})
                })
                const keys = Object.keys(indexObj);
                console.log(indexObj);
                // console.log(keys);
                keys.forEach(key => {
                    // console.log(indexObj[key].index);
                    const fuse = new Fuse(indexObj[key].index, options);
                    indexObj[key].modelsToFix.forEach(model => {
                        let result = fuse.search(model);
                        // console.log(result);
                        let resultRow ={
                            make: key,
                            model,
                            closetMatch: result[0] ? result[0].model : "no match",
                            second: result[1] ? result[1].model : "no match",
                            third: result[2] ? result[2].model : "no match",
                        }
                        console.log(resultRow);
                        searchResults.push(resultRow)
                    })
                    
                })

                const resultsToWrite = papa.unparse(searchResults)
            //    const noMatchToWrite = papa.unparse(noMatches)

                fs.writeFile('searchResults.csv', resultsToWrite, (err) => {
                    if (err){
                            console.log(err);
                    }
                })
                // fs.writeFile('noMatches.csv', noMatchToWrite, (err) => {
                //     if (err){
                //             console.log(err);
                //     }
                // })
            }
        })
    }
})