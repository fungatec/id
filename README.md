# FungaTec — Tarjeta de presentación digital

Sitio de una sola página que reúne todos los canales de FungaTec y enlaza a la
biblioteca **FugiDocs**. Sin dependencias, sin build, sin frameworks: se sube a
GitHub Pages tal cual y funciona.

```
fungatec-web/
├── index.html      ← contenido y enlaces
├── styles.css      ← diseño (los colores de marca están arriba del todo)
├── script.js       ← animaciones e interacciones
├── server.js       ← servidor local, solo para desarrollo
└── assets/
    └── favicon.svg ← icono de la pestaña
```

---

## 1. Qué falta por configurar

### a) Los enlaces

Abre `index.html` y busca `REEMPLAZAR`. Hay **7 enlaces** por completar:

| Buscar | Poner |
|---|---|
| `#REEMPLAZAR-URL-FUGIDOCS` | URL de la biblioteca FugiDocs |
| `#REEMPLAZAR-URL-INSTAGRAM` | `https://instagram.com/tu_usuario` |
| `#REEMPLAZAR-URL-FACEBOOK` | `https://facebook.com/tu_pagina` |
| `#REEMPLAZAR-URL-TIKTOK` | `https://tiktok.com/@tu_usuario` |
| `#REEMPLAZAR-URL-YOUTUBE` | `https://youtube.com/@tu_canal` |
| `#REEMPLAZAR-URL-LINKEDIN` | `https://linkedin.com/company/tu_empresa` |
| `#REEMPLAZAR-URL-WEB-O-CORREO` | Tu web, o `mailto:hola@fungatec.com` |

Debajo de cada nombre hay un `<small>` con el usuario visible (`@fungatec`);
cámbialo por el real.

Mientras falten enlaces, la consola del navegador (F12) te avisa cuántos quedan.

### b) Los colores de marca

En `styles.css`, primeras líneas, bloque `:root`. Cambia estos 7 valores y **todo
el sitio se recolorea solo**, incluida la red de micelio del fondo:

```css
--bg:      #050B09;   /* fondo casi negro          */
--bg-2:    #0A1512;   /* fondo secundario          */
--primary: #35E08A;   /* verde principal FungaTec  */
--accent:  #59E8DA;   /* cian de apoyo             */
--gold:    #E6C36A;   /* dorado micelio            */
--text:    #E9F4EF;   /* texto                     */
--muted:   #8FA79C;   /* texto secundario          */
```

> ⚠️ Los colores actuales son **provisionales**. Sustitúyelos por los oficiales
> de FungaTec.

### c) El logo

El logo actual es un SVG dibujado a mano dentro de `index.html` (hexágono +
hongo + esporas animadas). Para usar el tuyo:

1. Copia tu logo a `assets/logo.svg` (o `.png`).
2. En `index.html`, dentro de `<div class="logo">`, sustituye todo el bloque
   `<svg>…</svg>` por:
   ```html
   <img src="assets/logo.svg" alt="FungaTec" width="112" height="112">
   ```

### d) Textos y números

- Descripciones de "Quiénes somos": sección `id="nosotros"`.
- Métricas: atributos `data-count` (`120`, `45`, `8`). Pon tus cifras reales.
- Imagen de vista previa al compartir: crea `assets/og-image.jpg` (1200×630 px).

---

## 2. Verlo en tu computadora

```bash
node server.js
```

Luego abre `http://localhost:4321`. (Abrir `index.html` con doble clic también
funciona, pero algunas cosas se comportan mejor servidas.)

---

## 3. Publicar en GitHub Pages

```bash
git init
git add .
git commit -m "Tarjeta de presentación de FungaTec"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/fungatec-web.git
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Source: `main` / carpeta `/ (root)` → Save**.

En un par de minutos estará en `https://TU_USUARIO.github.io/fungatec-web/`.

Para usar un dominio propio (`fungatec.com`), crea un archivo llamado `CNAME`
con el dominio dentro y apunta el DNS a GitHub Pages.

---

## 4. Qué trae por dentro

- **Fondo de micelio interactivo**: esporas en canvas que se enlazan entre sí y
  reaccionan al cursor. Toma los colores de las variables CSS, se pausa cuando
  la pestaña no está visible y baja su densidad en móviles.
- **Animaciones de entrada** escalonadas al hacer scroll (IntersectionObserver).
- **Tarjetas con inclinación 3D** y halo que sigue al cursor.
- **Botones magnéticos** que se acercan al puntero.
- **Contador animado** de métricas.
- **Botón compartir**: menú nativo en el celular, copiar enlace en escritorio.
- **Barra de progreso** de lectura.
- Diseño **responsive** verificado a 375 px y 1440 px, sin desbordes.
- Respeta **`prefers-reduced-motion`**: si el usuario pidió menos animación, se
  desactivan los efectos y el canvas.
- Metadatos **SEO y Open Graph** listos.

---

## 5. Rendimiento

Sin librerías externas. Lo único que se descarga de fuera son las tipografías de
Google Fonts (Sora e Inter). Si quieres cero dependencias externas, descarga los
`.woff2` a `assets/fonts/` y sustituye el `<link>` por un `@font-face`.
