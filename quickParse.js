const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
const https = require('https')

const allMakes = ["Suzuki","Honda","Yamaha","Polaris","Adly Moto","Aeon","AJS","All American Choppers","Alouette","AlphaSports","Alta Motors","Amen Chassis Works","American Classic Motors","American Dirt Bike","American IronHorse","American Lifan Industry","American Motorcycle Corp.","Anarchy Motorcycles","APC Motorcycle Company","Apollo Choppers","Aprilia","Arch Motorcycle Company","Arctic Cat","Argo Atv","Ariel","ATK","Backroad Choppers","Bajaj","Benelli","Bennche","BETA","Big Bear Choppers","Big Boyz Custom Cycles","Big Dog","Big Inch Bikes","Big Tony's Chopp Shop","Bimota","Black Swamp Choppers","BMC","BMS MOTORSPORTS","BMW","Boa-Ski","Bobcat","Bolens","Bombardier","Borella","Boss Hoss","Bourget's Bike Works","Brammo","Bridgestone","Brough Superior","BSA","Buell","Bultaco","Cagiva","California Customs","California Scooter Co.","California Sidecar-Trike","Campagna","Can-Am","Cannondale","Carefree Custom Cycles","Carolina Custom Products","Case IH","CC Cycles","CCM","Cectek","CF-Moto","Champion Sidecars","Chaparral","Cheetah Trikes","Chop Shop Customs","Chopper Nation","Christini AWD Motorcycles","Chuck Wagon","Cleveland CycleWerks","ClubCar","Coast 2 Coast Choppers","Cobra Motorcycle","Cobra Trike","COLEMAN POWERSPORTS","Columbia","Confederate Motorcycle","Coonyz Customz","Covington Cycle City","CPI USA","CQR","Create A Custom Cycle","Cruise Dynamic","Cub Cadet","Cubi-K Scooters","Cushman","Cushman II","CZ","D.R.R.","Daelim","Darwin Motorcycles","Death Row Motorcycles","Demon Choppers","Denver Choppers","Derbi","Desperado","Detroit Brothers","Diablo","Diamo","Dirico Motorcycles USA","DKW/MZ","Dominion Motorcycle","Ducati","DURUXX","E-TON","EBR","Ecstasy","Ego Cycle","Energica Motor Company","Enfield","Evinrude","Excelsior-Henderson","EZ Go","EZ-Go","F.B.I. Motor Co.","Fischer","Flyrite Choppers","Flyscooters","FUZION MOTORS","GAS GAS","GEM","Genuine Scooter Co.","Glycing Motor Corp","Grandeur Manufacturing","Greeves","Hammerhead Off-Road","Hannigan","Harley-Davidson","Hisun Motors Corp USA","Hodaka","Husaberg","Husqvarna","Hyosung","Ice Bear Powersports","Illusion Cycles","Independence","Indian","Indian Motorcycle-Gilroy","Intrepid Cycles","Iron Eagle","Ironworks","Italika","Italjet (Childrens Minis)","Jawa/CZ","Jim Nasi Customs","John Deere","Johnny Pag","Johnson","Joyner USA","Kandi USA","Kaotic Customs","Kasea","Kawasaki","Kayo USA","Keeway","Kinetic","KIOTI","KTM","Kubota","KYMCO","Lambretta","Lance","Land Pride","Las Vegas Trikes","Laverda","Legends Motorsports","Lehman Trikes","LEM","Logic Motor Company","Mahindra","Maico","Manta","Marauder","Marrelli","Masai","Maserati","Massimo","Matchless","Mercury","Midwest Motor Vehicles","Milwaukee","Montesa","Moto Guzzi","Moto Morini","Moto-ski","Motor Trike","Motor-Piper","Motus Motorcycles","Mustang","MV Agusta","MZ","Natalia Scooters","Ness Motorcycles","New Holland","Norton","O.C. Choppers","Odes UTVs","Old School Motorcycle Co","Oreion Motors","Ossa","Pagsta Motors","Paramount Custom Cycles","Paul Yaffe Originals","Peirspeed","Penton","PGO","Piaggio","Polini","Power Chrome","Precision Cycle Works","Precision Powersports","Predator Motor Corp","Pro-One","Proper Chopper","QLINK","QTEC-ENGINEERING","Quadzilla","Raider","Rebel West Powersports","Recreatives Industries","Red Horse Motorworks","Redcat Motors","Redline","Redneck","Renault","Revolution Cycle Company","Rewaco","Rhino Motorcycles","Rickman","Ridley Motorcycle","Rival Motorsports","Road Hog","Roadsmith","Rokon","Royal Enfield","RTX","Rucker Performance","Rupp","S.P.C.N. Motorcycles","Sabertooth Motorcycles","Saxon Motorcycle","Schwinn","Scorpion Motorsports","SDG","Sea-Doo","Sears","Sebring Auto-Cycle","Sherco","Ski-Daddler","Ski-Doo","Ski-Whiz","Skiroule","Sno-Jet","Sno-Pony","Southwest Choppers","Spencer Bowman Customs","SS Trike","SSR Motorsports","Star EV","Steed Musclebike","Streamline Designs","Strociek","Suckerpunch Sallys","Supermach","Surgical-Steeds","Swift Motor Co.","SWM","SYM","T.G.B.","Tank Sports","Tanom Motors","Textron Off Road","The Auto Moto","Thoroughbred","Thunder Bikes","Thunder Mountain Cycles","TigerShark","Titan Motorcycle Co.","Tomberlin","Tomberlin Outdoor","Tomcar","Tomos","Trifun","Triumph","Twist-N-Go","Ultra Cycle","Unison Motors","United Motors","Ural","V8 Choppers","Vanderhall","Vectrix","Velocette","Veloz","Vengeance Motorcycles","Vento","Vespa","Victory","Viking","Vincent","Viper","Von Dutch Kustom Cycles","VOR","Wet Jet","Wild West","Wrath Manufacturing","Xtreme","XY Powersports","Yankee","ZAP","Zero","Zero Engineering","Zongshen","TM","Accurate Cycle Engineering","Lightning","Thunderbolt","HM"]

const filePath = path.resolve('utilityFiles/ebayModelIndex.csv')
const file = fs.createReadStream(filePath);
// const fixFilePath = path.resolve('missingPlugs.csv')
// const fixfile = fs.createReadStream(fixFilePath)

const list1 = [];
const indexObj = {}
let dataString = `INSERT INTO dbo.Makes VALUES \n`;
let dataString2 = ``;
counter1 = 0;
counter2 = 0;

papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    let data = results.data
    console.log('data parse done', data[0])
    
    // papa.parse(fixfile, {
    //   header: true,
    //   skipEmptyLines: true,
    //   complete: (res) => {

        data.forEach((row, i) => {
          if (!indexObj[row.make]) {
            counter1++;
            indexObj[row.make] = counter1;
            dataString += `\n (${counter1}, '${row.make}'),`;
          }
          counter2++;
          list1.push(`\n (${counter2}, '${row.model}', ${indexObj[row.make]}),`)

        })
        for(let i = 0; i< list1.length < i+1000;) {
          dataString2 += `INSERT INTO dbo.Makes VALUES \n`
        }
     


// REGEX SCRUBBER ________________________________________________________________
      // if(/(;|\(|w\/|2x4|4x4|6x6|8x8|2X4|4X4|6X6|8X8|\/2x4|\/4x4|\/6x6|All carb|Two sets|ABS model| Non-ABS|\w+ Anniversary|\w+ edition|\w+ EDITION|\w+ ANNIVERSARY).*/.test(mm)) {
      //   console.log('in there')
      //   let newMm = mm.replace(/(;|\(|w\/|2x4|4x4|6x6|8x8|2X4|4X4|6X6|8X8|\/2x4|\/4x4|\/6x6|All carb|Two sets|ABS model| Non-ABS|\w+ Anniversary|\w+ edition|\w+ EDITION|\w+ ANNIVERSARY).*/g, '').trim()
      //   console.log(newMm)
      //   data[index]['Product Name'] = data[index]['Product Name'].replace(mm, newMm).trim()
      // }
      // if(/[ ]{2,}/.test(data[index]['Product Name'])) {
      //   data[index]['Product Name'] = data[index]['Product Name'].replace(/[ ]{2,}/g, ' ')
      // }

// MAKE AND MODEL PARSER ____________________________________________________________
    //   let inMakes = false
    //   if(!list2.includes(mm)) {
    //     let added = false;
    //     list2.push(mm)
    //     allMakes.forEach(make => {
    //       if (mm.includes(make) && !added) {
    //         if (!mm.split(make)[1]) console.log({mm: row['Product Name'], make})
    //         list1.push({
    //           make,
    //           model: mm.split(make)[1] || 'Something Went Wrong',
    //           year
    //         })
    //         added = true;
    //         inMakes = true
    //       }
    //     })
    //     if (!inMakes) console.log(mm)
    //   } 
    
    
    // console.log('sorting done');
    // console.log('fixes', list1);
    // console.log('#ofFixes', list1.length);
    // console.log('regexFixes', list2);
    // const csv1 = papa.unparse(list1);
    fs.writeFile('makesSqlString.txt', dataString, (err) => {
      if(err) console.log(err);
    })

    // const csv1 = papa.unparse(data);
    fs.writeFile('modelsSqlString.txt', dataString2, (err) => {
      if(err) console.log(err);
    })
    // console.log('writing done')
    console.log('Success!')

    
    //   }
    // })
  }  
})
