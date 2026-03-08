# Registro de Cambios

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

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

[No publicado]: https://github.com/dony/dony-tools/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/dony/dony-tools/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/dony/dony-tools/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/dony/dony-tools/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/dony/dony-tools/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/dony/dony-tools/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/dony/dony-tools/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/dony/dony-tools/releases/tag/v1.0.0
