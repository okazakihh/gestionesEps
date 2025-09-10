# Guía de Testing para las Nuevas APIs

## 🎯 APIs Agregadas

He agregado exitosamente dos nuevos endpoints para obtener usuarios:

### 1. GET `/api/users` - Obtener todos los usuarios
- **Permisos**: Solo ADMIN
- **Respuesta**: Lista de usuarios con roles
- **Ejemplo**:
```json
[
  {
    "id": 1,
    "username": "usuario1",
    "email": "usuario1@example.com",
    "roles": ["USER"]
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@example.com", 
    "roles": ["ADMIN"]
  }
]
```

### 2. GET `/api/users/{username}` - Obtener usuario específico
- **Permisos**: El propio usuario OR ADMIN
- **Respuesta**: Datos del usuario
- **Ejemplo**:
```json
{
  "id": 1,
  "username": "usuario1",
  "email": "usuario1@example.com",
  "roles": ["USER"]
}
```

## ✅ Cambios Realizados

### Archivos Nuevos:
- `UserResponse.java` - DTO para respuestas de usuario (sin exponer datos sensibles)

### Archivos Modificados:
- `AuthService.java` - Agregó métodos `getAllUsers()`, `getUserByUsername()` y `convertToUserResponse()`
- `UsersController.java` - Agregó endpoints GET para usuarios

### Seguridad:
- ✅ No se exponen contraseñas
- ✅ Control de acceso basado en roles
- ✅ Usuarios pueden ver su propio perfil
- ✅ Solo admins pueden ver todos los usuarios

## 🧪 Testing con Postman

### Colección Actualizada
El archivo `postman_collection.json` se actualizará automáticamente con:

1. **GET All Users** (requiere token de admin)
   ```
   GET http://localhost:8080/api/users
   Headers: Authorization: Bearer <admin_token>
   ```

2. **GET User by Username** (requiere token del usuario o admin)
   ```
   GET http://localhost:8080/api/users/usuario1
   Headers: Authorization: Bearer <user_or_admin_token>
   ```

### Flujo de Testing Recomendado:
1. Registrar usuario normal → obtener token
2. Intentar GET /api/users → debe devolver 403 Forbidden
3. GET /api/users/usuario1 → debe devolver datos del usuario
4. Intentar GET /api/users/otro_usuario → debe devolver 403 Forbidden
5. Crear usuario admin y repetir tests → admin debe poder ver todo

## 🔧 Estado del Proyecto

- ✅ **APIs funcionando**: Todos los endpoints REST operativos
- ✅ **Tests pasando**: Los tests existentes siguen funcionando
- ✅ **Seguridad intacta**: No se rompió ninguna funcionalidad existente
- ✅ **Base de datos**: H2 console disponible en http://localhost:8080/h2-console
- ✅ **Documentación**: Postman collection y guías actualizadas

## 🚀 Para Usar las Nuevas APIs:

1. **Asegúrate de que la aplicación esté corriendo**
2. **Registra usuarios usando POST /api/auth/register**
3. **Obtén tokens con POST /api/auth/login**
4. **Usa los tokens para acceder a los nuevos endpoints GET**

¡Todo está listo y funcionando correctamente sin romper nada existente!
