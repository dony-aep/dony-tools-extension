# Registro de Cambios

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

## [4.0.0] - 2026-08-11

Una reconstrucción con dos objetivos: que el panel nunca interrumpa a After Effects,
y que se lea como parte de él en lugar de como una aplicación metida dentro. Casi
todo lo que sigue se deriva de uno de los dos.

### Cambios incompatibles

- **La versión mínima pasa a ser After Effects 2022 (22.0).** El manifest de la 3.x declaraba CC 2018, pero el panel ya dependía de funciones del navegador que ningún runtime tan antiguo ofrece. El piso declarado ahora coincide con lo que el código necesita de verdad.
- **El bundle id pasa a ser `com.donyaep.DonyTools`.** After Effects lo trata como una extensión nueva: hay que borrar la carpeta antigua `com.dony.tools` del directorio de extensiones CEP y reiniciar After Effects una vez. Los presets guardados sobreviven al cambio.

### Nada de lo que hace el panel puede bloquear After Effects

- Todo mensaje que antes pasaba por el `alert()` y el `confirm()` del host se muestra ahora dentro del panel. Un modal lanzado desde el motor de scripting deja a After Effects secuestrado hasta que alguien lo cierra.
- Todo lo que escribe el usuario — nombres de preset, plantillas de módulo de salida, nombres de carpeta — se escapa antes de llegar a ExtendScript. Una sola comilla producía un script malformado, y After Effects responde a eso justamente con la clase de diálogo bloqueante de arriba.
- Los grupos de deshacer se cierran exactamente una vez, incluso cuando algo por encima lanza una excepción; una función del host tenía seis cierres para dos aperturas. Los fallos del host ahora se reportan, en lugar de dejar botones que no hacen nada en silencio.

### Se lee como parte de After Effects

- El panel toma sus grises del tema del propio host y sigue el deslizador de brillo en vivo, en vez de pintar un negro fijo. Cada nivel se resuelve para un ratio de contraste contra la superficie sobre la que se apoya, en lugar de elegirse a ojo — y los tests demuestran ahora que la rampa aguanta con cualquier gris que el host pueda reportar, no solo con los cuatro que reporta.
- Monocromo estricto: el estado se lee por icono, peso y luminancia, nunca por tinte. La excepción es la selección, que adopta el color de resaltado del propio host, así que una selección aquí coincide con cualquier otra selección de la aplicación.
- Los controles son planos — los identifica su relleno, no un contorno. Es una desviación deliberada de la WCAG 1.4.11, que pide 3:1 al contorno de un control: inalcanzable para un control relleno sobre un panel casi negro sin volver gris medio toda la interfaz. `tokens.css` deja anotado el compromiso y los dos valores que devuelven el aspecto con contorno.

### Navegación pensada para un panel acoplado

- Un rail de herramientas sustituye a la pantalla de inicio. Todo queda a un clic de todo lo demás; el hub costaba dos clics para llegar a una herramienta y un tercero para salir de ella, que es la forma equivocada para un panel que se usa en ráfagas cortas junto al comp.
- El layout responde al ancho del panel: compacto por debajo de 300px, etiquetas al lado de su control a 380px, y el rail abriéndose para nombrar sus herramientas a 480px. After Effects ignora el MinSize del manifest en cuanto el panel se acopla, así que el rango real es el que el usuario arrastre.

### Cimientos

- Una capa de tokens y un juego de primitivas compartidas — `Button`, `Icon`, `Section`, `Toggle`, `ValueField`, `Dropdown` — sustituyen a estilos que estaban copiados y pegados en cinco pestañas.
- Las fuentes y los iconos viajan con el panel. Abierto sin conexión, la 3.x caía a una fuente del sistema y dibujaba cada icono como el nombre literal de su ligadura.
- La lógica que no necesita pantalla — emparejado de presets, conversiones del setup, escapado, la rampa de color — se movió a `src/lib` con 84 tests que la cubren.
- Base CEP modernizada: CSInterface v11, manifest CSXS 11, target de build `chrome88`.

### Corregido

- El texto quedaba por debajo de WCAG AA en todo el panel: títulos de sección y descripciones medían 2.14:1 donde se exige 4.5:1. La tinta supera 4.5:1 allí donde lleva texto, y los tests fallan si eso deja de cumplirse.
- El indicador de foco de teclado era un contorno de 1px al 40% de opacidad. Ahora es un anillo de 2px, en todos los controles, y los campos de texto lo llevan dentro de su propio marco en lugar de flotando por fuera.
- El layout estaba calibrado contra un panel de 350px; los paneles acoplados suelen tener 270px o menos, y ahí los campos emparejados colapsaban y el texto de las opciones se salía del borde del panel.
- El host reutilizaba su namespace entre cargas, así que las funciones eliminadas en una versión nueva seguían siendo invocables hasta reiniciar After Effects.
- El quick setup 4:3 anunciaba 1440×1080; crea 1600×1080.
- Las animaciones respetan `prefers-reduced-motion`.

## [3.0.0] - 2026-02-14

### Añadido

- Migración completa a React 19 + TypeScript + Vite, reemplazando la arquitectura legacy basada en JSX/HTML.
- React Aria Components para primitivos de UI accesibles y sin estilos (botones, desplegables, modales, checkboxes).
- CSS Modules por componente para estilos encapsulados y sin colisiones.
- Controles del efecto Twixtor Pro: Speed %, Input Frame Rate, Motion Vectors, Image Prep, Frame Interp y Warping con valores correctos para Twixtor v5–v8.
- Sistema de detección del plugin Twixtor que verifica la instalación y compatibilidad de propiedades v5+ al cargar la pestaña.
- Barra de información de Twixtor mostrando el estado del plugin (compatible, incompatible o no encontrado) en la parte inferior de la pestaña Twixtor.
- Tooltips al pasar el cursor (`title`) y atributos `aria-label` en todos los elementos interactivos de cada pestaña, cabecera y modal para mejorar la accesibilidad.
- Soporte de `aria-label` en el componente reutilizable Dropdown.
- Panel de inicio (Home) con navegación por pila reemplazando la barra de pestañas tradicional para mejor descubrimiento de funciones.
- Modo batch de Twixtor para aplicar el efecto a todas las capas seleccionadas simultáneamente mediante un checkbox.
- Diálogo de confirmación al guardar un preset con un nombre existente para prevenir sobreescrituras accidentales.
- Lista interactiva de carpetas con botones de añadir/eliminar en Custom Setup, reemplazando el campo de texto plano.
- Componente Error Boundary que captura errores de React y muestra un fallback con opciones de Recargar/Descartar.
- Contexto global de React (`AppProvider` + `useApp()` hook) para gestión centralizada del estado de la extensión.
- Versión dinámica obtenida de `package.json` mediante inyección en tiempo de compilación de Vite.

### Cambiado

- Rediseño completo de la UI con estética monocromática "Darkroom": fondos #0c0c0c, texto atenuado, bordes sutiles, tipografía Google Sans.
- Secciones planas sin bordes con separación visual mediante divisores, reemplazando los paneles estilo tarjeta.
- Barra de pestañas reemplazada por panel Home + navegación por pila (Home → Función → Botón Atrás).
- Sistema de diseño responsive basado en panel usando flex/container queries en lugar de breakpoints `@media`.
- CustomSetupModal completamente rediseñado con layout mejorado, gestión de presets y personalización de nombres de composiciones.
- Componente Dropdown mejorado con funcionalidad de búsqueda, posicionamiento popover y navegación por teclado.
- Todos los componentes reestructurados en arquitectura modular de carpetas (`components/tabs/`, `components/ui/`, `components/modals/`).
- Target de compilación configurado a Chrome 57 para compatibilidad con CEP 8 / After Effects CC 2018+.
- Todos los iconos PNG reemplazados por Google Material Symbols Outlined (weight 200, FILL 0) para un sistema de iconos unificado.
- Iconos de la pestaña Anchor Point cambiados de imágenes PNG estáticas a flechas direccionales de Material Symbols.
- Tokens de border-radius incrementados para un aspecto más suave y moderno (`--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`).
- Tamaños de botones y controles refinados en el modal Custom Setup para alineación visual consistente.

### Corregido

- Sólido huérfano `__detect__` que quedaba en el proyecto de After Effects tras la detección del plugin Twixtor (limpieza añadida en bloque `finally`).
- Tamaño desalineado de botones en el modal Custom Setup para los controles de composiciones y carpetas.

## [2.0.1] - 2025-04-09

### Añadido

- Polyfill JSON para mejorar la estabilidad y compatibilidad con diferentes entornos de AE.
- Botón de refresco en la sección "Cargar Ajuste Preestablecido" del modal de Configuración Personalizada para recargar manualmente los presets desde el archivo JSON.
- Menú Desplegable del Panel (Flyout Menu) con opciones para refrescar la ventana de la extensión y abrir la documentación.
- Retroalimentación visual (icono de check y texto "Cargado") al botón "Cargar Ajuste Preestablecido" durante 2 segundos tras una carga exitosa.

## [2.0.0] - 2025-03-20

### Añadido

- Interfaz moderna y responsiva con tema oscuro y tooltips personalizados.
- Interfaz con pestañas para una mejor organización de herramientas.
- Menús desplegables mejorados con funcionalidad de búsqueda para presets, resoluciones, valores de FPS y módulos de salida.
- Configuración de proyecto personalizada con capacidad para nombrar composiciones y asignarlas a carpetas.
- Diseño responsivo para diferentes tamaños de panel.

### Cambiado

- Migración completa de script JSX a una extensión CEP completa.
- Experiencia de usuario mejorada con controles intuitivos.
- Se mantiene toda la funcionalidad de versiones anteriores con mejoras significativas en la UI.

## [1.2.0] - 2025-02-20

### Añadido

- Tab Render Settings: Botón para acceder fácilmente a la ubicación de los ajustes de módulos de salida.
- Tab Setup: Botón para acceder a la ubicación de los presets del proyecto.

### Cambiado

- Todas las Tabs: Diseño responsive mejorado para un mejor redimensionamiento de ventana.
- Tab Anchor Point: Controles reorganizados en un diseño vertical con secciones tituladas.
- Tab About: Organización mejorada del panel de información.

## [1.1.0] - 2025-01-31

### Cambiado

- Tab Setup: Se reemplazaron los botones de texto con botones de íconos para las configuraciones preestablecidas 16:9, 1:1 y 4:3.
- Tab Setup: Se ajustaron los tamaños de los botones para una mejor consistencia visual.
- Tab About: UI mejorada para una mejor legibilidad y experiencia de usuario.
- Tab Twixtor Pro: Se mejoró la eficiencia de la colocación de fotogramas clave para la propiedad "Speed %".

## [1.0.1] - 2025-01-08

### Corregido

- Problema donde los módulos de salida no se cargaban correctamente después de reiniciar After Effects.

### Cambiado

- Formato JSON mejorado para mayor fiabilidad.

### Eliminado

- Sanitización innecesaria del JSON.

## [1.0.0]

### Añadido

- Versión inicial con un conjunto completo de herramientas.
- Automatización de Twixtor Pro para ajustes de velocidad.
- Gestión del punto de anclaje con posicionamiento rápido y controles de desplazamiento.
- Optimización de la cola de renderizado con selección de módulo de salida y renderizado automático.
- Utilidades de configuración del proyecto con ajustes preestablecidos y personalizados.

[No publicado]: https://github.com/dony-aep/dony-tools-extension/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/dony-aep/dony-tools-extension/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/dony-aep/dony-tools-extension/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/dony-aep/dony-tools-extension/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/dony-aep/dony-tools-extension/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/dony-aep/dony-tools-extension/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/dony-aep/dony-tools-extension/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/dony-aep/dony-tools-extension/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/dony-aep/dony-tools-extension/releases/tag/v1.0.0
