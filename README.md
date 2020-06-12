
### Verificador de precios de Tiendamia
Aveces los precios de los productos en Tiendamia no son los correctos :/ Y para verificarlo hay que buscar el mismo producto *a mano* y comparar. Bueno, eso es lo que hace esta extensión.

![screenshot](https://i.imgur.com/TUUonPt.png)

---

### Características

- Al abrir un producto, la extensión va a revisar el precio del mismo en la tienda de origen.
- Al revisar, lo compara e indica si el precio es o no el correcto.
- Agrega un enlace para abrir el producto en la tienda de origen.

**Qué estados indicará?**
 1. Si el precio es el mismo: texto verde y un tick de correcto.
 2. Si el precio es mayor: texto rojo y una X.
 3. Si en la tienda no hay precio listado ó no se pudo verificar por cualquiera sea el motivo: texto naranja y un simbolo de advertencia.
 
El texto siempre se le agregará un link para verificar por uno mismo. A pesar de lo que diga la extensión: es recomendable siempre revisar antes de comprar.

**Nota:** Hay productos donde el precio puede variar dependiendo la personalización del mismo (colores, talles, etc). Y por lo general esos productos van listados con el rango de precios (de la opción más barata a la más cara) hasta que uno elija una opción concreta.

En esos casos, la extensión comparará el precio más alto (la opción más cara en la tienda de origen). Esto es algo que más adelante lo voy a cambiar haciendo que compare exactamente la misma versión.

---

### Get notifications on Telegram using IFTTT
You can get notifications outside your computer sending it through IFTTT. Here are the steps to get the new comments in your Telegram through @IFTTT bot chat.


---

**Build? Dependencias:**

```
npm install artoo-js cheerio jquery regenerator-runtime
```

