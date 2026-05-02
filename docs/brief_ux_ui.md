# Brief de UX/UI: Konevx 2.0

**Lenguaje de Diseño:** Minimalista de Alta Tecnología (Estilo Stark).
**Colores Primarios:** #0B0E14 (Espacio Profundo), #00D1FF (Azul Eléctrico), #FFFFFF (Blanco Puro).

---

## 1. Interfaces Clave

### A. Landing de Registro (Público)

- **Objetivo:** Cero fricción.
- **UI:** Columna única, tipografía grande, guardado automático de estado en LocalStorage.
- **Estado de Éxito:** Generación dinámica de QR con botón de "Añadir a Apple/Google Wallet".

### B. Dashboard del Comandante (Admin/Líder)

- **Objetivo:** Claridad de datos y toma de decisiones.
- **UI:** Diseño basado en cuadrícula (Bento Grid). Contador de asistentes en tiempo real con animación de pulso.
- **Visuales:** Gráfico de salud financiera (ingresos vs. pendientes) y barra de progreso de capacidad del evento.

### C. App Centinela (Staff Móvil/Tablet)

- **Objetivo:** Velocidad absoluta.
- **UI:** Interfaz centrada en la cámara. Indicadores visuales gigantes: Verde para "VÁLIDO", Rojo para "INVÁLIDO".
- **Modo Offline:** Indicador flotante que muestra "Sincronización Pendiente: 12" cuando no hay internet.

---

## 2. Principios de Interacción

- **Percepción de Velocidad:** Cada acción debe disparar un feedback visual en < 100ms, incluso si la API tarda 200ms.
- **Manejo de Errores:** Uso de notificaciones "Toast" que no bloqueen el flujo de la interfaz.
- **Navegación:** Paleta de Comandos (`Cmd + K`) para administradores, permitiendo navegación ultrarrápida entre eventos y búsquedas.

- **Percepción de Velocidad:** Cada acción debe disparar un feedback visual en < 100ms, incluso si la API tarda 200ms.
- **Manejo de Errores:** Uso de notificaciones "Toast" que no bloqueen el flujo de la interfaz.
- **Navegación:** Paleta de Comandos (`Cmd + K`) para administradores, permitiendo navegación ultrarrápida entre eventos y búsquedas.
