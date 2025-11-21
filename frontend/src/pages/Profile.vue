<template>
  <div class="container mt-5">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col">
        <h1 class="display-5">
          <i class="fas fa-user-circle me-2"></i>
          Mi Perfil
        </h1>
        <p class="text-muted">Gestiona tu información personal y preferencias</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="pageError" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ pageError }}
      <button type="button" class="btn-close" @click="pageError = ''" aria-label="Close"></button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3 text-muted">Cargando tu perfil...</p>
    </div>

    <!-- Profile Content -->
    <div v-else class="row">
      <!-- Left Column: Avatar -->
      <div class="col-lg-4 mb-4">
        <ProfileAvatarUpload 
          :user="user" 
          @avatar-updated="onAvatarUpdated"
          @avatar-deleted="onAvatarDeleted" />
      </div>

      <!-- Right Column: Profile Info & Settings -->
      <div class="col-lg-8">
        <!-- Personal Information -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-info-circle me-2"></i>
              Información Personal
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="firstName" class="form-label">Nombre</label>
                  <input 
                    type="text" 
                    id="firstName"
                    v-model="formData.firstName"
                    class="form-control"
                    :disabled="!editingProfile || loadingProfile"
                    required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="lastName" class="form-label">Apellido</label>
                  <input 
                    type="text" 
                    id="lastName"
                    v-model="formData.lastName"
                    class="form-control"
                    :disabled="!editingProfile || loadingProfile"
                    required>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    v-model="formData.email"
                    class="form-control"
                    :disabled="!editingProfile || loadingProfile"
                    required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="phone" class="form-label">Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone"
                    v-model="formData.phone"
                    class="form-control"
                    :disabled="!editingProfile || loadingProfile">
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Rol</label>
                  <input 
                    type="text" 
                    :value="getRoleLabel(user.role)"
                    class="form-control"
                    disabled>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Estado</label>
                  <input 
                    type="text" 
                    :value="user.active ? 'Activo' : 'Inactivo'"
                    class="form-control"
                    disabled>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button 
                  v-if="!editingProfile"
                  type="button" 
                  @click="editingProfile = true"
                  class="btn btn-warning">
                  <i class="fas fa-edit me-2"></i>
                  Editar Información
                </button>
                <template v-else>
                  <button 
                    type="submit" 
                    :disabled="loadingProfile"
                    class="btn btn-success">
                    <span v-if="loadingProfile" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardar Cambios
                  </button>
                  <button 
                    type="button"
                    @click="cancelEditProfile"
                    class="btn btn-secondary">
                    Cancelar
                  </button>
                </template>
              </div>
            </form>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="card mb-4">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">
              <i class="fas fa-lock me-2"></i>
              Seguridad
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Contraseña Actual</label>
                <input 
                  type="password" 
                  id="currentPassword"
                  v-model="passwordData.currentPassword"
                  class="form-control"
                  :disabled="loadingPassword">
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">Nueva Contraseña</label>
                <input 
                  type="password" 
                  id="newPassword"
                  v-model="passwordData.newPassword"
                  class="form-control"
                  :disabled="loadingPassword">
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  v-model="passwordData.confirmPassword"
                  class="form-control"
                  :disabled="loadingPassword">
                <small v-if="passwordData.newPassword !== passwordData.confirmPassword" class="text-danger">
                  Las contraseñas no coinciden
                </small>
              </div>

              <button 
                type="submit" 
                :disabled="!isPasswordFormValid() || loadingPassword"
                class="btn btn-primary">
                <span v-if="loadingPassword" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cambiar Contraseña
              </button>
            </form>
          </div>
        </div>

        <!-- Account Settings -->
        <div class="card border-danger">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Zona de Peligro
            </h5>
          </div>
          <div class="card-body">
            <p class="text-muted mb-3">
              Estas acciones son permanentes y no se pueden deshacer.
            </p>
            <button 
              @click="deleteProfile" 
              :disabled="loadingDelete"
              class="btn btn-danger">
              <span v-if="loadingDelete" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Eliminar Mi Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ProfileAvatarUpload from '@/components/ProfileAvatarUpload.vue';

const router = useRouter();

const user = reactive({
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  active: true,
  avatar: ''
});

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(true);
const loadingProfile = ref(false);
const loadingPassword = ref(false);
const loadingDelete = ref(false);
const editingProfile = ref(false);
const pageError = ref('');

const getRoleLabel = (role) => {
  const roles = {
    admin: 'Administrador',
    driver: 'Conductor',
    parent: 'Padre/Madre',
    student: 'Estudiante',
    school_admin: 'Admin Escuela'
  };
  return roles[role] || role;
};

const loadProfile = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/profile');
    
    Object.assign(user, response.data.data);
    Object.assign(formData, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    });
  } catch (error) {
    pageError.value = error.response?.data?.message || 'Error al cargar el perfil';
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  loadingProfile.value = true;
  try {
    const response = await axios.put('/api/profile', formData);
    Object.assign(user, response.data.data);
    editingProfile.value = false;
    pageError.value = '';
  } catch (error) {
    pageError.value = error.response?.data?.message || 'Error al actualizar el perfil';
  } finally {
    loadingProfile.value = false;
  }
};

const cancelEditProfile = () => {
  Object.assign(formData, {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone
  });
  editingProfile.value = false;
};

const isPasswordFormValid = () => {
  return passwordData.currentPassword && 
         passwordData.newPassword && 
         passwordData.confirmPassword &&
         passwordData.newPassword === passwordData.confirmPassword;
};

const changePassword = async () => {
  loadingPassword.value = true;
  try {
    await axios.put('/api/profile/password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    pageError.value = '';
    passwordData.currentPassword = '';
    passwordData.newPassword = '';
    passwordData.confirmPassword = '';
    
    // Mostrar mensaje de éxito
    alert('Contraseña cambiada exitosamente');
  } catch (error) {
    pageError.value = error.response?.data?.message || 'Error al cambiar la contraseña';
  } finally {
    loadingPassword.value = false;
  }
};

const deleteProfile = async () => {
  const password = prompt('Para eliminar tu cuenta, ingresa tu contraseña:');
  
  if (!password) {
    return;
  }

  if (!confirm('¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
    return;
  }

  loadingDelete.value = true;
  try {
    await axios.delete('/api/profile', {
      data: { password }
    });
    
    // Redirigir al login
    router.push('/login');
  } catch (error) {
    pageError.value = error.response?.data?.message || 'Error al eliminar la cuenta';
  } finally {
    loadingDelete.value = false;
  }
};

const onAvatarUpdated = (avatarData) => {
  user.avatar = avatarData.avatar;
};

const onAvatarDeleted = () => {
  user.avatar = '';
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.display-5 {
  color: #2c3e50;
  font-weight: 600;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  border-radius: 8px 8px 0 0;
  font-weight: 500;
}

form input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.btn {
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .display-5 {
    font-size: 2rem;
  }

  .col-lg-4,
  .col-lg-8 {
    margin-bottom: 2rem;
  }
}
</style>
