require("regenerator-runtime/runtime");

var artoo = require('artoo-js');

const PROPS = {
  amz: {
    url: 'https://www.amazon.com/dp/',
    selectors: {
      main: ['#price_inside_buybox', '#priceblock_ourprice', '#priceblock_saleprice'],
      used: ['#usedBuySection'],
      nostock: ['#outOfStock'],
      alt: ['#availability span.a-declarative a', '[data-action="show-all-offers-display"] .a-link-normal'],
    },
    alt: {
      element: '.a-price .a-offscreen',
      url: 'https://www.amazon.com/gp/aod/ajax/?filters=%257B%2522all%2522%253Atrue%252C%2522new%2522%253Atrue%257D&isonlyrenderofferlist=true&asin=',
    },
  },

  ebay: {
    url: 'https://www.ebay.com/itm/',
    selectors: {
      main: ['#prcIsum', '#mm-saleDscPrc'],
      regex: ['#finalPrc'],
    },
    regex: {
      element: '#JSDF',
      expression: /(binPriceOnly":"|"bp":"US\s\$)(.*?)"/,
    }
  },

  wrt: {
    url: 'https://www.walmart.com/ip/',
    selectors: {
      main: ['#price'],
    },
  },
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
    } else {
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

  const findElement = selector => artoo.scrapeOne(html.find(selector));

  const getDetectedMethod = function(methods){
    let found = {};
    Object.entries(methods).find(method => {
      const [key, selectors] = method;
      const foundSelector = selectors.find(findElement);
      return foundSelector && (found.method = key) && (found.selector = foundSelector);
    });
    return found;
  }

  const getPriceFromElement = function(selector){
    let priceElement = findElement(selector);
    priceElement = priceElement.match(/\b\d[\d,.]*\b/g);
    priceElement = priceElement.map(price => price.replace(',', ''));

    // Array with price(s) are collected - returns highest one
    return Math.max.apply(Math, priceElement.map(Number));
  }

  const getDiffFrom = function(selector){
    const priceFromStore = getPriceFromElement(selector);
    const diff = product.price - priceFromStore;
    console.log(product.sku, '→ Original/highest:', priceFromStore);
    return Number(diff.toFixed(2));
  }

  const store = PROPS[product.store];
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
    const detected = getDetectedMethod(store.selectors);

    console.log(`${product.sku} → ${detected.method}: ${detected.selector}`);

    switch(detected.method) {
      case 'nostock':
        result.error = 'nostock';
        break
      case 'used':
        result.used = true;
      case 'main':
        result.diff = getDiffFrom(detected.selector);
        break
      case 'alt':
        const altURL = store.alt.url + product.sku;
        productPage = await loadProductPage(altURL);
        html = artoo.helpers.jquerify(productPage.data);

        const pricesList = artoo.scrape(html.find(store.alt.element)).map(price => Number(price.replace('$', '')));
        const tmPriceIndex = pricesList.indexOf(product.price);
        const diff = (tmPriceIndex !== -1) ? 0 : product.price - pricesList[0];

        console.table({ sku: product.sku, url: productURL, diff: diff, all: [pricesList] });

        result.diff = diff;

        if (pricesList.length > 1) result.all = pricesList;
        break
      case 'regex':
        try {
          let element = artoo.scrapeOne(html.find(store.regex.element));
          let found = element.match(store.regex.expression)[2];
          result.diff = Number(product.price) - Number(found);
          console.log("Regex Match:", found);
        } catch {
          console.log(product.sku, "→ Triggered regex search but wasn't found");
          result.error = 'notfound';
        }
        break
      default:
        result.error = 'notfound';
        console.log(product.sku, "→ Couldn't found price in origin store");
    }

  }

  // Return conclusion
  result.url = productURL;
  console.log(product.sku, "→ Result:", result);
  return result;
}


chrome.runtime.onMessage.addListener((product, s, sendResponse) => {
  if (product.store === 'ebay') product.sku = product.sku.match(/\|([+-]?\d+(?:\.\d+)?)\|/)[1];
  console.log(product.sku, '→ Checking', product);
  analyzeThis(product).then(sendResponse);
  return true;
});

console.log("Background loaded");
