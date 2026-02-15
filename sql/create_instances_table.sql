-- Crear tabla INSTANCES basada en instances.csv
CREATE TABLE INSTANCES (
    id VARCHAR2(32) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    name VARCHAR2(255) NOT NULL,
    type VARCHAR2(255) NOT NULL,
    config VARCHAR2(255),
    created_at TIMESTAMP
);

-- Crear índice en user_id para optimizar búsquedas
CREATE INDEX idx_instances_user_id ON INSTANCES(user_id);

-- Crear índice en created_at para ordenamiento
CREATE INDEX idx_instances_created_at ON INSTANCES(created_at);
