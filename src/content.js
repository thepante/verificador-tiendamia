import $ from "jquery";

var bg = chrome.runtime.connect({name:"content-port"});

// Get product info
var product = {
  sku: document.getElementById("SKU_producto_ajax").innerText,
  price: get_price_from("finalprice_producto_ajax"),
  store: document.baseURI.match(/(\?)([^\=]+)/)[2]
};

// Clean ebay sku
if (product.store == 'ebay') {
  product.sku = product.sku.match(/\|([+-]?\d+(?:\.\d+)?)\|/)[1];
}

// Assign correct div for 'same price as' text
var divSamePrice = ".same-price-amz";

if (product.store != 'amz') {
		divSamePrice = "#product-price-clone .amz-span";
}

// Get price and clean currency symbol
function get_price_from(css_id){
	let price = document.getElementById(css_id).innerText;
	price = price.match(/[+-]?\d+(?:\.\d+)?/g)[0];
	return price;
}

console.log(product);

function append_style(style){
	$(`<style> ${style} </style>`).appendTo("head");
}

// Visuals to show price correctness
function display_info(info){
	// Apply dollar sign if is showing other currency
	let curreny_sign = "";
	if (document.querySelectorAll(".currency_select_off")[0].style.display != 'inline') {
		curreny_sign = "U$S ";
	}

	// Failed verification
	if (info.diff == 26244224) {
		append_style(`
			#product-price-clone .price { opacity: 0.5; }
			${divSamePrice}:before { content: '\\26A0'; margin-right: 5px; }
			${divSamePrice}, ${divSamePrice} a { color: orange !important; }
		`);
		let same_price_text = document.querySelectorAll(divSamePrice)[0].innerText;
		document.querySelectorAll(divSamePrice)[0].innerHTML = `No se pudo verificar el precio`;
	}
	// If price is higher
	else if (info.diff > 0) {
		append_style(`
			${divSamePrice}:before { content: '\\2717'; float: left; margin-right: 5px; }
			${divSamePrice}, ${divSamePrice} a { text-decoration: line-through; color: red !important; }
			#product-price-clone .price { color: red; font-size: 22px; }
			#product-price-clone .price:after { content: "(${curreny_sign}${info.diff.toFixed(0)}+)"; font-weight: bold; padding-left: 8px; font-size: 26px; }
		`);
	} 
	// If price is correct
	else {
		append_style(`
			${divSamePrice}:before { content: '\\2714'; }
			${divSamePrice} { color: green; }
		`);
	}

	let samePriceText = document.querySelectorAll(divSamePrice)[0].innerText;
	document.querySelectorAll(divSamePrice)[0].innerHTML = `<a href="${info.url}" target="_blank" title="Ver en la tienda de origen">${samePriceText}</a>`;
}

// Listen to background
bg.onMessage.addListener( function(m) {

	if (m.response) {
		console.log("Background notifies:", m.response);
		display_info(m.response);
	}

});

// Send product to background
let productViewPage = ["/producto?", "/e-product?", "/productow?"];
if (productViewPage.some(el => document.baseURI.includes(el))) {
	bg.postMessage({product: product});
	console.log("Product page, request check");
}

console.log("Content js loaded");
