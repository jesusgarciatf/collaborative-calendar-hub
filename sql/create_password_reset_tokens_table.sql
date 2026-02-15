-- Crear tabla PASSWORD_RESET_TOKENS basada en la definición proporcionada
CREATE TABLE PASSWORD_RESET_TOKENS (
    id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    token_hash VARCHAR2(255) NOT NULL,
    lookup_hash VARCHAR2(255) NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Crear índice en user_id para optimizar búsquedas
CREATE INDEX idx_password_reset_user_id ON PASSWORD_RESET_TOKENS(user_id);

-- Crear índice en lookup_hash para búsquedas rápidas
CREATE INDEX idx_password_reset_lookup_hash ON PASSWORD_RESET_TOKENS(lookup_hash);

-- Crear índice en expires_at para limpiar tokens expirados
CREATE INDEX idx_password_reset_expires_at ON PASSWORD_RESET_TOKENS(expires_at);

-- Crear índice en created_at para ordenamiento
CREATE INDEX idx_password_reset_created_at ON PASSWORD_RESET_TOKENS(created_at);
