const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');

const filePath = path.resolve('ebayPowerSportsMasterList.csv')
const file = fs.createReadStream(filePath);

const modelList = [];
const modelData = [];

papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  complete: (results, file) => {
    const data = results.data
    console.log('parsing done', data.length);

    // data.forEach((row, index) => {
    //   let fitmentArr = row['Product Name'].toLowerCase().split(' for ')[1].split(' ');
    //   fitmentArr.pop();
    //   row.searchTerm = fitmentArr.join(' ');
    //   console.log(row.searchTerm);
    // })
    data.forEach((row, index) => {
      if(!modelList.includes(row.Model)) {
        modelList.push(row.Model)  ;
        modelData.push({make: row.Make, model: row.Model})    
      }
    })
    console.log('sorting done');

    const csv1 = papa.unparse(modelData);
    fs.writeFile('modelIndex.csv', csv1, (err) => {
      if(err) console.log(err);
    })
    console.log('writing done')

    console.log('Success!')
  }
})

// CREATES ARRAY OF MULTI WORD MAKES
// const makes = ['Aprilia', 'Arctic Cat', 'Argo Atv', 'BETA', 'BMW', 'Bombardier', 'Buell', 'Cagiva', 'Can-Am', 'Cannondale', 'CF-Moto', 'Ducati', 'E-TON', 'GAS GAS', 'Harley-Davidson', 'Honda', 'Husaberg', 'Husqvarna', 'Hyosung', 'Indian', 'Kasea', 'Kawasaki', 'KTM', 'Kubota', 'KYMCO', 'Mercury', 'Moto Guzzi', 'MV Agusta', 'MZ', 'Pagsta Motors', 'Piaggio', 'Polaris', 'Renault', 'Sea-Doo', 'Ski-Doo', 'Sno-Jet', 'Suzuki', 'Triumph', 'Vespa', 'Victory', 'Yamaha']
// const multiWord = [];
// makes.forEach(make => {
//   if(make.split(' ').length > 1) {
//     multiWord.push(make)
//   }
// })
// console.log(multiWord)

// COMBINED THE MASTER SHEETS INTO ONE
// let csvData = [];

// for (let i = 1; i <= 3; i++) {
//   const filepath = path.resolve(`mastersheet${i}.csv`);
//   const file = fs.createReadStream(filepath);
  
// 	papa.parse(file, {
// 		header: true,
// 		complete: (results, file) => {
//       console.log(csvData)
//       csvData = csvData.concat(results.data);
// 			console.log(`Data length:`, csvData);
// 			if (csvData.length > 400000) {
//         const dataStr = papa.unparse(csvData, {skipEmptyLines:true})
//         fs.writeFile('mastersheetFinal.csv', dataStr, (err) => {
//           if(err) throw err;
//           console.log('success')
//         })
//       }
//     }
//   })
// }