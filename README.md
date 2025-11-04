# SchoolTrack 🚌

Sistema completo de seguimiento de transporte escolar con aplicación web moderna, API REST y tracking en tiempo real.

## 📋 Descripción

SchoolTrack es una solución integral para la gestión y seguimiento de transporte escolar que permite:
- Visualización en tiempo real de vehículos
- Gestión de rutas y paradas
- Seguimiento de estudiantes
- Comunicación entre conductores y padres
- Reportes y análisis de datos

## ✨ Características

### Backend (Node.js + MongoDB)
- ✅ API REST completa con autenticación JWT
- ✅ WebSocket para tracking en tiempo real
- ✅ Integración con GraphHopper (rutas y ETA)
- ✅ Integración con Nominatim (geocodificación)
- ✅ Sistema de roles y permisos
- ✅ Validación de datos
- ✅ Documentación con Swagger

### Frontend (Vue.js 3)
- ✅ Interfaz moderna y responsive
- ✅ Dashboard en tiempo real
- ✅ Mapas interactivos con Leaflet
- ✅ Gestión completa CRUD
- ✅ Sistema de notificaciones
- ✅ Diseño adaptativo

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **Socket.IO** (WebSocket)
- **JWT** (Autenticación)
- **GraphHopper** (Rutas)
- **Nominatim** (Geocodificación)

### Frontend
- **Vue.js 3** + **Vue Router 4**
- **Vuex 4** (Estado)
- **Leaflet** (Mapas)
- **Bootstrap 5**
- **Socket.IO Client**
- **Chart.js** (Gráficos)

## 📦 Instalación Rápida

### Opción 1: Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd schooltrack
```

2. **Iniciar con Docker Compose**
```bash
docker-compose up -d
```

3. **Poblar base de datos**
```bash
docker exec schooltrack-backend npm run seed
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api
- MongoDB: localhost:27017

### Opción 2: Instalación Manual

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run serve
```

## 🔐 Credenciales de Prueba

- **Administrador**: admin@schooltrack.com / admin123
- **Conductor**: juan.perez@schooltrack.com / driver123
- **Padre**: carlos.gonzalez@email.com / parent123

## 📊 Estructura del Proyecto

```
schooltrack/
├── backend/                 # API REST
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Servicios externos
│   │   └── middleware/     # Middleware
│   └── Dockerfile
├── frontend/               # Aplicación Vue.js
│   ├── src/
│   │   ├── components/     # Componentes Vue
│   │   ├── views/          # Vistas principales
│   │   ├── store/          # Vuex modules
│   │   └── router/         # Vue Router
│   └── Dockerfile
├── docker-compose.yml      # Configuración Docker
└── README.md
```

## 🗺️ Uso de la Aplicación

### Dashboard Principal
- Visualización de estadísticas en tiempo real
- Mapa con ubicación de vehículos
- Últimas actualizaciones y actividades

### Gestión de Vehículos
- CRUD completo de vehículos
- Asignación de conductores
- Seguimiento de ubicación
- Mantenimiento y estado

### Gestión de Rutas
- Creación de rutas optimizadas
- Asignación de paradas
- Cálculo de tiempos de llegada
- Visualización en mapa

### Seguimiento en Tiempo Real
- Ubicación en vivo de vehículos
- Actualizaciones automáticas
- Notificaciones de llegada
- Historial de recorridos

## 🔧 Configuración

### Variables de Entorno Backend
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/schooltrack
JWT_SECRET=tu_secreto_jwt
GRAPHHOPPER_API_KEY=tu_api_key
NOMINATIM_API_URL=https://nominatim.openstreetmap.org
```

### Variables de Entorno Frontend
```env
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_SOCKET_URL=http://localhost:3000
VUE_APP_MAPTILER_KEY=tu_api_key_maptiler
```

## 📱 Características Móviles

- Diseño responsive completo
- Menú desplegable para móvil
- Controles táctiles optimizados
- Notificaciones push (próximamente)
- PWA ready

## 🔒 Seguridad

- Autenticación JWT
- Encriptación de contraseñas
- Validación de entrada
- CORS configurado
- Rate limiting
- Roles y permisos

## 📈 Rendimiento

- Lazy loading de componentes
- Caché de peticiones
- Optimización de imágenes
- Code splitting
- WebSocket eficiente

## 🧪 Pruebas

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test:unit
```

## 🚀 Despliegue

### Producción con Docker
```bash
# Construir imágenes
docker-compose build

# Iniciar en modo producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Despliegue Manual
1. Configurar variables de entorno
2. Construir frontend: `npm run build`
3. Iniciar backend: `npm start`
4. Servir archivos estáticos del frontend

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Desarrollado por:
- **Juan Carlos Barrón López** - Backend Developer
- **Irma Deyanira Aranda Mejía** - Frontend Developer  
- **Jose Christian Molina Arguello** - DevOps Engineer

## 📞 Soporte

Para soporte técnico:
- Email: soporte@schooltrack.com
- Documentación: https://docs.schooltrack.com
- Issues: https://github.com/schooltrack/schooltrack/issues

## 🌟 Demo en Vivo

Puedes ver una demo en vivo en: **https://schooltrack-demo.com**

---

**SchoolTrack** - Conectando familias con seguridad y tranquilidad 🚌✨