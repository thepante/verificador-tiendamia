require("regenerator-runtime/runtime");

var artoo = require('artoo-js');

function get_props(store){
  let props = {}; 
  switch (store){
    case 'amz':
      props.url = "https://www.amazon.com/dp/";
      props.div = "#priceblock_ourprice";
      break;
    case 'ebay':
      props.url = "https://www.ebay.com/itm/";
      props.div = "#prcIsum";
      break;
    case 'wrt':
      props.url = "https://www.walmart.com/ip/";
      props.div = ".price-group";
      break;
  }
  return props;
}

// Communication with content js
var content;
function connected(p) {
  content = p;
  content.onMessage.addListener(async function(m) {

    // When receive product data
    if (m.product) {
      console.log(m.product);
      let product = m.product;
      let props = get_props(product.store);

      // Get url
      let url = props.url + product.sku;
      console.log(url);
      
      // Load link
      let store = await fetch(url)
      .then(function(response) {
        return response.text();
      })
      .catch(function(err) {  
        console.log('Fetch Error', err);  
      });

      switch (product.price) {
        case "0.00":
          content.postMessage({ response: {diff: 26244224, url: url} });
          break;

        default:
          // Scrap store html, then get price
          let $html = artoo.helpers.jquerify(store);
          let theres_price = artoo.scrape($html.find(props.div))[0];
          console.log(theres_price)

          let store_price = null;
          let diff = null;

          // If price found
          if (theres_price != null) {
            // Get price or prices range
            store_price = artoo.scrape($html.find(props.div))[0];
            store_price = store_price.match(/[+-]?\d+(?:\.\d+)?/g).map(Number);

            // Get max price
            store_price = Math.max.apply(Math, store_price);

            // Check difference
            diff = product.price - store_price;
            console.log("Store price:", store_price, "- Diff:", diff);
          } 
          // If not price: set as not found
          else {
            diff = 26244224;
            console.log("Price in store not found - Fallback set:", diff);
          }

          // Send it to content
          content.postMessage({ response: {diff: diff, url: url} });
          console.log("Difference sended to content");
      }
    }
    
  });
}

chrome.runtime.onConnect.addListener(connected);
console.log("Background loaded");