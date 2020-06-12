require("regenerator-runtime/runtime");
import $ from "jquery";

var artoo = require('artoo-js');


async function fetcher(product) {
  return await fetch(`https://www.amazon.com/dp/${product.sku}/`)
    .then(function(response) {
      return response.text();
    })
    // .then(function(myJson) {
    //   console.log(myJson);
    // })
    .catch(function(err) {  
      console.log('Fetch Error', err);  
  });
}

async function original_price(product){
  let store = await fetcher(product);
  var $html = artoo.helpers.jquerify(store);
  
  var store_price = artoo.scrape($html.find('#priceblock_ourprice'))[0];
	store_price = store_price.match(/[+-]?\d+(?:\.\d+)?/g)[0];

  console.log("store price:", store_price);

}

async function evaluate(product){
  let store_price = await original_price(product);
  let comparison = product.price - store_price;
  return comparison;
}

// async function get2(product){
//   await $.ajax({
//     url: `https://www.amazon.com/dp/${product.sku}/`,
//     type: "GET",
//     success: function(d){ 
//          console.log("Fetched correctly", d);
//      },
//   })
// }

// Communicate with content js
var content;
function connected(p) {
  content = p;
  content.onMessage.addListener(async function(m) {

    if (m.product) {
      console.log(m.product);
      // await evaluate(m.product);
      let diff = await evaluate(m.product);
      await content.postMessage({
        response: diff,
      });
      console.log("Response sended");
    }
    
  });
}

chrome.runtime.onConnect.addListener(connected);

console.log("Background loaded");