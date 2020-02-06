const fs = require('fs');
const path = require('path');
const papa  = require('papaparse');
const BuildDescription  = require('./BuildDescription');

const filePath = path.resolve('ngkSparkPlugs.csv')
const file = fs.createReadStream(filePath);

let ebayRow = {
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

const uploadSheet = [];
// console.log(BuildDescription('fakeimage.com', 'ford 300', 'it fits', 'thing'));

papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results, file) => {
        console.log('done')
        const data = results.data;
        data.forEach(row => {
        let ymm = row.item_name.split(' for ')[1];
        let bullets = [
            row.bullet_point1,
            row.bullet_point2,
            row.bullet_point3,
            row.bullet_point4,
            row.bullet_point5
        ]
        let Title = '';
        let Subtitle = '';
        let onlySubNow = false;
        row.item_name.split(' ').forEach((word) => {
          if ((Title.length + word.length + 1) > 79 || onlySubNow) {
            onlySubNow = true;
            Subtitle += `${word} `;
          } else {
            Title += `${word} `;
          }
        });
        let uploadRow = {
            ...ebayRow,
            'Action(SiteID=eBayMotors|Country=US|Currency=USD|Version=941)': 'Revise',
            Category: '179413',
            'Product:UPC': 'Does Not Apply',
            'Product:Brand': row.brand_name,
            'Product:MPN': row.part_number,
            Title,
            Subtitle,
            Description: BuildDescription(row.main_image_url, ymm, row.product_description, row.item_name, bullets),
            '*ConditionID': 1000,
            PicURL: row.main_image_url,
            '*Quantity': 10,
            '*Format': 'FixedPrice',
            '*StartPrice': row.list_price,
            '*Duration': 'GTC',
            'C:Brand': row.brand_name,
            '*C:Manufacturer Part Number': row.part_number,
            '*PostalCode': '84101',
            CustomLabel: row.item_sku,
            ShippingProfileName: 'Default Shipping',
            ReturnProfileName: 'Returns Accepted 30 Days Money back or Replacement',
            PaymentProfileName: 'PayPal'
        }
        // console.log(uploadRow.Description);
        uploadSheet.push(uploadRow);
      })

  
      const dataString = papa.unparse(uploadSheet)
      fs.writeFile('uploadSheet.csv', dataString, (err) => {
        if(err) console.log(err);
      })
      console.log('DONE!')
    }
  })
  