# Imagen base
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar código fuente
COPY . .

# Crear usuario no root y asignar permisos
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Healthcheck apuntando a endpoint real
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Comando por defecto
CMD ["node", "src/server.js"]
