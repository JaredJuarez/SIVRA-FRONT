# SIVRA - Sistema Interactivo de Votación en Tiempo Real

![SIVRA Logo](./public/placeholder-logo.svg)

SIVRA es una aplicación web moderna desarrollada en **Next.js** que permite crear, gestionar y participar en sesiones de votación y encuestas en tiempo real. Diseñada para ser intuitiva y accesible, facilita la recolección de opiniones en eventos, reuniones, conferencias y más.

## ✨ Características Principales

- 🗳️ **Creación de Sesiones de Votación**: Interface administrativa para crear encuestas con múltiples preguntas
- 📊 **Resultados en Tiempo Real**: Visualización instantánea de resultados con gráficos interactivos  
- 📱 **Responsive Design**: Optimizada para dispositivos móviles y escritorio
- 🔗 **Enlaces Únicos**: Cada sesión genera un enlace único para participantes
- 👥 **Sin Registro para Participantes**: Los usuarios pueden votar sin necesidad de crear cuentas
- 🔒 **Control de Acceso**: Un voto por dispositivo por sesión
- 🎨 **UI Moderna**: Interfaz elegante construida con Tailwind CSS y Shadcn/UI

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React con renderizado híbrido
- **TypeScript** - Tipado estático para JavaScript
- **React 18** - Biblioteca de interfaces de usuario
- **Tailwind CSS** - Framework CSS utilitario
- **Shadcn/UI** - Biblioteca de componentes con Radix UI
- **Lucide React** - Iconografía moderna

### Componentes UI
- **Radix UI** - Componentes primitivos accesibles
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos y visualizaciones
- **QRCode** - Generación de códigos QR
- **Sonner** - Notificaciones toast

### Herramientas de Desarrollo
- **PNPM** - Gestor de paquetes eficiente
- **ESLint** - Linter de código
- **PostCSS** - Procesador de CSS
- **Autoprefixer** - Prefijos CSS automáticos

## 📦 Instalación

### Prerrequisitos
- Node.js 18.x o superior
- PNPM (recomendado) o NPM

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/JaredJuarez/SIVRA-FRONT.git
   cd SIVRA-FRONT
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎯 Uso del Sistema

### Para Administradores

1. **Acceso al Panel de Control**
   - Navega a la página principal
   - Usa las credenciales de prueba:
     - Email: `admin@eventos.com`
     - Contraseña: `admin123`

2. **Crear una Sesión de Votación**
   - En el dashboard, haz clic en "Nueva Sesión"
   - Completa la información de la sesión
   - Agrega preguntas y opciones de respuesta
   - Guarda como borrador o activa inmediatamente

3. **Gestionar Sesiones**
   - Activar/desactivar sesiones
   - Ver resultados en tiempo real
   - Generar enlaces para participantes
   - Eliminar sesiones completadas

### Para Participantes

1. **Acceso a la Votación**
   - Usa el enlace único proporcionado: `/vote/[sessionId]`
   - O escanea el código QR generado

2. **Participar en la Votación**
   - Responde todas las preguntas requeridas
   - Confirma y envía tu voto
   - Recibe confirmación de participación

## 🏗️ Estructura del Proyecto

```
SIVRA-FRONT/
├── app/                          # Rutas de Next.js (App Router)
│   ├── admin/                    # Rutas administrativas
│   │   ├── create/              # Crear nuevas sesiones
│   │   ├── dashboard/           # Panel de control principal
│   │   └── session/[id]/        # Vista detallada de sesiones
│   ├── vote/[sessionId]/        # Interfaz de votación pública
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página de inicio/login
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes de Shadcn/UI
│   ├── AdminLayout.tsx          # Layout para páginas admin
│   └── theme-provider.tsx       # Proveedor de temas
├── hooks/                       # Hooks personalizados
├── lib/                         # Utilidades y configuraciones
├── public/                      # Archivos estáticos
└── styles/                      # Estilos adicionales
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo

# Producción
pnpm build        # Construye para producción
pnpm start        # Inicia servidor de producción

# Calidad de Código
pnpm lint         # Ejecuta ESLint
```

## 🌐 Rutas Principales

- `/` - Página de login administrativo
- `/admin/dashboard` - Panel de control principal
- `/admin/create` - Crear nueva sesión de votación
- `/admin/session/[id]` - Ver resultados de sesión específica
- `/vote/[sessionId]` - Interfaz pública de votación

## 💾 Almacenamiento Local

Actualmente el proyecto utiliza **localStorage** para persistir:
- Sesiones de votación creadas
- Votos emitidos por dispositivo
- Estado de autenticación administrativa

> **Nota**: En una implementación de producción, se recomienda integrar con una base de datos real y sistema de autenticación robusto.

## 🎨 Personalización

### Temas
El proyecto incluye soporte para temas claro/oscuro mediante `next-themes`.

### Componentes
Los componentes UI están basados en Shadcn/UI y pueden personalizarse editando:
- `components/ui/` - Componentes individuales
- `tailwind.config.ts` - Configuración de Tailwind
- `app/globals.css` - Variables CSS personalizadas

## 📱 Compatibilidad

- **Navegadores Modernos**: Chrome, Firefox, Safari, Edge
- **Dispositivos Móviles**: iOS Safari, Chrome Mobile
- **Responsive**: Optimizada para pantallas desde 320px hasta 4K

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo Frontend**: Equipo SIVRA
- **Universidad**: UTEZ
- **Semestre**: 9no Semestre
- **Proyecto**: Integradora

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los [Issues existentes](https://github.com/JaredJuarez/SIVRA-FRONT/issues)
2. Crea un nuevo Issue si no existe uno similar
3. Proporciona información detallada sobre el problema

---

**SIVRA** - Haciendo la votación accesible y moderna para todos 🗳️✨
