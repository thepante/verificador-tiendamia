const skuDiv = document.getElementById("SKU_producto_ajax");
const optionsDiv = document.getElementById('product-options-wrapper');

// Get product info
let product = {
  sku: null,
  price: null,
  store: null,
};

function fillProductData() {
  let storeCode = document.baseURI.match(/(\?)([^\=]+)/)[2];
  product.store = storeCode;
  product.price = getPriceFrom("finalprice_producto_ajax");
  product.sku = (storeCode === 'ebay')
    ? skuDiv.innerText.match(/\|([+-]?\d+(?:\.\d+)?)\|/)[1]
    : skuDiv.innerText;

  console.info(product);
}
fillProductData();

// Assign correct div for 'same price as' text
let divSamePrice = (product.store === 'amz') ? ".same-price-amz" : "#product-price-clone .amz-span";

// Assign store name by its code
let storeName = (product.store === 'amz') ? 'Amazon' : (product.store === 'ebay') ? 'eBay' : 'Walmart';

// Modify price info text HTML
const originalText = document.querySelector(divSamePrice).innerText;
const spinner = `<div id="vt-spinner" class="sk-chase"><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div></div>`;
const infoHTML = `
  <div id="vt-status">${spinner}</div>
  <span id="vt-splabel" style="float: left; margin-left: 5px; opacity: 0.6;">${originalText}</span>
`;
document.querySelector(divSamePrice).innerHTML = infoHTML;
const statusDiv = document.getElementById('vt-status');
const labelNode = document.getElementById('vt-splabel');

// Get price and clean currency symbol
function getPriceFrom(cssID){
	let price = document.getElementById(cssID).innerText;
	price = price.match(/[+-]?\d+(?:\.\d+)?/g)[0];
	return Number(price);
}

function appendStyle(rules){
  let s = document.createElement('style');
  s.setAttribute('type', 'text/css');
  s.appendChild(document.createTextNode(rules));
  document.head.appendChild(s);
}

const icon = {
  tick: `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
    <polyline class="path check" fill="none" stroke="#73AF55" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
    </svg>`,
  cross: `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
    <line class="path line" fill="none" stroke="#D06079" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>
    <line class="path line" fill="none" stroke="#D06079" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>
    </svg>`,
  warn: `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="#cf8525" d="M256,128.877c-11.046,0-20,8.954-20,20V277.67c0,11.046,8.954,20,20,20s20-8.954,20-20V148.877 C276,137.831,267.046,128.877,256,128.877z"/>
    <circle fill="#cf8525" cx="256" cy="349.16" r="27"/>
    </svg>`
}

function setLabel(text, url) {
  labelNode.style.opacity = '1';
  labelNode.innerHTML = `<a href="${url ? url : '#'}" target="_blank" title="Ver el producto en la tienda de origen">${text}</a>`;
}

// Colors
const RIGHT = '#588f22'; // green
const WRONG = '#8f2f22'; // darkred
const WARN  = '#cf8525'; // orange

/**
 * Receives the result from background and apply the correct styling
 * @param {object} response - Response from background
 */
function handleResponse(response){
  console.log("→ Response: ", response);

  // if not displaying in dollars, add symbol
  let priceInDollars = document.querySelector('.webcurrency_off .dollar_price');
  let currencySign = (!priceInDollars) ? "U$S " : "";

  let label = originalText;
  let statusMark;
  let cssRules = '';
  let textColor = '';
  let priceStyle = ''

  let dimmedPrice = 'opacity: 0.6;';
  let warnedPrice = 'color:#c83333;font-size:20px;'

  if (response.error){
    textColor = WARN;
    priceStyle += dimmedPrice;
    statusMark = icon.warn;

    switch(response.error){
      case 'noprice':
        console.log("This product has not price so there's nothing to check...");
        console.log("TODO: change this action to show (if) the price from store");
        break;
      case 'notfound':
        console.log("Can't verify price - Price in original store not found");
        label = 'No se encontró el precio en ' + storeName;
        break;
      case 'nostock':
        // console.log("Original store has no stock");
        label = 'Producto sin stock en ' + storeName;
        break;
      case 'fetcherror':
        console.log("Original store wasn't loaded so checking failed from the go to");
        break;
    }

  } else if ('diff' in response){
    if (response.diff > 0) {
      label = 'No es el mismo precio que en ' + storeName;
      priceStyle += warnedPrice;
      textColor = WRONG;
      statusMark = icon.cross;
      cssRules += `
        #product-price-clone .price:after {
          content: "${currencySign + response.diff.toFixed(0)}+";
          font-weight: bold; padding-left: 8px; font-size: 26px;
          padding: 0px 8px;
          font-size: 22px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 1px 4px #7777770a;
        }
      `;

      document.getElementById('finalprice_producto_ajax').title = 'Precio en TiendaMia';
      document.querySelector('#product-price-clone .price').title = `U$S ${product.price - response.diff} en ${storeName}`;

    } else {
      // All right, same price
      label = 'Mismo precio que en ' + storeName;
      textColor = RIGHT;
      statusMark = icon.tick;
    }
  }

  if (response.used){
    console.log("Detected this product in the original store published as used");
    label += '<br>Figura como usado';
    textColor = WARN;
  }

  // Update text and styling
  setLabel(label, response.url);
  cssRules += ` #vt-splabel, #vt-splabel a {color:${textColor};} #product-price-clone .price {${priceStyle}}`;
  statusDiv.innerHTML = statusMark;

  appendStyle(cssRules);
};

// if options, watch for selection change
if (optionsDiv) {
  let observer = new MutationObserver(function(mutations) {
    console.info(mutations, skuDiv.innerText, product.sku)
    if (skuDiv.innerText !== product.sku) {
      statusDiv.innerHTML = spinner;
      setLabel('Analizando...');
      fillProductData();
      chrome.runtime.sendMessage(product, handleResponse);
    }
  });

  observer.observe(skuDiv, {attributes: true, childList: true, characterData: true});
}

// Send product to background
let productViewPage = ["/producto?", "/e-product?", "/productow?"];
if (productViewPage.some(el => document.baseURI.includes(el))) {
  console.log("Request check");
  chrome.runtime.sendMessage(product, handleResponse);
}

console.log("Content js loaded");
