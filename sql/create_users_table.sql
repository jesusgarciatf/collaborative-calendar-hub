-- Crear tabla USERS basada en la definición proporcionada
CREATE TABLE USERS (
    id VARCHAR2(255) PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT 0,
    password_hash VARCHAR2(255),
    display_name VARCHAR2(255),
    avatar_url VARCHAR2(1000),
    phone VARCHAR2(20),
    phone_verified INTEGER DEFAULT 0,
    role VARCHAR2(50),
    metadata CLOB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_sign_in TIMESTAMP
);

-- Crear índice en email para búsquedas y login
CREATE INDEX idx_users_email ON USERS(email);

-- Crear índice en role para filtrado por rol
CREATE INDEX idx_users_role ON USERS(role);

-- Crear índice en created_at para ordenamiento
CREATE INDEX idx_users_created_at ON USERS(created_at);

-- Crear índice en updated_at para ordenamiento
CREATE INDEX idx_users_updated_at ON USERS(updated_at);

-- Crear índice en last_sign_in para análisis de actividad
CREATE INDEX idx_users_last_sign_in ON USERS(last_sign_in);

-- Crear índice compuesto para búsquedas comunes (email_verified + created_at)
CREATE INDEX idx_users_verified_created ON USERS(email_verified, created_at);
