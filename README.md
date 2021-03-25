## Verificador de precios de Tiendamia
Hay veces donde el precio del producto en Tiendamia no es el correcto. Esta extensión automatiza el proceso de corroborar que el precio esté actualizado y sea así el mismo que el de la tienda de origen.

***Ves un producto > La extensión corrobora el precio > Ves el resultado ahí mismo***

---

![Ejemplo de un precio que no coincide](https://i.imgur.com/52WuxBq.png)

---

## Características
- Al abrir un producto la extensión revisará su precio en la tienda de origen.
- Al revisarlo comparará los precios y mostrará si es el correcto o no.
- Convierte el texto "Mismo precio que en..." en un link al producto en la tienda original.

#### Qué indicará?
 - Si el precio es el mismo: el texto se pondrá verde y agregará un tick de correcto.
 - Si el precio es mayor al de origen: texto en rojo, una X, y mostrará la diferencia de precio detectada.
 - Si en la tienda no hay precio listado o no se pudo verificar por cualquiera sea el motivo: texto naranja.

El texto que se encuentra bajo el precio, siempre se conviertirá en un enlace al producto en la tienda de origen. A pesar de lo que diga la extensión, es recomendable verificarlo por uno mismo.

## Instalación
[![Instalar desde addons.mozilla.org](https://user-images.githubusercontent.com/10443522/112340646-812f9500-8c9f-11eb-9f4c-4d0045562381.png)](https://addons.mozilla.org/en-US/firefox/addon/verificador-tiendamia/)

 - [**Firefox** (en addons.mozilla.org)](https://addons.mozilla.org/en-US/firefox/addon/verificador-tiendamia/) o desde [GitHub](https://github.com/thepante/verificador-tiendamia/releases/latest/download/verificador-tiendamia-Firefox.xpi)
 - [**Chromium / Chrome**](https://github.com/thepante/verificador-tiendamia/releases/latest/download/verificador-tiendamia-Chrome.crx)

En el caso de Firefox es recomendable instalarla desde addons.mozilla.org y así poder obtener actualizaciones automáticas.
> Queda pendiente distribuirlo por Chrome Web Store.

## Info
#### Por qué esos permisos?
 - `tiendamia.com` - Para detectar el precio del producto y añadir lo visual en TiendaMia¹
 - `amazon.com`, `ebay.com`, `walmart.com` - Para cargar la página del artículo original y detectar su precio²
 - `webRequest` - Para relizar la carga de las páginas mencionadas y así detectar el precio de origen²

Su funcionamiento se trata en detectar el código del artículo (SKU), el precio listado y la tienda de origen¹. Con esos datos, la extensión revisa la publicación de ese producto en su tienda de origen². Evalúa la posible diferencia de precio y finalmente muestra el resultado¹.

#### Notas
Hay productos donde el precio puede variar dependiendo la personalización del mismo (colores, talles, etc). Y por lo general esos productos van listados con el rango de precios (de la opción más barata a la más cara) hasta que uno elija una opción concreta.

En esos casos, la extensión intentará comparar el precio más alto (la opción más cara en la tienda de origen). Esto es algo que más adelante intentaré cambiarlo haciendo que compare exactamente la misma versión.

## Dev
Dependencias: `artoo-js` y `regenerator-runtime`
```bash
npm install    # instalar dependencias
npm run build  # hacer build

# testear la extensión
npm run start:firefox
npm run start:chromium
```
