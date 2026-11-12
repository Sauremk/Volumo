# Volumo

App web de gimnasio en español: cuerpo 3D (hombre/mujer) donde tocas un músculo y ves sus mejores ejercicios, registro de entrenos en libras, rutinas y plan automático, récords, logros, medidas, fotos de progreso y calculadora de calorías.

## Estructura

| Archivo | Qué contiene |
|---|---|
| `src/src.html` | Página principal: estilos, pantallas, datos de usuario, nube, navegación |
| `src/ejercicios.js` | Biblioteca de 73 ejercicios (pasos y consejos) |
| `src/ranking.js` | Ranking de ejercicios por músculo (de mejor a peor) con su fuente |
| `src/body3d.js` | Cuerpo 3D: malla, zonas musculares, relieve, colores, selección |
| `src/human.js` | Mallas humanas hombre/mujer (MakeHuman, CC0) ya procesadas |
| `src/anim.js` | Animaciones de cada ejercicio (figura 2D) |
| `src/wk.js` | Pantalla Entrenar: series, calentamiento, superseries, sugerencias, discos, plan |
| `src/feat.js` | Progreso, logros, perfil, medidas, fotos, nutrición y nube |
| `tools/make_body.py` | Script que genera `human.js` desde los archivos de MakeHuman |
| `dist/index.html` | La app completa en un solo archivo, lista para abrir o publicar |

## Cómo generar la app

```bash
python3 build.py
```

Crea `dist/index.html`. Ábrelo en el navegador o publícalo en cualquier hosting estático.

## Créditos

- Cuerpo 3D: MakeHuman / MPFB (licencia CC0), vía el paquete `humanforge`.
- Three.js (MIT) se carga desde jsDelivr.
