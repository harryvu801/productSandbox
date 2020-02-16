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
    includeScore: true,
    tokenize: true,
    threshold: 0.5,
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
            // console.log(row)
            if (row.model.includes('2x4')) {
                // console.log('old: ', row.model)
                let strInd = row.model.indexOf('2x4')
                row.model = row.model.split('')
                row.model.splice(strInd, 3);
                models[i].model = row.model.join('')
                // console.log('new ', models[i].model)
            }
            if (row.model.includes('4x4')) {
                // console.log('old: ', row.model)
                let strInd = row.model.indexOf('4x4')
                row.model = row.model.split('')
                row.model.splice(strInd, 3);
                models[i].model = row.model.join('')
                // console.log('new ', models[i].model)
            }
            if (row.model.includes('6x6')) {
                // console.log('old ', row.model)
                let strInd = row.model.indexOf('6x6')
                row.model = row.model.split('')
                row.model.splice(strInd, 3);
                models[i].model = row.model.join('')
                // console.log('new ', models[i].model)
            }
            if (row.model.includes('8x8')) {
                // console.log('old ', row.model)
                let strInd = row.model.indexOf('8x8')
                row.model = row.model.split('')
                row.model.splice(strInd, 3);
                models[i].model = row.model.join('')
                // console.log('new ', models[i].model)
            }
            if (row.model.includes(' w/')) {
                // console.log({old:row.model, good:row.model.slice(0, row.model.indexOf(' w/'))})
                models[i].model = row.model.slice(0, row.model.indexOf(' w/'));
            }
            if (row.model.includes('(')) {
                // console.log('old ', row.model)
                let strIndStart = row.model.indexOf('(')
                let strIndEnd = row.model.indexOf(')')
                row.model = row.model.split('')
                row.model.splice(strIndStart, strIndEnd);
                models[i].model = row.model.join('')
                // console.log('new ', row.model)
            }
            if(row.model.includes('/')) {
                console.log(models[i].model)
            }
            // if (models[i].model.includes('2x4') || models[i].model.includes('4x4') || models[i].model.includes('6x6') || models[i].model.includes('8x8'))console.log(models[i].model)
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
                        // let modelNum = model.match(/\d+/g)
                        // console.log(model)
                        let resultArr = fuse.search(model);
                        let resultRow ={
                            make: key,
                            model,
                            closetMatch: resultArr[0] ? resultArr[0].item.model : "no match",
                            score1: resultArr[0] ? resultArr[0].score : "N/A",
                            second: resultArr[1] ? resultArr[1].item.model : "no match",
                            score2:  resultArr[1] ? resultArr[1].score : "N/A",
                            third: resultArr[2] ? resultArr[2].item.model : "no match",
                            score3:  resultArr[2] ? resultArr[2].score : "N/A",
                        }
                        // console.log(resultRow);
                        searchResults.push(resultRow)
                    })
                    
                })
                
                console.log('done searching')
                const resultsToWrite = papa.unparse(searchResults)
                //    const noMatchToWrite = papa.unparse(noMatches)

                fs.writeFile('searchResults3.csv', resultsToWrite, (err) => {
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