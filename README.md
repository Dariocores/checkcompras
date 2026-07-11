# CheckCompras - Guía de Uso

Carrito de compras PWA para control de gastos en tiempo real.

---

## Usar en la Computadora (Web)

### Opción 1: Online (recomendado)

1. Abrí la URL de la app en tu navegador (Chrome, Firefox, Edge, Safari)
2. Listo, ya podés usarla

### Opción 2: Desarrollo local

```bash
git clone https://github.com/Dariocores/checkcompras.git
cd checkcompras
npm install
npm run dev
```

Abrí `http://localhost:3000` en tu navegador.

---

## Instalar en el Celular (PWA)

La app se instala directamente desde el navegador, **sin necesidad de Play Store ni App Store**.

### Android (Chrome / Samsung Internet)

1. Abrí la URL de la app en el navegador
2. Tocá los **3 puntos** (menú) en la esquina superior derecha
3. Tocá **"Agregar a pantalla de inicio"**
4. Poné el nombre que quieras (ej: "CheckCompras")
5. Tocá **"Agregar"**

### iPhone / iPad (Safari)

1. Abrí la URL de la app en **Safari**
2. Tocá el botón de **compartir** (cuadro con flecha hacia arriba ↑)
3. Desplazate hacia abajo y tocá **"Agregar a pantalla de inicio"**
4. Tocá **"Agregar"** en la esquina superior derecha

### Una vez instalada

- Aparece un ícono en la pantalla de inicio como cualquier app
- Se abre en pantalla completa (sin barra del navegador)
- **Funciona offline** una vez cargada
- Se actualiza automáticamente cuando hay cambios en el servidor

---

## Funcionalidades

### Múltiples listas de compras

- Usá las **pestañas** arriba del todo para crear, cambiar y eliminar listas
- Cada lista tiene sus productos, presupuesto e IVA independientes
- Ideal para tener listas separadas: Supermercado, Ferretería, Farmacia, etc.
- Tocá **"+ Nueva"** para crear una lista nueva

### Agregar productos

1. Completá el nombre (opcional), cantidad y precio
2. Elegí una categoría (opcional)
3. Tocá **"+ Agregar"**

> Soporta decimales con coma (150,50) o punto (150.50)

### Escanear código de barras

1. Tocá el ícono de **cámara** 📷 en el formulario
2. Apuntá al código de barras del producto
3. Se detecta automáticamente y completa el nombre

> Requiere cámara y un navegador compatible (Chrome, Edge, Samsung Internet)

### Buscar productos

- La barra de **búsqueda** 🔍 filtra productos por nombre en tiempo real
- Tocá la **✕** para limpiar la búsqueda

### Editar un producto

- Tocá sobre el nombre o precio del producto para editarlo inline
- Al editarse, también podés **cambiar la categoría** con el select
- Presioná **Enter** para guardar o **Escape** para cancelar

### Controlar cantidades

- Usá los botones **+** y **−** a la derecha de cada producto

### Ordenar la lista

- Seleccioná un criterio de orden en el selector:
  - **Manual** (orden de agregado)
  - **Nombre** (A-Z)
  - **Precio ↑** (menor a mayor)
  - **Precio ↓** (mayor a menor)
  - **Categoría** (agrupa por categoría)
  - **Cantidad** (mayor a menor)

### Filtrar por categoría

- Los chips debajo del formulario muestran los totales por categoría
- Tocá un chip para filtrar, tocá **"Todos"** para ver todo

### Exportar / Importar datos

- Botón **📥** para exportar la lista actual como archivo JSON
- Botón **📤** para importar una lista desde un archivo JSON
- Sirve para respaldar datos o compartir listas con otros dispositivos

### Compartir la lista

- Tocá el ícono de **compartir** 📤 en el header
- Se comparte por WhatsApp, messenger, email, etc. (según tu celular)
- Si no hay opciones de compartir, se copia al portapapeles

### Presupuesto máximo

1. Ingresá un monto en el campo **"Presupuesto máximo"**
2. Aparece una barra de progreso:
   - **Verde**: dentro del presupuesto
   - **Amarillo**: > 80% del presupuesto
   - **Rojo**: superaste el presupuesto

### IVA

- Activá el checkbox **"IVA 21%"** para incluir el impuesto en el total

### Tema claro / oscuro

- Tocá el ícono de **sol ☀️ / luna 🌙** en el header para cambiar el tema

### Deshacer eliminación

- Al eliminar un producto, aparece un toast con botón **"Deshacer"**
- Tenés unos segundos para recuperar el producto eliminado

### Indicador offline

- Si perdés la conexión, aparece un banner amarillo indicando que los cambios se guardan localmente
- La app sigue funcionando normalmente offline

### Vaciar carrito

- Tocá **"Vaciar carrito"** al final de la lista
- Se pide confirmación antes de borrar todo

---

## Datos y privacidad

- **Todo queda en tu celular**: no se envía ningún dato a servidores
- Los productos se guardan en **localStorage** del navegador
- Podés **exportar** la lista como JSON para tener un respaldo
- La app funciona **completamente offline** después de la primera carga

---

## Dispositivos compatibles

| Dispositivo | Navegador | Escaneo de barras | Notas |
|---|---|---|---|
| Android | Chrome, Edge, Samsung Internet | ✅ Sí | Experiencia completa |
| Android | Firefox | ✅ Sí | Puede requerir permisos adicionales |
| iPhone | Safari | ✅ Sí (iOS 15.4+) | Requiere iOS 15.4 o superior |
| iPhone | Chrome | ✅ Sí (iOS 15.4+) | Misma limitación de iOS |
| Computadora | Chrome, Edge | ✅ Sí | Funciona con cámara USB o integrada |
| Computadora | Firefox, Safari | ❌ No | Resto de funciones disponibles |

---

## Solución de problemas

**No se instala como PWA:**
- Verificá que la conexión sea HTTPS (requerido para PWA)
- En iPhone, asegurate de usar Safari (no Chrome)

**La cámara no funciona:**
- Asegurate de haber dado permiso de cámara al navegador
- En iPhone, verificá en Ajustes → Safari → Cámara

**Se pierden los datos:**
- Los datos se guardan en localStorage del navegador
- Si borrás los datos de navegación, se pierde todo
- **Exportá** la lista regularmente como respaldo (botón 📥)

**La app no carga offline:**
- Necesitás haberla abierto al menos una vez con conexión
- El Service Worker cachea los archivos necesarios para funcionar offline

**Formato de precios:**
- La app acepta tanto coma (150,50) como punto (150.50) como separador decimal
- El formato argentino (1.500,50) también funciona correctamente
