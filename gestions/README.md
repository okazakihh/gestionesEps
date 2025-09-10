# Gestions (Auth skeleton additions)

Pequeño esqueleto de Auth Service añadido dentro del proyecto para desarrollo local.

Run local (uses Maven wrapper):

```powershell
mvn -Pdev spring-boot:run
```

Endpoints:
- POST /api/auth/register  { username, password, email } -> devuelve JWT (dev)
- POST /api/auth/login     (no implementado completamente, placeholder)

Notas:
- En desarrollo se usa H2 en memoria. Para producción configure PostgreSQL en `application.yml` o Spring Cloud Config.
- JWT secret se genera en memoria (no es persistente). Cambiar por secret gestionado en prod.
