# Sumerios - Gestión de Gastos 📊

Budget Manager es una aplicación móvil diseñada para llevar un control estricto de finanzas personales y profesionales. Desarrollada con un enfoque **Offline-First**, permite a los usuarios registrar ingresos y egresos, adjuntar comprobantes fotográficos y visualizar balances mensuales de manera instantánea, sin depender de una conexión a internet.

## 🚀 Características Principales

- **Funcionamiento Offline-First:** Los datos se guardan inmediatamente de forma local asegurando latencia cero.
- **Sincronización Cloud:** Los registros y fotografías se sincronizan en segundo plano con Firebase cuando se detecta conexión a internet.
- **Gestión Visual:** Gráficos de torta dinámicos para el desglose de gastos por categoría.
- **Gestión de Comprobantes:** Captura nativa y guardado de comprobantes fotográficos de los movimientos.
- **Arquitectura Robusta:** Patrón de diseño basado en capas con manejo de estado centralizado y resolución de conflictos mediante UUIDs criptográficos.

## 🛠️ Stack Tecnológico

- **Framework:** [React Native](https://reactnative.dev/) (con [Expo](https://expo.dev/))
- **Navegación:** [React Navigation](https://reactnavigation.org/)
- **Estado Global:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Base de Datos Local:** `expo-sqlite`
- **Backend / BaaS:** Firebase (Firestore, Storage, Authentication)
- **Generación de UUID:** `expo-crypto`

## 📁 Estructura del Proyecto

El código fuente se organiza de manera modular bajo el directorio `/src`:

\`\`\`text
src/
 ├── components/    # Componentes visuales atómicos (UI tonta)
 ├── controller/    # Lógica de orquestación entre UI, Redux y Persistencia
 ├── hooks/         # Custom hooks para encapsular lógica de negocio
 ├── navigation/    # Configuración de rutas y Stacks
 ├── screens/       # Vistas principales de la aplicación
 ├── services/      # Servicios externos (Firebase, Queries locales de SQLite)
 └── store/         # Configuración del estado global (Redux slices)
\`\`\`

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### Prerrequisitos
- [Node.js](https://nodejs.org/) instalado.
- [Expo CLI](https://docs.expo.dev/get-started/installation/) configurado en tu máquina.
- Una cuenta en Firebase y un proyecto creado.

### Pasos

1. **Clonar el repositorio**
   \`\`\`bash
   git clone https://github.com/maxdrag0/budget-manager
   cd sumerios-app
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar Variables de Entorno**
   Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Firebase y Google Maps (si aplica):
   \`\`\`env
   EXPO_PUBLIC_API_KEY=tu_api_key
   EXPO_PUBLIC_AUTH_DOMAIN=tu_dominio
   EXPO_PUBLIC_PROJECT_ID=tu_project_id
   EXPO_PUBLIC_STORAGE_BUCKET=tu_storage_bucket
   EXPO_PUBLIC_MESSAGING_SENDER_ID=tu_sender_id
   EXPO_PUBLIC_APP_ID=tu_app_id
   EXPO_PUBLIC_MEASUREMENT_ID=tu_measurement_id
   \`\`\`

4. **Ejecutar la aplicación**
   \`\`\`bash
   npx expo start -c
   \`\`\`
   Escanea el código QR generado en la terminal con la app **Expo Go** en tu dispositivo físico, o presiona `a` para abrir el emulador de Android / `i` para el simulador de iOS.

## 👨‍💻 Autor

**Maximiliano Drago** - [[LinkedIn](Enlace a tu perfil)](https://www.linkedin.com/in/maximiliano-drago/es/)
- [GitHub][(Enlace a tu GitHub)](https://github.com/maxdrag0)
