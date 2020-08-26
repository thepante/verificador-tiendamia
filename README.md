### Verificador de precios de Tiendamia
Aveces los precios de los productos en Tiendamia no son los correctos :/ Y para corroborar que sea el correcto hay que buscar el mismo producto *a mano* y comparar. Bueno, eso es lo que automatiza esta extensión.

> **Ves un producto en TiendaMia → la extensión verifica el precio → ves el resultado sin salir de la página**

---

![screenshot](https://i.imgur.com/52WuxBq.png)

---

### Características

- Al abrir un producto, la extensión revisará su precio en la tienda de origen.
- Al revisar: lo compara y mostrará si es diferente o es el correcto.
- Convierte el texto "Mismo precio que en..." en un link al producto en la tienda original.

#### Qué señalará?
 - Si el precio es el mismo: el texto se pondrá verde y agregará un tick de correcto.
 - Si el precio es mayor al de origen: texto en rojo, una X, y se mostrará la diferencia de precio detectada.
 - Si en la tienda no hay precio listado o no se pudo verificar por cualquiera sea el motivo: texto naranja.

El texto que se encuentra bajo el precio, siempre se conviertirá en un link al producto en la tienda de origen. A pesar de lo que diga la extensión: es recomendable siempre revisar antes de comprar.

---

### Instalación
En [/releases](https://github.com/thepante/verificador-tiendamia/releases) siempre van a estar todos los archivos listos. O directamente:
 - [**Firefox**](https://github.com/thepante/verificador-tiendamia/releases/latest/download/verificador-tiendamia-Firefox.xpi)
 - [**Chromium / Chrome**](https://github.com/thepante/verificador-tiendamia/releases/latest/download/verificador-tiendamia-Chrome.crx)

**Alternativa**:
En Chromium/Chrome se puede *instalar* con el [unpacked.zip](https://github.com/thepante/verificador-tiendamia/releases/latest/download/unpacked.zip). Ir al panel de extensiones del navegador `chrome://extensions`, activar el `modo desarrollador`, y nos habilita la opción `cargar desempaquetada`, click allí y seleccionar la carpeta donde extraimos los archivos del .zip en cuestión.

**Por qué esos permisos?**:
 - `tiendamia.com` - Para detectar el precio del producto y añadir lo visual en TiendaMia
 - `amazon.com`, `ebay.com`, `walmart.com` - Para cargar la página del artículo y evaluar el precio original
 - `webRequest` - Relizar la carga de las páginas mencionadas para tomar el precio de origen

---

**Nota:** Hay productos donde el precio puede variar dependiendo la personalización del mismo (colores, talles, etc). Y por lo general esos productos van listados con el rango de precios (de la opción más barata a la más cara) hasta que uno elija una opción concreta.

En esos casos, la extensión intentará comparar el precio más alto (la opción más cara en la tienda de origen). Esto es algo que más adelante trataré de cambiarlo haciendo que compare exactamente la misma versión.

---

**Build?** Las dependencias que usa son `artoo-js`, `cheerio` y `regenerator-runtime`
```bash
npm install    # instala las dependencias
npm run build  # para hacer build
```

