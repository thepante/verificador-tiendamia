require("regenerator-runtime/runtime");

var artoo = require('artoo-js');

function getProps(store){
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
      let props = getProps(product.store);

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
          let priceDiv = artoo.scrape($html.find(props.div))[0];
          console.log("priceDiv", priceDiv);

          let priceFromStore = null;
          let diff = null;

          // If price found
          if (priceDiv != null) {
            // Get price or prices range
            priceFromStore = artoo.scrape($html.find(props.div))[0];
            priceFromStore = priceFromStore.match(/[+-]?\d+(?:\.\d+)?/g).map(Number);

            // Get max price
            priceFromStore = Math.max.apply(Math, priceFromStore);

            // Check difference
            diff = product.price - priceFromStore;
            console.log("Store price:", priceFromStore, "- Diff:", diff);
          } 
          // If not price: set as not found
          else {
            diff = 26244224;
            console.log("Price in store not found - Fallback set:", diff);
          }

          // Send it to content
          content.postMessage({ response: {diff: diff, url: url} });
          console.log("Result sent to content");
      }
    }
    
  });
}

chrome.runtime.onConnect.addListener(connected);
console.log("Background loaded");