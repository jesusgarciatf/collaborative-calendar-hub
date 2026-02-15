-- Crear tabla MAGIC_LINK_TOKENS basada en la definición proporcionada
CREATE TABLE MAGIC_LINK_TOKENS (
    id VARCHAR2(255) PRIMARY KEY,
    email VARCHAR2(255) NOT NULL,
    token_hash VARCHAR2(255) NOT NULL,
    lookup_hash VARCHAR2(255) NOT NULL,
    redirect_url VARCHAR2(1000),
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Crear índice en email para optimizar búsquedas
CREATE INDEX idx_magic_link_email ON MAGIC_LINK_TOKENS(email);

-- Crear índice en lookup_hash para búsquedas rápidas
CREATE INDEX idx_magic_link_lookup_hash ON MAGIC_LINK_TOKENS(lookup_hash);

-- Crear índice en expires_at para limpiar tokens expirados
CREATE INDEX idx_magic_link_expires_at ON MAGIC_LINK_TOKENS(expires_at);

-- Crear índice en created_at para ordenamiento
CREATE INDEX idx_magic_link_created_at ON MAGIC_LINK_TOKENS(created_at);
