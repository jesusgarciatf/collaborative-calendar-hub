-- Crear tabla EMAIL_VERIFICATION_TOKENS basada en la definición proporcionada
CREATE TABLE EMAIL_VERIFICATION_TOKENS (
    id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    token_hash VARCHAR2(255) NOT NULL,
    lookup_hash VARCHAR2(255) NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Crear índice en user_id para optimizar búsquedas
CREATE INDEX idx_email_verify_user_id ON EMAIL_VERIFICATION_TOKENS(user_id);

-- Crear índice en lookup_hash para búsquedas rápidas
CREATE INDEX idx_email_verify_lookup_hash ON EMAIL_VERIFICATION_TOKENS(lookup_hash);

-- Crear índice en expires_at para limpiar tokens expirados
CREATE INDEX idx_email_verify_expires_at ON EMAIL_VERIFICATION_TOKENS(expires_at);
