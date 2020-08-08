require("regenerator-runtime/runtime");

var artoo = require('artoo-js');

function getProps(store){
  let props = {}; 
  switch (store){
    case 'amz':
      props.url = "https://www.amazon.com/dp/";
      props.priceDiv = "#priceblock_ourprice";
      props.asUsedDiv = "#usedBuySection";
      props.withoutStock = "#outOfStock";
      break;
    case 'ebay':
      props.url = "https://www.ebay.com/itm/";
      props.priceDiv = "#prcIsum";
      break;
    case 'wrt':
      props.url = "https://www.walmart.com/ip/";
      props.priceDiv = ".price-group";
      break;
  }
  return props;
}

/**
 * Loads the product in the original store
 * @param {string} url - Full address to the product page
 * @return {object} Containing `status` and `data`
 */
const getProductPage = async function(url){
  let content = {};
  return await fetch(url)
  .then(function(response) {
    if (response.ok) {
      return response.text();
    }else{
      throw Error(response.statusText);
    }
  })
  .then(function(response) {
    content.status = 'ok';
    content.data = response;
    return content;
  })
  .catch(function(error) {
    content.status = 'error';
    content.data = error;
    return content;
  });
}

/**
 * Get the product and return the price checked data
 * @param {object} product - From content
 * @return {object} Conclusion to send back to content
 */
const analyzeThis = async function(product){
  if (product.price < 0.001) {
    console.log("Got no price");
    return {error: "noprice"};
  }

  let $html;

  const getPriceFrom = function(node){
    let divPrice = artoo.scrape($html.find(node))[0];
    divPrice = divPrice.match(/\b\d[\d,.]*\b/g);
    divPrice.forEach(removeCommas);
    function removeCommas(e, i){ divPrice[i] = divPrice[i].replace(',','')};
    
    // Array of price(s) collected - returns the highest
    return Math.max.apply(Math, divPrice.map(Number));
  }

  const getDiffFrom = function(node){
    let priceFromStore = getPriceFrom(node);
    let diff = product.price - priceFromStore;
    console.log(product.sku, '→ Original/highest:', priceFromStore);
    return Number(diff.toFixed(2));
  }

  const findNode = function(selector){
    return artoo.scrape($html.find(selector))[0];
  }

  const store = getProps(product.store);
  const productURL = store.url + product.sku;
  const storeProductPage = await getProductPage(productURL);

  let result = {};

  if (storeProductPage.status === 'ok') {
    $html = artoo.helpers.jquerify(storeProductPage.data);
    const priceNode = findNode(store.priceDiv);
    // console.log("priceDiv", priceNode);

    // If main price div is found
    if (priceNode != null) {
      result.diff = getDiffFrom(store.priceDiv);
    }
    // If got not main node, try with 'used' div
    else if (findNode(store.asUsedDiv)) {
      console.log(product.sku, "→ Detected as used");
      result.diff = getDiffFrom(store.asUsedDiv);
      result.used = true;
    }
    // Else, check if its out of stock
    else if (findNode(store.withoutStock)) {
      result.error = 'nostock';
      console.log(product.sku, "→ Product without stock");
    }
    // Price wasn't found
    else {
      result.error = 'notfound';
      console.log(product.sku, "→ Price in store not found");
    }
  } 
  // If url fetch failed
  else {
    result.error = 'fetcherror';
    console.log("Fetch failed:", storeProductPage.error);
  }
  
  // Return conclusion
  result.url = productURL;
  console.log(product.sku, "→ Final result", result);
  return result;
}


chrome.runtime.onMessage.addListener((product, s, sendResponse) => {
  console.log(product.sku, '→ Checking', product);
  analyzeThis(product).then(sendResponse);
  return true;
});

console.log("Background loaded");