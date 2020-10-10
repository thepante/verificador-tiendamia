require("regenerator-runtime/runtime");

var artoo = require('artoo-js');

function getProps(store){
  const amazon = {
    url: "https://www.amazon.com/dp/",
    selector: {
      main: '#priceblock_ourprice',
      alt: '#priceblock_saleprice',
      used: '#usedBuySection',
      nostock: '#outOfStock',
    },
    altPage: {
      trigger: "#availability span.a-declarative a",
      element: ".olpPriceColumn .olpOfferPrice",
      url: "https://www.amazon.com/gp/offer-listing/",
    },
  };
  const ebay = {
    url: "https://www.ebay.com/itm/",
    selector: {
      main: '#prcIsum',
      alt: '#mm-saleDscPrc',
    },
    searchByRegex: {
      trigger: "#finalPrc",
      element: "#JSDF",
      expression: /(binPriceOnly":"|"bp":"US\s\$)(.*?)"/,
    },
  };
  const walmart = {
    url: "https://www.walmart.com/ip/",
    selector: {
      main: '#price',
    },
  };

  return (store == 'amz') ? amazon : (store == 'ebay') ? ebay : walmart;
}

/**
 * Loads the product in the original store
 * @param {string} url - Full address to the product page
 * @return {object} Containing `status` and `data`
 */
const loadProductPage = async function(url){
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

  let html;

  const findNode = function(selector){
    return artoo.scrapeOne(html.find(selector));
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
  let productPage = await loadProductPage(productURL);

  let result = {};

  if (productPage.status === 'ok') {
    await searchDiff();
  } else {
    result.error = 'fetcherror';
    console.log("Fetch failed:", productPage.error);
  }

  /** Search for a price to calc the diff */
  async function searchDiff() {
    html = artoo.helpers.jquerify(productPage.data);

    // If main price div is found
    if (findNode(store.selector.main) != null) {
      console.log(product.sku, "→ selector.main", findNode(store.selector.main));
      result.diff = getDiffFrom(store.selector.main);
    }
    else if (findNode(store.selector.alt)) {
      result.diff = getDiffFrom(store.selector.alt);
    }
    // Alternative listing page. ATM: amz
    else if (store.altPage && findNode(store.altPage.trigger)) {
      console.log(product.sku, "Alternative page load");

      let altPageUrl = store.altPage.url + product.sku + '?condition=new';
      productPage = await loadProductPage(altPageUrl);
      html = artoo.helpers.jquerify(productPage.data);

      let pricesList = artoo.scrape(html.find(store.altPage.element));
      pricesList = pricesList.map(price => Number(price.replace('$', '')));

      let tmPriceIndex = pricesList.indexOf(product.price);
      let pricesHigher = pricesList.filter(price => price > product.price);
      let pricesLower = pricesList.filter(price => price < product.price);

      let diff = (tmPriceIndex !== -1) ? 0 : product.price - pricesList[0];

      console.table({
        sku: product.sku,
        url: altPageUrl,
        diff: diff,
        all: [pricesList],
        higher: [pricesHigher],
        lower: [pricesLower],
      });

      result.diff = diff;

      if (pricesHigher.length > 0) result.higher = pricesHigher;
      if (pricesLower.length > 0) result.lower = pricesLower;
    }
    // Case: search by regex in certain element
    else if (store.searchByRegex && findNode(store.searchByRegex.trigger) != null) {
      console.log(productURL, 'store.searchByRegex');
      try {
        let element = artoo.scrapeOne(html.find(store.searchByRegex.element));
        let found = element.match(store.searchByRegex.expression)[2];
        result.diff = Number(product.price) - Number(found);
        console.log("Regex Match:", found);
      } catch {
        console.log(product.sku, "→ Triggered regex search but wasn't found");
        result.error = 'notfound';
      }
    }
    // Else try with 'used' div
    else if (findNode(store.selector.used)) {
      console.log(product.sku, "→ Detected as used");
      result.diff = getDiffFrom(store.selector.used);
      result.used = true;
    }
    // Else, check if its out of stock
    else if (findNode(store.selector.nostock)) {
      result.error = 'nostock';
      console.log(product.sku, "→ Product without stock");
    }
    // Price wasn't found
    else {
      result.error = 'notfound';
      console.log(product.sku, "→ Price in store not found");
    }
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
