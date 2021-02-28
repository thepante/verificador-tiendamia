const divs = {
  sku: document.getElementById("SKU_producto_ajax"),
  options: document.getElementById('product-options-wrapper'),
  priceWrap: document.querySelector('.product-price-box-wrap'),
  priceIsInUSD: document.querySelector('.webcurrency_off .dollar_price'),
}

// Product main info
const product = {
  sku: null,
  price: null,
  store: null,
};

// Fill product info through this function because its called at initial page load
// but also when a product option is selected (different SKU)
function fillProductData() {
  product.store = document.baseURI.match(/(\?)([^\=]+)/)[2];
  product.price = getPriceFrom("finalprice_producto_ajax");
  product.sku = divs.sku.innerText;
  console.info(product);
}

fillProductData();

// Assign correct div for 'same price as' text
let samePriceSelector = (product.store === 'amz') ? ".same-price-amz" : "#product-price-clone .amz-span";

// Assign store name by its code
let storeName = (product.store === 'amz') ? 'Amazon' : (product.store === 'ebay') ? 'eBay' : 'Walmart';

// Colors
const colors = {
  right: '#588f22', // green
  wrong: '#8f2f22', // darkred
  warn:  '#cf8525', // orange
}

// Labels texts
const lang = {
  es: {
      viewInStore: "Ver el producto en la tienda de origen",
        samePrice: `Mismo precio que en ${storeName}`,
     notSamePrice: `No es el mismo precio que en ${storeName}`,
    priceNotFound: `No se encontró el precio en ${storeName}`,
          noStock: `Producto sin stock en ${storeName}`,
           isUsed: "Figura como usado",
       cantVerify: "No se pudo comprobar el precio",
        priceInTM: "Precio en TiendaMia",
        analyzing: "Analizando...",
  },
  pt: {
      viewInStore: "Veja o produto na loja de origem",
        samePrice: `Mesmo preço da ${storeName}`,
     notSamePrice: `Não é o mesmo preço de ${storeName}`,
    priceNotFound: `Preço não encontrado na ${storeName}`,
          noStock: `Produto esgotado na ${storeName}`,
           isUsed: "Está listado como usado",
       cantVerify: "Preço não pôde ser verificado",
        priceInTM: "Preço na TiendaMia",
        analyzing: "Analisando...",
  },
}

const isBrSite = document.baseURI.match(/tiendamia.com\/br/) != null;
const texts = isBrSite ? lang.pt : lang.es;

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
    </svg>`,
  spinner: `<div id="vt-spinner" class="sk-chase"><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div></div>`,
}

// Modify price info text HTML
divs.samePrice = document.querySelector(samePriceSelector);
const originalText = divs.samePrice.innerText;
const statusHTML = `
  <div id="vt-status">${icon.spinner}</div>
  <span id="vt-splabel" style="float: left; margin-left: 5px; opacity: 0.6;">${originalText}</span>
`;
divs.samePrice.innerHTML = statusHTML;
divs.samePrice.style.display = 'flex';
divs.status = document.getElementById('vt-status');
divs.label  = document.getElementById('vt-splabel');

// Get price and clean currency symbol
function getPriceFrom(id) {
  let price = document.getElementById(id).innerText;
	price = price.match(/[+-]?\d+(?:\.\d+)?/g)[0];
	return Number(price);
}

/**
 * Set CSS rules
 * @param {object} rules - String containing CSS rules
 */
function updateStyle(rules){
  const styleVT = document.getElementById('vt-styling');
  if (styleVT) {
    styleVT.innerHTML = rules;
  } else {
    let s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.setAttribute('id', 'vt-styling');
    s.appendChild(document.createTextNode(rules));
    document.head.appendChild(s);
  }
}

/**
 * Display info about price correctness
 * @param {object} Object - At least `label` have to be present
 */
function showStatus({url, label, color, opacity, mark, priceStyle, diffDisplayed}) {
  divs.status.innerHTML = mark || icon.spinner;
  divs.label.style.opacity = opacity ? String(opacity) : '1';
  divs.label.innerHTML = `<a href="${url || '#'}" target="_blank" title="${texts.viewInStore}">${label}</a>`;

  let css = '';
  if (priceStyle) css += ` #product-price-clone .price {${priceStyle}}`;
  if (diffDisplayed) css += `
    #product-price-clone .price:after {
      content: "${diffDisplayed}+";
      font-weight: bold; padding-left: 8px; font-size: 26px;
      padding: 0px 8px;
      font-size: 22px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 1px 4px #7777770a;
    }
  `;

  css += ` #vt-splabel, #vt-splabel a {color:${color || 'black'};}`;
  updateStyle(css);
}

/**
 * Receives the result from background and apply the correct styling
 * @param {object} response - Response from background
 */
function handleResponse(response){
  console.table([{...product, ...response}]);

  // if not displaying in dollars, add USD symbol
  let currencySign = !divs.priceIsInUSD ? "U$S " : "";

  let dimmedPrice = 'opacity: 0.6;';
  let warnedPrice = 'color:#c83333;font-size:20px;';

  let info = {
    label: originalText,
    url: response.url,
    priceStyle: '',
    css: ''
  };

  if (response.error){
    info.priceStyle += dimmedPrice;
    info.color = colors.warn;
    info.mark = icon.warn;

    switch(response.error){
      case 'noprice':
        // TODO: in case the origin store has price listed: notify and display here
        console.log("This product has not price so there's nothing to check...");
        break;
      case 'notfound':
        console.log("Can't verify price - Price in original store not found");
        info.label = texts.priceNotFound;
        break;
      case 'nostock':
        // console.log("Original store has no stock");
        info.label = texts.noStock;
        break;
      case 'fetcherror':
        info.label = texts.cantVerify;
        console.log("Original store wasn't loaded so checking failed from the get go");
        break;
    }

  } else if ('diff' in response){
    if (response.diff > 0) {
      info.label = texts.notSamePrice;
      info.priceStyle += warnedPrice;
      info.color = colors.wrong;
      info.mark = icon.cross;
      info.diffDisplayed = `${currencySign + response.diff.toFixed(0)}`;

      document.getElementById('finalprice_producto_ajax').title = texts.priceInTM;
      document.querySelector('#product-price-clone .price').title = `U$S ${(product.price - response.diff).toFixed(2)} en ${storeName}`;

    } else {
      // All right, same price
      info.label = texts.samePrice;
      info.color = colors.right;
      info.mark = icon.tick;
    }
  }

  if (response.used){
    console.log("Detected this product in the origin store published as used");
    info.label += '<br>' + texts.isUsed;
    info.color = colors.warn;
  }

  // Update status
  showStatus(info);
};

// if product options, watch for selection change
if (divs.options) {
  let observer = new MutationObserver(function(mutations) {
    // console.info(divs.sku.innerText, product.sku)
    if ((divs.sku.innerText !== product.sku) && divs.priceWrap.className.indexOf('hidden') === -1) {
      showStatus({label: texts.analyzing, opacity: 0.6});
      fillProductData();
      chrome.runtime.sendMessage(product, handleResponse);
    }
  });

  observer.observe(divs.sku, {childList: true, characterData: true});
}

// Send product to background
if (document.baseURI.match(/\/(producto|e-product|productow)\?/g)) {
  console.log("Request check");
  chrome.runtime.sendMessage(product, handleResponse);
}

console.log("Content js loaded");
