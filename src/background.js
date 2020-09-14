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
      props.altPage = {
        trigger: "#availability span.a-declarative a",
        element: ".olpPriceColumn .olpOfferPrice",
        url: "https://www.amazon.com/gp/offer-listing/",
      }
      break;
    case 'ebay':
      props.url = "https://www.ebay.com/itm/";
      props.priceDiv = "#prcIsum";
      props.searchByRegex = {
        trigger: "#finalPrc",
        element: "#JSDF",
        expression: /(binPriceOnly":"|"bp":"US\s\$)(.*?)"/,
      }
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

  const findNode = function(selector){
    return artoo.scrapeOne($html.find(selector));
  }

  const getPriceFrom = function(node){
    let priceElement = findNode(node);
    priceElement = priceElement.match(/\b\d[\d,.]*\b/g);
    priceElement.forEach(removeCommas);
    function removeCommas(e, i){ priceElement[i] = priceElement[i].replace(',','')};

    // Array of price(s) collected - returns the highest
    return Math.max.apply(Math, priceElement.map(Number));
  }

  const getDiffFrom = function(node){
    let priceFromStore = getPriceFrom(node);
    let diff = product.price - priceFromStore;
    console.log(product.sku, '→ Original/highest:', priceFromStore);
    return Number(diff.toFixed(2));
  }

  const store = getProps(product.store);
  const productURL = store.url + product.sku;
  let storeProductPage = await getProductPage(productURL);

  let result = {};

  if (storeProductPage.status === 'ok') {
    $html = artoo.helpers.jquerify(storeProductPage.data);
    const priceNode = findNode(store.priceDiv);
    // console.log("priceDiv", priceNode);

    // If main price div is found
    if (priceNode != null) {
      result.diff = getDiffFrom(store.priceDiv);
    }
    // Case: search by regex in certain element
    else if (store.searchByRegex && findNode(store.searchByRegex.trigger) != null) {
      console.log(productURL);
      try {
        let element = artoo.scrapeOne($html.find(store.searchByRegex.element));
        let found = element.match(store.searchByRegex.expression)[2];
        result.diff = Number(product.price) - Number(found);
        console.log("Regex Match:", found);
      } catch {
        console.log(product.sku, "→ Triggered regex search but wasn't found");
        result.error = 'notfound';
      }
    }
    // Else try with 'used' div
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
  if (product.store === 'ebay') product.sku = product.sku.match(/\|([+-]?\d+(?:\.\d+)?)\|/)[1];
  console.log(product.sku, '→ Checking', product);
  analyzeThis(product).then(sendResponse);
  return true;
});

console.log("Background loaded");
