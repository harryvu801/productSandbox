const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');

// CREATES ARRAY OF MULTI WORD MAKES
const makes = ['Aprilia', 'Arctic Cat', 'Argo Atv', 'BETA', 'BMW', 'Bombardier', 'Buell', 'Cagiva', 'Can-Am', 'Cannondale', 'CF-Moto', 'Ducati', 'E-TON', 'GAS GAS', 'Harley-Davidson', 'Honda', 'Husaberg', 'Husqvarna', 'Hyosung', 'Indian', 'Kasea', 'Kawasaki', 'KTM', 'Kubota', 'KYMCO', 'Mercury', 'Moto Guzzi', 'MV Agusta', 'MZ', 'Pagsta Motors', 'Piaggio', 'Polaris', 'Renault', 'Sea-Doo', 'Ski-Doo', 'Sno-Jet', 'Suzuki', 'Triumph', 'Vespa', 'Victory', 'Yamaha']
const multiWord = [];
makes.forEach(make => {
  if(make.split(' ').length > 1) {
    multiWord.push(make)
  }
})
console.log(multiWord)

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