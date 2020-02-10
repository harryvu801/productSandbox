const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');

const listpath = path.resolve('listings_020620 (1).csv')
const sheetpath = path.resolve('uploadSheet.csv')
const file = fs.createReadStream(listpath);
const sheetfile = fs.createReadStream(sheetpath);
const edit = []

papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  complete: (results, file) => {
    const data = results.data;
    // console.log('done', data);
    papa.parse(sheetfile, {
      header: true,
      skipEmptyLines:true,
      complete: (res) => {
        const items = res.data;
        // console.log('done', items);

        items.forEach(item => {
          console.log({...item, Description: ''});
          let match = data.find(listing => listing['Custom label'] == item.CustomLabel);
          edit.push({
            'Action(SiteID=eBayMotors|Country=US|Currency=USD|Version=941)': 'Revise',
            itemID: match['Item number'],
            Description: item.Description
          })
        })

        const csvString = papa.unparse(edit)
        fs.writeFile('editSheet.csv', csvString, (err) => {
          if(err) console.log(err);
        })
        console.log('DONE!')
      }
    })
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