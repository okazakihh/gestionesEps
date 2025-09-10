package com.ipsSystem.gestions.auth.enums;

public enum UserRole {
    USER("USER"),
    ADMIN("ADMIN"),
    MODERATOR("MODERATOR"),
    ADMINISTRATIVO("ADMINISTRATIVO"),
    MEDICO("MEDICO"),
    ASISTENCIAL("ASISTENCIAL");

    private final String roleName;

    UserRole(String roleName) {
        this.roleName = roleName;
    }

    public String getRoleName() {
        return roleName;
    }

    public static UserRole fromString(String text) {
        if (text != null) {
            for (UserRole role : UserRole.values()) {
                if (text.equalsIgnoreCase(role.roleName)) {
                    return role;
                }
            }
        }
        throw new IllegalArgumentException("No se encontró el rol: " + text);
    }

    public static void validateRole(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del rol no puede estar vacío");
        }

        boolean validRole = false;
        for (UserRole role : UserRole.values()) {
            if (role.roleName.equalsIgnoreCase(roleName.trim())) {
                validRole = true;
                break;
            }
        }

        if (!validRole) {
            throw new IllegalArgumentException("Rol inválido: " + roleName + ". Roles válidos: USER, ADMIN, MODERATOR, ADMINISTRATIVO, MEDICO, ASISTENCIAL");
        }
    }

    @Override
    public String toString() {
        return roleName;
    }
}
