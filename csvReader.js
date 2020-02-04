const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');

const distributors ={
  '*': 'RMATV',
  '#': 'AutoDist',
  '/': 'Tucker'
}
// const makes = ['Aprilia', 'Arctic Cat', 'Argo Atv', 'BETA', 'BMW', 'Bombardier', 'Buell', 'Cagiva', 'Can-Am', 'Cannondale', 'CF-Moto', 'Ducati', 'E-TON', 'GAS GAS', 'Harley-Davidson', 'Honda', 'Husaberg', 'Husqvarna', 'Hyosung', 'Indian', 'Kasea', 'Kawasaki', 'KTM', 'Kubota', 'KYMCO', 'Mercury', 'Moto Guzzi', 'MV Agusta', 'MZ', 'Pagsta Motors', 'Piaggio', 'Polaris', 'Renault', 'Sea-Doo', 'Ski-Doo', 'Sno-Jet', 'Suzuki', 'Triumph', 'Vespa', 'Victory', 'Yamaha']
const makes = [
    'Arctic Cat',
    'Argo Atv',
    'GAS GAS',
    'Moto Guzzi',
    'MV Agusta',
	'Pagsta Motors', 
	'Gas Gas', 
	'CF Moto',
	'Harley Davidson',
	'arctic Cat',
	'ARCTIC CAT',
	'Ski Doo',
	'John Deere'
]
let csvData = [];
let products = [];
let fitments = [];
// let makeFixes = [];
let needFix = [];

const filepath = path.resolve(`mastersheetFinal.csv`);
const file = fs.createReadStream(filepath)
papa.parse(file, {
	header: true,
	skipEmptyLines: true,
	complete: function(results, file) {
		let fixFilePath = path.resolve('cleanedMakeFixes.csv')
		let fixFile = fs.createReadStream(fixFilePath)
		csvData = results.data;
		console.log(`Data length:`, csvData.length);
		// papa.parse(fixFile, {
		// 	header: true,
		// 	skipEmptyLines: true,
		// 	complete: (res, file) => {
		// 		makeFixes = res.data
		// 		console.log('makeFixes length:', makeFixes.length)
				let tempTitles = [];
				let productId = 0
	
				csvData.forEach(row => {
					let prodTitle = row['Product Name'].split(' for ');
					let skuStr = row['SKU'].split('-')[0]
					let distMarker = skuStr[skuStr.length -1]
					if (!tempTitles.includes(prodTitle[0])) {
						productId++
						tempTitles.push(prodTitle[0]);
						let product = {
							item_name: prodTitle[0],
							main_image_url: row['Image 1'],
							product_description: row['Description'],
							manufacturer: row['Manufacturer'],
							distributor: distributors[distMarker],
							brand: row['Brand'],
							bullet_point1: row['Bullet 1'],
							bullet_point2: row['Bullet 2'],
							bullet_point3: row['Bullet 3'],
							bullet_point4: row['Bullet 4'],
							bullet_point5: row['Bullet 5'],
							product_id: productId
						} 
						// console.log(product)
						products.push(product);
						
						if(prodTitle[1]){
							let year;
							let make;
							let model;
							let ebayModel;
							let modelYear;
							make = prodTitle[1].trim().split(' ')[0]
							modelYear = prodTitle[1].split(make)
							makes.forEach(item => {
								if(prodTitle[1].includes(item)) {
									make = item;
									modelYear = prodTitle[1].split(make)
								} 
							})
							if(parseInt(modelYear[1].split(' ').pop()) > 1900) {
								let modelArr = modelYear[1].split(' ');
								year = modelArr.pop();
								model = modelArr.join(' ').trim();
								
							} else if(modelYear[1].includes('  ')){
								let tempRow = modelYear[1].split('  ');
								let modelArr = tempRow[0].split(' ');
								year = modelArr.pop();
								model = modelArr.join(' ').trim();
							} else  {
								year = '';
								model = modelYear[1].trim()
							}
							
							if(!model) needFix.push(row)
							// makeFixes.forEach(fix => {
							// 	if (model && fix.bad ===model.trim()){
							// 		// console.log('found one', prodTitle[1], model, fix)
							// 		ebayModel = fix.good
							// 	} 
							// })
							if (year.includes('-')){
								// console.log(year)
								let yearRange = year.split('-');
								let year1 = parseInt(yearRange[0]);
								let year2 = parseInt(yearRange[1]);
								for (let j = year1; j <= year2; j++){
									let fitment = {
										product_id: productId,
										price: row['Price'],
										list_price: row['List Price'],
										item_sku:row['SKU'],
										part_number: row['MPN'],
										make,
										model,
										year: j,
										ebayModel: ebayModel ? ebayModel : '',
										vehicle_type: '',
										motorcycle_type: '',
										epid: ''
									}
									fitments.push(fitment);
								}
							} else {
								let fitment = {
									product_id: productId,
									price: row['Price'],
									list_price: row['List Price'],
									item_sku:row['SKU'],
									part_number: row['MPN'],
									make,
									model,
									year,
									ebayModel: ebayModel ? ebayModel : '',
									vehicle_type: '',
									motorcycle_type: '',
									epid: ''
								}
								fitments.push(fitment)
							}
						} 
					} 
					else {
						if(prodTitle[1]){
							let year;
							let make;
							let model;
							let ebayModel;
							let modelYear;
							make = prodTitle[1].trim().split(' ')[0]
							modelYear = prodTitle[1].split(make)
							makes.forEach(item => {
								if(prodTitle[1].includes(item)) {
									make = item;
									modelYear = prodTitle[1].split(make);
								} 
							})
							if(parseInt(modelYear[1].split(' ').pop()) > 1900) {
								let modelArr = modelYear[1].split(' ');
								year = modelArr.pop();
								model = modelArr.join(' ').trim();
							} else if(modelYear[1].includes('  ')){
								let tempRow = modelYear[1].split('  ');
								let modelArr = tempRow[0].split(' ');
								year = modelArr.pop();
								model = modelArr.join(' ').trim();
							} else {
								year = '';
								model = modelYear[1].trim()
							}
							if(!model) needFix.push(row)
							// makeFixes.forEach(fix => {
							// 	if (model && fix.bad === model.trim()){
							// 		// console.log('found one', prodTitle[1], model, fix)
							// 		ebayModel = fix.good
							// 	} 
							// })
							if (year.includes('-')){
								// console.log(year)
								let yearRange = year.split('-');
								let year1 = parseInt(yearRange[0]);
								let year2 = parseInt(yearRange[1]);
								for (let k = year1; k <= year2; k++){
									let fitment = {
										product_id: products.find(prod => prod.item_name === prodTitle[0]).product_id,
										price: row['Price'],
										list_price: row['List Price'],
										item_sku:row['SKU'],
										part_number: row['MPN'],
										make,
										model,
										year: k,
										ebayModel: ebayModel ? ebayModel : '',
										vehicle_type: '',
										motorcycle_type: '',
										epid: ''
									}
									
									fitments.push(fitment)
								}
							} else{
								let fitment = {
									product_id: products.find(prod => prod.item_name === prodTitle[0]).product_id,
									price: row['Price'],
									list_price: row['List Price'],
									item_sku:row['SKU'],
									part_number: row['MPN'],
									make,
									model,
									year,
									ebayModel: ebayModel ? ebayModel : '',
									vehicle_type: '',
									motorcycle_type: '',
									epid: ''
								}
								fitments.push(fitment)
							}
						}
					}
				})
				console.log('MADE IT!!');
				// console.log(products.length);
				// console.log('PRODUCTS',products.slice(0,2));
				console.log(fitments.length);
				console.log('fitments',fitments.slice(0,2));
	
				const fixToWrite = papa.unparse(needFix, {skipEmptyLines:true});
				const fitmentsToWrite = papa.unparse(fitments, {skipEmptyLines:true});
				const productsToWrite = papa.unparse(products, {skipEmptyLines:true});

				fs.writeFile('dbFitmentsFinal.csv', fitmentsToWrite, (err) => {
					if (err){
							console.log(err);
					}
				})

				fs.writeFile('needFix.csv', fixToWrite, (err) => {
					if (err){
							console.log(err);
					}
				})

				fs.writeFile('needFix.csv', fixToWrite, (err) => {
					if (err){
							console.log(err);
					}
				})
				
				
		// 	}
				
		// })
	}
})