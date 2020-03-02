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
                    indexObj[key].modelsToFix.forEach(model => {
                        // console.log(model)
                        let result ={
                            make: key,
                            model: model.trim(),
                        }
                        let modelNum = /\d{3,}/.test(model) ? model.match(/\d{3,}/)[0] : false
                        
                        if (modelNum) {
                            // console.log(model)
                            const fuse = new Fuse(indexObj[key].index, {
                                ...options,
                                includeScore: false,
                            });
                            // console.log(modelNum)
                            let firstRes = fuse.search(modelNum);
                            // console.log(firstRes)
                            const secondInd = firstRes.filter(e => {
                                return /\d{3,}/.test(e.model) ? e.model.match(/\d{3,}/)[0] === modelNum : false
                            });
                            // console.log(secondInd)
                            const secondFuse = new Fuse(secondInd, options);
                            let secondRes = secondFuse.search(model);
                            if(!secondRes[0]) console.log(model, firstRes, secondInd)

                            let searchResult = {...result, 
                                closestMatch: secondRes[0] ? secondRes[0].item.model : 'No Match',
                                score: secondRes[0] ? secondRes[0].score: 'N/A',
                                second: secondRes[1] ? secondRes[1].item.model : 'No Match',
                                score2: secondRes[1] ? secondRes[1].score: 'N/A',
                                third: secondRes[2] ? secondRes[2].item.model : 'No Match',
                                score3: secondRes[2] ? secondRes[2].score: 'N/A',
                                numberMatched: true,
                            }
                            // console.log(searchResult);
                            searchResults.push(searchResult)
                        } else {
                            const fuse = new Fuse(indexObj[key].index, options);
                            let resultsArr = fuse.search(model);
                            // console.log(resultsArr)

                            let searchResult = {...result, 
                                closestMatch: resultsArr[0] ? resultsArr[0].item.model : 'No Match',
                                score: resultsArr[0] ? resultsArr[0].score : 'N/A',
                                second: resultsArr[1] ? resultsArr[1].item.model : 'No Match',
                                score2: resultsArr[1] ? resultsArr[1].score : 'N/A',
                                third: resultsArr[2] ? resultsArr[2].item.model : 'No Match',
                                score3: resultsArr[2] ? resultsArr[2].score : 'N/A',
                                numberMatched: false,
                            }
                            searchResults.push(searchResult)
                            // console.log(searchResult);
                        }
                    })
                    
                })
                


                console.log('done searching')
                const resultsToWrite = papa.unparse(searchResults)
                
                // fs.writeFile('searchResultsVer8-9.csv', resultsToWrite, (err) => {
                //     if (err){
                //         console.log(err);
                //     }
                // })
                console.log('Success!')
                const viableResults = searchResults.filter(x => x.score <= 0.4)
                console.log(viableResults.length)
                const ebayConverterVer1 = papa.unparse(viableResults)
                fs.writeFile('ebayConverterVer1.csv', ebayConverterVer1, (err) => {
                    if (err){
                        console.log(err);
                    }
                })
            }
        })
    }
})