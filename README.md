### Verificador de precios de Tiendamia
Aveces los precios de los productos en Tiendamia no son los correctos :/ Y para verificarlo hay que buscar el mismo producto *a mano* y comparar. Bueno, eso es lo que automatiza esta extensión.

---

![screenshot](https://i.imgur.com/3QWyJRs.png)

---

### Características

- Al abrir un producto, la extensión va a revisar el precio del mismo en la tienda de origen.
- Al revisar, lo compara e indica si el precio es o no el correcto.
- Agrega un enlace para abrir el producto en la tienda de origen.

#### Qué estados señala?
 1. Si el precio es el mismo: texto verde y un tick de correcto.
 2. Si el precio es mayor: texto rojo y una X.
 3. Si en la tienda no hay precio listado ó no se pudo verificar por cualquiera sea el motivo: texto naranja.
 
El texto siempre se le agregará un link para verificar por uno mismo. A pesar de lo que diga la extensión: es recomendable siempre revisar antes de comprar.

---

### Instalación
En [/releases](https://github.com/thepante/verificador-tiendamia/releases) siempre van a estar todos los archivos listos. O directamente:
 - [**Firefox**](https://github.com/thepante/verificador-tiendamia/releases/latest/download/verificador-tiendamia-Firefox.xpi)
 - [**Chromium**](https://github.com/thepante/verificador-tiendamia/releases/latest/download/verificador-tiendamia-Chromium.crx)

**Chrome**:
Para tenerlo en Chrome hay que usarlo desempaquetado. Descargar el .crx o el [unpacked.zip](https://github.com/thepante/verificador-tiendamia/releases/latest/download/unpacked.zip) y extraer el contenido. Luego ir al panel de extensiones del navegador (chrome://extensions), activar el "modo desarrollador", y nos habilita la opción "cargar desempaquetada", click allí y seleccionar la carpeta donde extraimos los archivos.

**Por qué esos permisos?**:
 - tiendamia.com y activeTab: Para detectar el precio del producto y añadir lo visual en TiendaMia
 - amazon.com, ebay.com y walmart.com: Para cargar la página del artículo y tomar el precio original a comparar
 - webRequest: Relizar la carga de las páginas mencionadas

---

#### Nota: 
Hay productos donde el precio puede variar dependiendo la personalización del mismo (colores, talles, etc). Y por lo general esos productos van listados con el rango de precios (de la opción más barata a la más cara) hasta que uno elija una opción concreta.

En esos casos, la extensión intentará comparar el precio más alto (la opción más cara en la tienda de origen). Esto es algo que más adelante lo voy a cambiar haciendo que compare exactamente la misma versión. **Puede fallar, por cierto**.

---

**Build? Dependencias:** 
 - artoo-js 
 - cheerio  
 - jquery 
 - regenerator-runtime
```
npm install
```

