const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
// const player = require('play-sound')

const indexPath = path.resolve('ebayModelIndex.csv');
const indexFile = fs.createReadStream(indexPath)
const modelsPath = path.resolve('dZoneMakes&ModelsVer8.csv');
const modelsFile = fs.createReadStream(modelsPath);

const options = {
    shouldSort: true,
    includeScore: true,
    tokenize: true,
    threshold: 0.6,
    location: 0,

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
        models.forEach((row, i) => {
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
                // console.log(indexObj);
                // console.log(keys);
                keys.forEach(key => {
                    // console.log(indexObj[key].index);
                    const fuse = new Fuse(indexObj[key].index, options);
                    indexObj[key].modelsToFix.forEach(model => {
                        // console.log(model)
                        let result ={
                            make: key,
                            model,
                        }
                        let modelNum = /\d{2,}/.test(model) ? model.match(/\d{2,}/)[0] : false
                        // if (model.length > 24) {
                        //     model = model.substring(0, model.length/2);
                        //     console.log(model)
                        // }
                        
                        let resultArr = fuse.search(model);
                        if (resultArr[0]) {
                            let modelNumMatchFound = false;
                            for (let i =0; i < resultArr.length; i++){
                                if (/\d{2,}\D+\d{2,}/.test(resultArr[i].item.model)) console.log(resultArr[i].item.model)
                                if (/\d{2,}/.test(resultArr[i].item.model) && modelNum) {
                                    let indexNum = resultArr[i].item.model.match(/\d{2,}/)[0]
                                    // console.log(modelNum);
                                    if (modelNum.includes(indexNum)) {
                                        console.log('Match FOUND!:', model, resultArr[i].item.model)
                                        searchResults.push({...result, 
                                            closestMatch: resultArr[i].item.model,
                                            score: resultArr[i].score,
                                            numberMatched: true,
                                        }) 
                                        modelNumMatchFound = true;
                                        break
                                    }
                                } 

                            }

                            if (!modelNumMatchFound) {
                                searchResults.push({...result, 
                                    closestMatch: resultArr[0].item.model,
                                    score: resultArr[0].score,
                                    numberMatched: false
                                })
                            }
                        } else {
                            searchResults.push({...result, 
                                closestMatch: 'No Matches'
                            })
                        }
                        // console.log(resultRow);
                    })
                    
                })
                
                console.log('done searching')
                const resultsToWrite = papa.unparse(searchResults)
                //    const noMatchToWrite = papa.unparse(noMatches)

                fs.writeFile('searchResultsVer8-4.csv', resultsToWrite, (err) => {
                    if (err){
                            console.log(err);
                    }
                })
                console.log('Success!')
                // fs.writeFile('noMatches.csv', noMatchToWrite, (err) => {
                //     if (err){
                //             console.log(err);
                //     }
                // })
            }
        })
    }
})