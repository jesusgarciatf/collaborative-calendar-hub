-- Crear tabla NOTICES basada en la definición proporcionada
CREATE TABLE NOTICES (
    id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    title VARCHAR2(255) NOT NULL,
    description CLOB,
    date VARCHAR2(255),
    color VARCHAR2(50),
    created_at TIMESTAMP
);

-- Crear índice en user_id para optimizar búsquedas
CREATE INDEX idx_notices_user_id ON NOTICES(user_id);

-- Crear índice en date para búsquedas por fecha
CREATE INDEX idx_notices_date ON NOTICES(date);

-- Crear índice en created_at para ordenamiento
CREATE INDEX idx_notices_created_at ON NOTICES(created_at);

-- Crear índice compuesto para búsquedas comunes (user_id + date)
CREATE INDEX idx_notices_user_date ON NOTICES(user_id, date);
