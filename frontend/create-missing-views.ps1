# create-missing-views.ps1
# Ejecutar desde: C:\schooltrack\schooltrack\frontend

Write-Host "Creando archivos de vistas faltantes..." -ForegroundColor Cyan

# Crear directorios si no existen
$dirs = @(
    "src\views\auth",
    "src\views\vehicles",
    "src\views\routes",
    "src\views\stops",
    "src\views\users"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Creado directorio: $dir" -ForegroundColor Green
    }
}

# Plantilla base para componentes de lista
$listTemplate = @'
<template>
  <div class="__NAME__-list">
    <div class="header">
      <h1>__TITLE__</h1>
      <router-link :to="{ name: '__NAME__Create' }" class="btn-primary">
        Crear __SINGULAR__
      </router-link>
    </div>
    <div class="content">
      <p>Lista de __TITLE_LOWER__</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])

onMounted(async () => {
  // Cargar datos
})
</script>

<style scoped>
.__NAME__-list {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
'@

# Plantilla base para componentes de formulario
$formTemplate = @'
<template>
  <div class="__NAME__-form">
    <h1>{{ isEdit ? 'Editar' : 'Crear' }} __SINGULAR__</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nombre</label>
        <input v-model="form.name" type="text" required />
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Guardar</button>
        <router-link :to="{ name: '__NAME__s' }" class="btn-secondary">
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const form = ref({ name: '' })

const handleSubmit = async () => {
  console.log('Guardando:', form.value)
  // Implementar lógica de guardado
  router.push({ name: '__NAME__s' })
}
</script>

<style scoped>
.__NAME__-form {
  padding: 2rem;
  max-width: 600px;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-actions {
  display: flex;
  gap: 1rem;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #95a5a6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
'@

# Plantilla base para componentes de detalle
$detailTemplate = @'
<template>
  <div class="__NAME__-detail">
    <div class="header">
      <h1>Detalle de __SINGULAR__</h1>
      <div class="actions">
        <router-link :to="{ name: '__NAME__Edit', params: { id: $route.params.id } }" class="btn-primary">
          Editar
        </router-link>
        <router-link :to="{ name: '__NAME__s' }" class="btn-secondary">
          Volver
        </router-link>
      </div>
    </div>
    <div class="content">
      <p>Información detallada</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const item = ref(null)

onMounted(async () => {
  // Cargar datos del item
  console.log('Cargando item:', route.params.id)
})
</script>

<style scoped>
.__NAME__-detail {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.actions {
  display: flex;
  gap: 1rem;
}
.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 4px;
  color: white;
}
.btn-primary {
  background: #3498db;
}
.btn-secondary {
  background: #95a5a6;
}
</style>
'@

# Función para crear archivo si no existe
function Create-ViewFile {
    param($path, $content)
    if (!(Test-Path $path)) {
        $content | Out-File -FilePath $path -Encoding UTF8
        Write-Host "Creado: $path" -ForegroundColor Green
    } else {
        Write-Host "Ya existe: $path" -ForegroundColor Yellow
    }
}

# Crear archivos de vehículos
Create-ViewFile "src\views\vehicles\VehicleList.vue" ($listTemplate -replace '__NAME__', 'Vehicle' -replace '__TITLE__', 'Vehículos' -replace '__SINGULAR__', 'Vehículo' -replace '__TITLE_LOWER__', 'vehículos')
Create-ViewFile "src\views\vehicles\VehicleForm.vue" ($formTemplate -replace '__NAME__', 'Vehicle' -replace '__SINGULAR__', 'Vehículo')
Create-ViewFile "src\views\vehicles\VehicleDetail.vue" ($detailTemplate -replace '__NAME__', 'Vehicle' -replace '__SINGULAR__', 'Vehículo')

# Crear archivos de rutas
Create-ViewFile "src\views\routes\RouteList.vue" ($listTemplate -replace '__NAME__', 'Route' -replace '__TITLE__', 'Rutas' -replace '__SINGULAR__', 'Ruta' -replace '__TITLE_LOWER__', 'rutas')
Create-ViewFile "src\views\routes\RouteForm.vue" ($formTemplate -replace '__NAME__', 'Route' -replace '__SINGULAR__', 'Ruta')
Create-ViewFile "src\views\routes\RouteDetail.vue" ($detailTemplate -replace '__NAME__', 'Route' -replace '__SINGULAR__', 'Ruta')

# Crear archivos de paradas
Create-ViewFile "src\views\stops\StopList.vue" ($listTemplate -replace '__NAME__', 'Stop' -replace '__TITLE__', 'Paradas' -replace '__SINGULAR__', 'Parada' -replace '__TITLE_LOWER__', 'paradas')
Create-ViewFile "src\views\stops\StopForm.vue" ($formTemplate -replace '__NAME__', 'Stop' -replace '__SINGULAR__', 'Parada')
Create-ViewFile "src\views\stops\StopDetail.vue" ($detailTemplate -replace '__NAME__', 'Stop' -replace '__SINGULAR__', 'Parada')

# Crear archivos de usuarios
Create-ViewFile "src\views\users\UserList.vue" ($listTemplate -replace '__NAME__', 'User' -replace '__TITLE__', 'Usuarios' -replace '__SINGULAR__', 'Usuario' -replace '__TITLE_LOWER__', 'usuarios')
Create-ViewFile "src\views\users\UserForm.vue" ($formTemplate -replace '__NAME__', 'User' -replace '__SINGULAR__', 'Usuario')

# Crear vistas individuales
$registerContent = @'
<template>
  <div class="register-view">
    <div class="register-card">
      <h1>Registro</h1>
      <form @submit.prevent="handleRegister">
        <input v-model="form.firstName" type="text" placeholder="Nombre" required />
        <input v-model="form.lastName" type="text" placeholder="Apellido" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="Contraseña" required />
        <button type="submit">Registrarse</button>
      </form>
      <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const form = ref({ firstName: '', lastName: '', email: '', password: '' })
const handleRegister = () => { console.log('Register:', form.value) }
</script>

<style scoped>
.register-view { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
.register-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
.register-card form { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
.register-card input { padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; }
.register-card button { padding: 0.75rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>
'@

Create-ViewFile "src\views\auth\Register.vue" $registerContent

$trackingContent = @'
<template>
  <div class="tracking-view">
    <h1>Rastreo en Tiempo Real</h1>
    <div class="map-container">
      <p>Mapa de seguimiento de vehículos</p>
    </div>
  </div>
</template>

<script setup>
// Componente de tracking
</script>

<style scoped>
.tracking-view { padding: 2rem; }
.map-container { height: 600px; background: #ecf0f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
</style>
'@

Create-ViewFile "src\views\Tracking.vue" $trackingContent

$profileContent = @'
<template>
  <div class="profile-view">
    <h1>Mi Perfil</h1>
    <div class="profile-content">
      <p>Información del usuario</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const user = ref({})
</script>

<style scoped>
.profile-view { padding: 2rem; }
.profile-content { background: white; padding: 2rem; border-radius: 8px; margin-top: 1rem; }
</style>
'@

Create-ViewFile "src\views\Profile.vue" $profileContent

$notFoundContent = @'
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <router-link to="/" class="btn-primary">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
.not-found h1 { font-size: 4rem; color: #e74c3c; }
.btn-primary { margin-top: 2rem; padding: 0.75rem 1.5rem; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
</style>
'@

Create-ViewFile "src\views\NotFound.vue" $notFoundContent

Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Ahora ejecuta: npm run dev" -ForegroundColor Cyan