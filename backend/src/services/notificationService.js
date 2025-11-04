const User = require('../models/User');
const Student = require('../models/Student');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');

class NotificationService {
  constructor() {
    this.notificationQueue = [];
    this.processing = false;
  }

  // Agregar notificación a la cola
  async queueNotification(notification) {
    this.notificationQueue.push({
      ...notification,
      id: Date.now() + Math.random(),
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date()
    });

    if (!this.processing) {
      this.processQueue();
    }
  }

  // Procesar cola de notificaciones
  async processQueue() {
    this.processing = true;

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        await this.sendNotification(notification);
      } catch (error) {
        notification.attempts++;
        
        if (notification.attempts < notification.maxAttempts) {
          // Re-encolar para reintentar
          this.notificationQueue.push(notification);
        } else {
          console.error('Notificación fallida después de múltiples intentos:', notification);
        }
      }

      // Pequeña pausa para no saturar el sistema
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  // Enviar notificación individual
  async sendNotification(notification) {
    const { type, recipients, title, message, data = {} } = notification;

    // Enviar según las preferencias de cada destinatario
    for (const recipient of recipients) {
      const user = await User.findById(recipient.userId);
      if (!user || !user.isActive) continue;

      // Notificaciones Push
      if (user.notificationSettings.push && recipient.methods.includes('push')) {
        await this.sendPushNotification(user, title, message, data);
      }

      // Email
      if (user.notificationSettings.email && recipient.methods.includes('email')) {
        await this.sendEmailNotification(user, title, message, data);
      }

      // SMS
      if (user.notificationSettings.sms && recipient.methods.includes('sms') && user.phone) {
        await this.sendSMSNotification(user, message, data);
      }
    }

    // Guardar notificación en base de datos
    await this.saveNotification(notification);
  }

  // Enviar notificación push
  async sendPushNotification(user, title, message, data) {
    try {
      const activeDevices = user.getActiveDevices();
      
      for (const device of activeDevices) {
        // Aquí se integraría con el servicio de notificaciones push (FCM, APNs, etc.)
        console.log(`Push notification enviada a ${user.email} en dispositivo ${device.type}: ${title}`);
        
        // Simulación de envío
        // En producción, aquí iría la lógica real de envío
        this.simulatePushNotification(device.token, title, message, data);
      }
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      throw error;
    }
  }

  // Enviar notificación por email
  async sendEmailNotification(user, title, message, data) {
    try {
      // Aquí se integraría con el servicio de email (SendGrid, AWS SES, etc.)
      console.log(`Email enviado a ${user.email}: ${title}`);
      
      // Simulación de envío
      this.simulateEmailNotification(user.email, title, message, data);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }

  // Enviar notificación por SMS
  async sendSMSNotification(user, message, data) {
    try {
      if (!user.phone) return;
      
      // Aquí se integraría con el servicio de SMS (Twilio, AWS SNS, etc.)
      console.log(`SMS enviado a ${user.phone}: ${message.substring(0, 50)}...`);
      
      // Simulación de envío
      this.simulateSMSNotification(user.phone, message, data);
    } catch (error) {
      console.error('Error enviando SMS:', error);
      throw error;
    }
  }

  // Guardar notificación en base de datos
  async saveNotification(notification) {
    try {
      // Aquí se guardaría en una colección de notificaciones
      // Por simplicidad, solo logueamos
      console.log('Notificación guardada en BD:', notification.id);
    } catch (error) {
      console.error('Error guardando notificación:', error);
    }
  }

  // Métodos específicos de notificación

  // Notificar a padres sobre pickup/dropoff
  async notifyParentPickupDropoff(studentId, action, vehicleId, driverId) {
    try {
      const student = await Student.findById(studentId).populate('parent');
      if (!student || !student.parent) return;

      const vehicle = await Vehicle.findById(vehicleId);
      const driver = await User.findById(driverId);
      const route = vehicle ? await Route.findById(vehicle.assignedRoute) : null;

      const studentName = `${student.firstName} ${student.lastName}`;
      const driverName = driver ? `${driver.firstName} ${driver.lastName}` : 'Conductor';
      const vehicleInfo = vehicle ? `${vehicle.model} ${vehicle.brand} (${vehicle.licensePlate})` : 'Autobús';

      let title, message;

      if (action === 'pickup') {
        title = '🚌 Estudiante en Camino';
        message = `${studentName} ha subido al autobús. Conductor: ${driverName}. Vehículo: ${vehicleInfo}. Hora: ${new Date().toLocaleTimeString()}`;
      } else if (action === 'dropoff') {
        title = '🏫 Estudiante en Destino';
        message = `${studentName} ha llegado a la escuela. Hora: ${new Date().toLocaleTimeString()}`;
      }

      const notification = {
        type: `student_${action}`,
        recipients: [{
          userId: student.parent._id,
          methods: ['push', 'email']
        }],
        title: title,
        message: message,
        data: {
          studentId: studentId,
          studentName: studentName,
          vehicleId: vehicleId,
          vehicleInfo: vehicleInfo,
          driverId: driverId,
          driverName: driverName,
          routeId: route?._id,
          routeName: route?.name,
          action: action,
          timestamp: new Date()
        }
      };

      await this.queueNotification(notification);

    } catch (error) {
      console.error('Error notificando pickup/dropoff:', error);
    }
  }

  // Notificar retrasos
  async notifyDelay(recipients, routeId, estimatedDelay, reason) {
    try {
      const route = await Route.findById(routeId);
      const routeName = route ? route.name : 'Ruta desconocida';

      const notification = {
        type: 'route_delay',
        recipients: recipients,
        title: '⚠️ Retraso en Ruta',
        message: `Retraso estimado de ${estimatedDelay} minutos en la ruta ${routeName}. ${reason || ''}`,
        data: {
          routeId: routeId,
          routeName: routeName,
          estimatedDelay: estimatedDelay,
          reason: reason,
          timestamp: new Date()
        }
      };

      await this.queueNotification(notification);

    } catch (error) {
      console.error('Error notificando retraso:', error);
    }
  }

  // Notificar incidentes o emergencias
  async notifyEmergency(recipients, incidentType, location, description) {
    try {
      const notification = {
        type: 'emergency',
        recipients: recipients,
        title: '🚨 Incidente Reportado',
        message: `Tipo: ${incidentType}. Ubicación: ${location}. ${description}`,
        data: {
          incidentType: incidentType,
          location: location,
          description: description,
          timestamp: new Date(),
          priority: 'high'
        }
      };

      await this.queueNotification(notification);

    } catch (error) {
      console.error('Error notificando emergencia:', error);
    }
  }

  // Notificar cambios de ruta
  async notifyRouteChange(recipients, routeId, changes, reason) {
    try {
      const route = await Route.findById(routeId);
      const routeName = route ? route.name : 'Ruta desconocida';

      const notification = {
        type: 'route_change',
        recipients: recipients,
        title: '🔄 Cambio de Ruta',
        message: `Cambio en ruta ${routeName}. Motivo: ${reason}`,
        data: {
          routeId: routeId,
          routeName: routeName,
          changes: changes,
          reason: reason,
          timestamp: new Date()
        }
      };

      await this.queueNotification(notification);

    } catch (error) {
      console.error('Error notificando cambio de ruta:', error);
    }
  }

  // Notificar recordatorios diarios
  async notifyDailySummary(recipients, date, summary) {
    try {
      const notification = {
        type: 'daily_summary',
        recipients: recipients,
        title: '📊 Resumen Diario',
        message: `Resumen del día ${date.toLocaleDateString()}: ${summary}`,
        data: {
          date: date,
          summary: summary,
          timestamp: new Date()
        }
      };

      await this.queueNotification(notification);

    } catch (error) {
      console.error('Error notificando resumen diario:', error);
    }
  }

  // Métodos de simulación (para desarrollo)
  simulatePushNotification(deviceToken, title, message, data) {
    console.log(`[SIMULACIÓN PUSH] Token: ${deviceToken.substring(0, 10)}...`);
    console.log(`[SIMULACIÓN PUSH] Título: ${title}`);
    console.log(`[SIMULACIÓN PUSH] Mensaje: ${message}`);
    console.log(`[SIMULACIÓN PUSH] Datos:`, data);
  }

  simulateEmailNotification(email, title, message, data) {
    console.log(`[SIMULACIÓN EMAIL] Para: ${email}`);
    console.log(`[SIMULACIÓN EMAIL] Asunto: ${title}`);
    console.log(`[SIMULACIÓN EMAIL] Mensaje: ${message.substring(0, 100)}...`);
    console.log(`[SIMULACIÓN EMAIL] Datos:`, data);
  }

  simulateSMSNotification(phone, message, data) {
    console.log(`[SIMULACIÓN SMS] Para: ${phone}`);
    console.log(`[SIMULACIÓN SMS] Mensaje: ${message.substring(0, 50)}...`);
    console.log(`[SIMULACIÓN SMS] Datos:`, data);
  }
}

module.exports = new NotificationService();