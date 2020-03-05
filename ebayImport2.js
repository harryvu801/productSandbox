const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
const BuildDescription  = require('./BuildDescription');

const partCategory = {
    'autopart': 179413,
    'powersportspart': 179753,
    'wheels/tires': 182363
}
const ebayRow = {
  'Action(SiteID=eBayMotors|Country=US|Currency=USD|Version=941)': '',
  Category: '',
  'Product:UPC': '',
  'Product:ISBN': '',
  'Product:EAN': '',
  'Product:EPID': '',
  'Product:Brand': '',
  'Product:MPN': '',
  'Product:IncludePreFilledItemInformation': '',
  'Product:IncludeStockPhotoURL': '',
  'Product:ReturnSearchResultsOnDuplicates': '',
  Relationship: '',
  RelationshipDetails: '',
  Title: '',
  Subtitle: '',
  Description: '',
  '*ConditionID': '',
  PicURL: '',
  '*Quantity': '',
  '*Format': '',
  '*StartPrice': '',
  BuyItNowPrice: '',
  '*Duration': '',
  'C:Brand': '',
  'C:Proposition 65': '',
  '*C:Manufacturer Part Number': '',
  '*PostalCode': '',
  GalleryType: '',
  PaymentInstructions: '',
  StoreCategory: '',
  CustomLabel: '',
  AdditionalDetails: '',
  ShippingProfileName: '',
  ReturnProfileName: '',
  PaymentProfileName: '',
};
const needManualCorrection = []

const productsPath = path.resolve(`productTableVer2.csv`);
const productsFile = fs.createReadStream(productsPath)
const fitmentsPath = path.resolve('fitmentTableVer1.csv')
const fitmentsFile = fs.createReadStream(fitmentsPath)

papa.parse(productsFile, {
    header: true,
    skipEmptyLines: true,
    complete: (prodRes) => {
        const products = prodRes.data
        console.log('Products Loaded:', products.length)
        products.forEach((x,i) => products[i].item_fitments = [])
        papa.parse(fitmentsFile, {
          header: true,
          skipEmptyLines: true,
          complete: (fitRes) => {
            const fitments = fitRes.data
            console.log('Fitments Loaded:', fitments.length)
            fitments.forEach((fitment) => {
                    const productId = fitment.product_id;
                    products.forEach((product) => {
                        if (productId === product.product_id) {
                            product.item_fitments.push(fitment);
                        }
                    });
                });
                console.log('Data Loaded:')
                createEbayCsv(products)
            }
        })
    }
})

  function createEbayCsv(rows) {
    console.log('Creating CSVs...')
    const selectedProducts = rows.slice(0,100);
    const mpnYMMs = [];
    const csvData = [];
    selectedProducts.forEach((product, index) => {
      console.log('Product Index:', index, 'Current # of Products:', mpnYMMs.length)
      product.item_fitments.forEach((fitment, index) => {
        const { make } = fitment;
        const ymm = `${fitment.make} ${fitment.model} ${fitment.year}`;
        
        if (!mpnYMMs.find(({ mpn }) => mpn === fitment.part_number) && fitment.ebayModel) {
          mpnYMMs.push({
            mpn: fitment.part_number,
            YMMs: [ymm],
            bullets: [
              product.bullet_point1,
              product.bullet_point2,
              product.bullet_point3,
              product.bullet_point4,
              product.bullet_point5,
            ]
          });
          const baseTitle = `${product.item_name} for ${make}`;
          let Title = '';
          let Subtitle = '';
          let onlySubNow = false;
          baseTitle.split(' ').forEach((word) => {
            if ((Title.length + word.length + 1) > 79 || onlySubNow) {
              onlySubNow = true;
              Subtitle += `${word} `;
            } else {
              Title += `${word} `;
            }
          });
          const itemRow = {
            ...ebayRow,
            'Action(SiteID=eBayMotors|Country=US|Currency=USD|Version=941)': 'Add',
            Category: partCategory[product.category],
            'Product:Brand': product.brand,
            'Product:MPN': fitment.part_number,
            Title,
            Subtitle,
            Description: product.product_description,
            '*ConditionID': '1000',
            PicURL: product.main_image_url,
            '*Quantity': '10',
            '*Format': 'FixedPrice',
            '*StartPrice': fitment.list_price,
            '*Duration': 'GTC',
            'C:Brand': product.brand,
            '*C:Manufacturer Part Number': fitment.part_number,
            '*PostalCode': '84101',
            CustomLabel: fitment.item_sku,
            ShippingProfileName: 'Default Shipping',
            ReturnProfileName: 'Returns Accepted 30 Days Money back or Replacement',
            PaymentProfileName: 'PayPal',
          };
          csvData.push(itemRow);
            const fitmentRow = {
              ...ebayRow,
              Relationship: 'Compatibility',
              RelationshipDetails: `Year=${fitment.year}|Make=${fitment.make}|Model=${fitment.ebayModel}`,
            };
            csvData.push(fitmentRow);
        
        } else if (fitment.ebayModel) {
            mpnYMMs[mpnYMMs.findIndex(({ mpn }) => mpn === fitment.part_number)].YMMs.push(ymm);
            const itemIndex = csvData.findIndex(x => x.part_number === fitment.part_number);
            const fitmentRow = {
              ...ebayRow,
              Relationship: 'Compatibility',
              RelationshipDetails: `Year=${fitment.year}|Make=${fitment.make}|Model=${fitment.ebayModel}`,
            };
            csvData.splice(itemIndex, 0, fitmentRow);
        } else {
          needManualCorrection.push({
            sku: fitment.item_sku,
            make: fitment.make,
            model: fitment.model
          })
        }
      });
    });
    console.log(`CSV Data Created; Building Descriptions for ${csvData.length} Rows...`)
    csvData.forEach((row, index) => {
      if (csvData[index]['Product:MPN']) {
        console.log(`Building Description for Row ${index}...`)
        const ymms = mpnYMMs.find(({ mpn }) => mpn === csvData[index]['Product:MPN']).YMMs;
        const bullets = mpnYMMs.find(({ mpn }) => mpn === csvData[index]['Product:MPN']).bullets;
        csvData[index].Description = BuildDescription(
          csvData[index].PicURL,
          ymms,
          csvData[index].Description,
          csvData[index].Title,
          bullets
        );
      }
    });
    console.log('Data Ready for Write')

    let sheetCounter = 0;
    let prev = 0;
    let j = 0
    for(let i=0; i< csvData.length; i++){
      if (csvData[i]['Product:MPN'] ){
        sheetCounter++
      } 
      if (sheetCounter === 401) {
        j++
        console.log(j)
        let dataString = papa.unparse(csvData.slice(prev, (i-1)))
        fs.writeFile(`uploadSheets/ebaySheet${j}.csv`, dataString, (err) => {
          if(err) console.log(err);
        })
        sheetCounter = 0;
        prev = i-1;
      }
    }
    let dataString = papa.unparse(csvData.slice(prev, csvData.length))
    fs.writeFile(`uploadSheets/ebaySheet${j+1}.csv`, dataString, (err) => {
      if(err) console.log(err);
    })
  
    let needFixing = papa.unparse(needManualCorrection);
    fs.writeFile('modelsNeedManualFixing.csv', needFixing, (err) => {
      if(err) console.log(err);
    })

    console.log('SUCCESS!!')
  }