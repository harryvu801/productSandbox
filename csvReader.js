const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');

const distributors ={
  '*': 'RMATV',
  '#': 'AutoDist',
  '/': 'Tucker'
}
const makes = ["Suzuki","Honda","Yamaha","Polaris","Adly Moto","Aeon","AJS","All American Choppers","Alouette","AlphaSports","Alta Motors","Amen Chassis Works","American Classic Motors","American Dirt Bike","American IronHorse","American Lifan Industry","American Motorcycle Corp.","Anarchy Motorcycles","APC Motorcycle Company","Apollo Choppers","Aprilia","Arch Motorcycle Company","Arctic Cat","Argo Atv","Ariel","ATK","Backroad Choppers","Bajaj","Benelli","Bennche","BETA","Big Bear Choppers","Big Boyz Custom Cycles","Big Dog","Big Inch Bikes","Big Tony's Chopp Shop","Bimota","Black Swamp Choppers","BMC","BMS MOTORSPORTS","BMW","Boa-Ski","Bobcat","Bolens","Bombardier","Borella","Boss Hoss","Bourget's Bike Works","Brammo","Bridgestone","Brough Superior","BSA","Buell","Bultaco","Cagiva","California Customs","California Scooter Co.","California Sidecar-Trike","Campagna","Can-Am","Cannondale","Carefree Custom Cycles","Carolina Custom Products","Case IH","CC Cycles","CCM","Cectek","CF-Moto","Champion Sidecars","Chaparral","Cheetah Trikes","Chop Shop Customs","Chopper Nation","Christini AWD Motorcycles","Chuck Wagon","Cleveland CycleWerks","ClubCar","Coast 2 Coast Choppers","Cobra Motorcycle","Cobra Trike","COLEMAN POWERSPORTS","Columbia","Confederate Motorcycle","Coonyz Customz","Covington Cycle City","CPI USA","CQR","Create A Custom Cycle","Cruise Dynamic","Cub Cadet","Cubi-K Scooters","Cushman","Cushman II","CZ","D.R.R.","Daelim","Darwin Motorcycles","Death Row Motorcycles","Demon Choppers","Denver Choppers","Derbi","Desperado","Detroit Brothers","Diablo","Diamo","Dirico Motorcycles USA","DKW/MZ","Dominion Motorcycle","Ducati","DURUXX","E-TON","EBR","Ecstasy","Ego Cycle","Energica Motor Company","Enfield","Evinrude","Excelsior-Henderson","EZ Go","EZ-Go","F.B.I. Motor Co.","Fischer","Flyrite Choppers","Flyscooters","FUZION MOTORS","GAS GAS","GEM","Genuine Scooter Co.","Glycing Motor Corp","Grandeur Manufacturing","Greeves","Hammerhead Off-Road","Hannigan","Harley-Davidson","Hisun Motors Corp USA","Hodaka","Husaberg","Husqvarna","Hyosung","Ice Bear Powersports","Illusion Cycles","Independence","Indian","Indian Motorcycle-Gilroy","Intrepid Cycles","Iron Eagle","Ironworks","Italika","Italjet (Childrens Minis)","Jawa/CZ","Jim Nasi Customs","John Deere","Johnny Pag","Johnson","Joyner USA","Kandi USA","Kaotic Customs","Kasea","Kawasaki","Kayo USA","Keeway","Kinetic","KIOTI","KTM","Kubota","KYMCO","Lambretta","Lance","Land Pride","Las Vegas Trikes","Laverda","Legends Motorsports","Lehman Trikes","LEM","Logic Motor Company","Mahindra","Maico","Manta","Marauder","Marrelli","Masai","Maserati","Massimo","Matchless","Mercury","Midwest Motor Vehicles","Milwaukee","Montesa","Moto Guzzi","Moto Morini","Moto-ski","Motor Trike","Motor-Piper","Motus Motorcycles","Mustang","MV Agusta","MZ","Natalia Scooters","Ness Motorcycles","New Holland","Norton","O.C. Choppers","Odes UTVs","Old School Motorcycle Co","Oreion Motors","Ossa","Pagsta Motors","Paramount Custom Cycles","Paul Yaffe Originals","Peirspeed","Penton","PGO","Piaggio","Polini","Power Chrome","Precision Cycle Works","Precision Powersports","Predator Motor Corp","Pro-One","Proper Chopper","QLINK","QTEC-ENGINEERING","Quadzilla","Raider","Rebel West Powersports","Recreatives Industries","Red Horse Motorworks","Redcat Motors","Redline","Redneck","Renault","Revolution Cycle Company","Rewaco","Rhino Motorcycles","Rickman","Ridley Motorcycle","Rival Motorsports","Road Hog","Roadsmith","Rokon","Royal Enfield","RTX","Rucker Performance","Rupp","S.P.C.N. Motorcycles","Sabertooth Motorcycles","Saxon Motorcycle","Schwinn","Scorpion Motorsports","SDG","Sea-Doo","Sears","Sebring Auto-Cycle","Sherco","Ski-Daddler","Ski-Doo","Ski-Whiz","Skiroule","Sno-Jet","Sno-Pony","Southwest Choppers","Spencer Bowman Customs","SS Trike","SSR Motorsports","Star EV","Steed Musclebike","Streamline Designs","Strociek","Suckerpunch Sallys","Supermach","Surgical-Steeds","Swift Motor Co.","SWM","SYM","T.G.B.","Tank Sports","Tanom Motors","Textron Off Road","The Auto Moto","Thoroughbred","Thunder Bikes","Thunder Mountain Cycles","TigerShark","Titan Motorcycle Co.","Tomberlin","Tomberlin Outdoor","Tomcar","Tomos","Trifun","Triumph","Twist-N-Go","Ultra Cycle","Unison Motors","United Motors","Ural","V8 Choppers","Vanderhall","Vectrix","Velocette","Veloz","Vengeance Motorcycles","Vento","Vespa","Victory","Viking","Vincent","Viper","Von Dutch Kustom Cycles","VOR","Wet Jet","Wild West","Wrath Manufacturing","Xtreme","XY Powersports","Yankee","ZAP","Zero","Zero Engineering","Zongshen","TM","Accurate Cycle Engineering","Lightning","Thunderbolt","HM"]
let productData = [];
let products = [];
let fitments = [];
const indexObj = {};
let fixed = 0;
let notFixed = 0;

const filepath = path.resolve(`productsVer9.csv`);
const file = fs.createReadStream(filepath)
const fixFilePath = path.resolve('ebayConverterVer1.csv')
const fixfile = fs.createReadStream(fixFilePath)

papa.parse(fixfile, {
	header: true,
	skipEmptyLines: true,
	complete: function(results) {
		makeFixes = results.data
		// console.log(makeFixes)
		makeFixes.forEach(x => {
			if (!indexObj.hasOwnProperty(x.make)) indexObj[x.make] = {};
			indexObj[x.make][x.model] = x.closestMatch 
		})
		console.log('fixes indexed')
		// console.log(indexObj)
		
		papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (res, file) => {
				productData = res.data;
				console.log(`Data length:`, productData.length);
				// console.log('modelFixes length:', makeFixes.length)
				// console.log(makes)
				let tempTitles = [];
				let productId = 0
				
				productData.forEach((row, rowIndex) => {
					console.log('row index', rowIndex)
					let prodTitle = row['Product Name'].split(' for ');
					let skuStr = row['SKU'].split('-')[0]
					let distMarker = skuStr[skuStr.length -1]
					if (!tempTitles.includes(prodTitle[0])) {
						// console.log('here1')
						productId++
						tempTitles.push(prodTitle[0]);
						let product = {
							item_name: prodTitle,
							main_image_url: row['Image 1'],
							category: row['Category'],
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
							// modelYear = prodTitle[1].split(make)
							makes.forEach(item => {
								if(prodTitle[1].includes(item)) {
									// console.log('here2', item)

									make = item;
									modelYear = prodTitle[1].split(make)
								} 
							})
							let modelArr = modelYear[1].split(' ');
							year = modelArr.pop();
							model = modelArr.join(' ').trim();
							if (indexObj.hasOwnProperty(make) && indexObj[make].hasOwnProperty(model)) {
								fixed++
								console.log('fixed:', fixed)
								ebayModel = indexObj[make][model] 
							} else notFixed++
							
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
							let modelArr = modelYear[1].split(' ');
							year = modelArr.pop();
							model = modelArr.join(' ').trim();
							// console.log('here3',make, model)
							if (indexObj.hasOwnProperty(make) && indexObj[make].hasOwnProperty(model)) {
								// console.log('here4')
								fixed++
								console.log('fixed:', fixed)
								ebayModel = indexObj[make][model] 
							} else notFixed++
							
							if (year.includes('-')){
								let yearRange = year.split('-');
								let year1 = parseInt(yearRange[0]);
								let year2 = parseInt(yearRange[1]);
								for (let k = year1; k <= year2; k++){
									let fitment = {
										product_id: productId,
										price: row['Price'],
										list_price: row['List Price'],
										item_sku:row['SKU'],
										part_number: row['MPN'],
										make,
										model,
										year: k,
										ebayModel: ebayModel ? ebayModel : '',
									}
									fitments.push(fitment)
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
								}
								fitments.push(fitment)
							}
						}
					}
				})
				console.log('MADE IT!!');
				console.log(products.length);
				console.log('PRODUCTS',products.slice(0,2));
				console.log(fitments.length);
				console.log('fitments',fitments.slice(0,2));
				console.log('fixed', fixed)
				console.log('notfixed',notFixed)

	
				// const fixToWrite = papa.unparse(needFix, {skipEmptyLines:true});
				// const fitmentsToWrite = papa.unparse(fitments, {skipEmptyLines:true});
				// const productsToWrite = papa.unparse(products, {skipEmptyLines:true});

				// fs.writeFile('fitmentsTableVer1.csv', fitmentsToWrite, (err) => {
				// 	if (err){
				// 			console.log(err);
				// 	}
				// })

				// fs.writeFile('productsTableVer1.csv', productsToWrite, (err) => {
				// 	if (err){
				// 			console.log(err);
				// 	}
				// })

				// fs.writeFile('needFix.csv', fixToWrite, (err) => {
				// 	if (err){
				// 			console.log(err);
				// 	}
				// })
				
				
			}
				
		})
	}
})