const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');

const partCategory = {
    'autopart': 179413,
    'powersportspart': 179753,
    'wheels/tires': 182363
}

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
                console.log('Data Loaded:', products[0])
                createEbayCsv(products)
            }
        })
    }
})


  function createEbayCsv(rows) {
    console.log('Creating CSVs...')
    const selectedProducts = rows;
    const mpnYMMs = [];
    const csvData = [];
    selectedProducts.forEach((product, index) => {
      product.item_fitments.forEach((fitment, index) => {
        const { make } = fitment;
        const ymm = `${fitment.make} ${fitment.model} ${fitment.year}`;
        const row = {
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
          console.log('Product Added:', mpnYMMs.length)
          console.log(fitment.part_number)
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
            ...row,
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
              ...row,
              Relationship: 'Compatibility',
              RelationshipDetails: `Year=${fitment.year}|Make=${fitment.make}|Model=${fitment.ebayModel}`,
            };
            csvData.push(fitmentRow);
        
        } else {

            if (fitment.ebayModel) {
                mpnYMMs[mpnYMMs.findIndex(({ mpn }) => mpn === fitment.part_number)].YMMs.push(ymm);
                const itemIndex = csvData.findIndex(x => x.part_number === fitment.part_number);
                const fitmentRow = {
                  ...row,
                  Relationship: 'Compatibility',
                  RelationshipDetails: `Year=${fitment.year}|Make=${fitment.ebayMake ? fitment.ebayMake : fitment.make}|Model=${fitment.model}`,
                };
                csvData.splice(itemIndex, 0, fitmentRow);
            }
        }
      });
    });
    console.log('CSV Data Created; Building Descriptions...')
    csvData.forEach((row, index) => {
      if (csvData[index]['Product:MPN']) {
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

    const csvString = papa.unparse(csvData.slice(0, 10000));
    
    let j = 0
      for(let i=0; i<uploadSheet.length; i += 1000){
        console.log(`Current Row: ${i}`)
        j++
        let dataString = papa.unparse(uploadSheet.slice(i, (i+1000)))
        fs.writeFile(`uploadSheets/ebaySheet${j}.csv`, dataString, (err) => {
          if(err) console.log(err);
        })
      }

      console.log('SUCCESS!!')
  }