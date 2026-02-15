-- Crear tabla ENTRIES basada en la definición proporcionada
CREATE TABLE ENTRIES (
    id VARCHAR2(255) PRIMARY KEY,
    instance_id VARCHAR2(255) NOT NULL,
    user_id VARCHAR2(255) NOT NULL,
    user_name VARCHAR2(255),
    date VARCHAR2(255),
    hour INTEGER,
    is_suggested INTEGER,
    created_at TIMESTAMP
);

-- Crear índice en instance_id para optimizar búsquedas
CREATE INDEX idx_entries_instance_id ON ENTRIES(instance_id);

-- Crear índice en user_id para optimizar búsquedas
CREATE INDEX idx_entries_user_id ON ENTRIES(user_id);

-- Crear índice en date para búsquedas por fecha
CREATE INDEX idx_entries_date ON ENTRIES(date);

-- Crear índice en created_at para ordenamiento
CREATE INDEX idx_entries_created_at ON ENTRIES(created_at);

-- Crear índice compuesto para búsquedas comunes (instance_id + user_id)
CREATE INDEX idx_entries_instance_user ON ENTRIES(instance_id, user_id);
