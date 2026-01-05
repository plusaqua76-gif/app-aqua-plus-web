-- ====================================================================
-- SISTEMA DE CONTABILIDAD MULTI-EMPRESA
-- Base de datos PostgreSQL para gestión contable de acueductos
-- ====================================================================

-- ====================================================================
-- 1. TABLAS ESTRUCTURALES (CATÁLOGOS)
-- ====================================================================

-- 1️⃣ tipo_cuenta_contable
-- Define la naturaleza contable (Activo, Pasivo, Patrimonio, Ingreso, Gasto, Costo)
CREATE TABLE tipo_cuenta_contable (
    id SERIAL PRIMARY KEY,
    codigo INT NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    usuario_creacion VARCHAR(25) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_cambio VARCHAR(25),
    fecha_cambio TIMESTAMP
);

COMMENT ON TABLE tipo_cuenta_contable IS 'Catálogo de tipos de cuenta contable (Activo, Pasivo, Patrimonio, Ingreso, Gasto, Costo)';
COMMENT ON COLUMN tipo_cuenta_contable.codigo IS 'Código único del tipo de cuenta';
COMMENT ON COLUMN tipo_cuenta_contable.es_corriente IS 'Indica si la cuenta es de liquidez inmediata';

-- 2️⃣ cuenta
-- Plan de cuentas contable
CREATE TABLE cuenta (
    id SERIAL PRIMARY KEY,
    codigo_contable VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    id_tipo_cuenta INT NOT NULL,
    es_corriente BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    usuario_creacion VARCHAR(25) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_cambio VARCHAR(25),
    fecha_cambio TIMESTAMP,
    CONSTRAINT fk_tipo_cuenta
        FOREIGN KEY (id_tipo_cuenta)
        REFERENCES tipo_cuenta_contable(id)
);

COMMENT ON TABLE cuenta IS 'Plan de cuentas contable - PUC';
COMMENT ON COLUMN cuenta.codigo_contable IS 'Código PUC (ej: 110505)';
COMMENT ON COLUMN cuenta.es_corriente IS 'Indica si es cuenta corriente (liquidez)';

CREATE INDEX idx_cuenta_codigo ON cuenta(codigo_contable);
CREATE INDEX idx_cuenta_tipo ON cuenta(id_tipo_cuenta);

-- ====================================================================
-- 2. CONTEXTO EMPRESA
-- ====================================================================

-- 3️⃣ empresa_contable
-- Acueductos / Empresas contables
CREATE TABLE empresa_contable (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE empresa_contable IS 'Entidades contables (acueductos) - Soporte multi-empresa';

-- ====================================================================
-- 3. TABLA NÚCLEO (MOTOR CONTABLE)
-- ====================================================================

-- 4️⃣ movimiento_contable
-- Corazón del sistema contable - Asientos contables (DEBE / HABER)
CREATE TABLE movimiento_contable (
    id SERIAL PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_cuenta INT NOT NULL,
    fecha DATE NOT NULL,
    debe NUMERIC(14,2) NOT NULL DEFAULT 0,
    haber NUMERIC(14,2) NOT NULL DEFAULT 0,
    referencia_tipo VARCHAR(30) NOT NULL,
    referencia_id INT NOT NULL,
    descripcion VARCHAR(200),
    usuario_creacion VARCHAR(25) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresa_contable(id),
    CONSTRAINT fk_cuenta
        FOREIGN KEY (id_cuenta)
        REFERENCES cuenta(id),
    CONSTRAINT chk_debe_haber
        CHECK (
            (debe > 0 AND haber = 0)
            OR
            (debe = 0 AND haber > 0)
        )
);

COMMENT ON TABLE movimiento_contable IS 'Registro de todos los movimientos contables - Partida doble';
COMMENT ON COLUMN movimiento_contable.referencia_tipo IS 'Tipo de evento: FACTURA, PAGO, NOMINA, COMPRA, AJUSTE';
COMMENT ON COLUMN movimiento_contable.referencia_id IS 'ID del registro origen (factura_id, pago_id, etc)';
COMMENT ON CONSTRAINT chk_debe_haber ON movimiento_contable IS 'Un movimiento solo puede tener valor en DEBE o HABER, nunca en ambos';

CREATE INDEX idx_movimiento_empresa ON movimiento_contable(id_empresa);
CREATE INDEX idx_movimiento_cuenta ON movimiento_contable(id_cuenta);
CREATE INDEX idx_movimiento_fecha ON movimiento_contable(fecha);
CREATE INDEX idx_movimiento_referencia ON movimiento_contable(referencia_tipo, referencia_id);

-- ====================================================================
-- 4. PATRIMONIO HISTÓRICO
-- ====================================================================

-- 5️⃣ patrimonio_historico
-- Solo para cierres mensuales - NO participa en cálculos diarios
CREATE TABLE patrimonio_historico (
    id SERIAL PRIMARY KEY,
    id_empresa INT NOT NULL,
    periodo VARCHAR(7) NOT NULL, -- YYYY-MM
    valor NUMERIC(14,2) NOT NULL,
    fecha_cierre TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_empresa_patrimonio
        FOREIGN KEY (id_empresa)
        REFERENCES empresa_contable(id),
    CONSTRAINT uq_empresa_periodo
        UNIQUE (id_empresa, periodo)
);

COMMENT ON TABLE patrimonio_historico IS 'Cierre mensual de patrimonio - Solo para históricos';
COMMENT ON COLUMN patrimonio_historico.periodo IS 'Formato: YYYY-MM (ej: 2026-01)';

CREATE INDEX idx_patrimonio_empresa ON patrimonio_historico(id_empresa);

-- ====================================================================
-- 5. NÓMINA (EVENTOS OPERATIVOS)
-- ====================================================================

-- 6️⃣ nomina
-- Nómina mensual de empleados
CREATE TABLE nomina (
    id SERIAL PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_empleado INT NOT NULL,
    periodo VARCHAR(7) NOT NULL, -- YYYY-MM
    valor_total NUMERIC(14,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO
    fecha_pago DATE,
    usuario_creacion VARCHAR(25) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_cambio VARCHAR(25),
    fecha_cambio TIMESTAMP,
    CONSTRAINT fk_empresa_nomina
        FOREIGN KEY (id_empresa)
        REFERENCES empresa_contable(id),
    CONSTRAINT chk_estado_nomina
        CHECK (estado IN ('PENDIENTE', 'PAGADO'))
);

COMMENT ON TABLE nomina IS 'Registro mensual de nómina por empleado';
COMMENT ON COLUMN nomina.periodo IS 'Periodo de nómina: YYYY-MM';
COMMENT ON COLUMN nomina.estado IS 'Estado del pago: PENDIENTE o PAGADO';

CREATE INDEX idx_nomina_empresa ON nomina(id_empresa);
CREATE INDEX idx_nomina_empleado ON nomina(id_empleado);
CREATE INDEX idx_nomina_periodo ON nomina(periodo);

-- 7️⃣ nomina_detalle
-- Desglose de conceptos de nómina (sueldos, auxilios, descuentos)
CREATE TABLE nomina_detalle (
    id SERIAL PRIMARY KEY,
    id_nomina INT NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- DEVENGADO, DEDUCCION
    valor NUMERIC(14,2) NOT NULL,
    usuario_creacion VARCHAR(25) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_nomina_detalle
        FOREIGN KEY (id_nomina)
        REFERENCES nomina(id) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_concepto
        CHECK (tipo IN ('DEVENGADO', 'DEDUCCION'))
);

COMMENT ON TABLE nomina_detalle IS 'Desglose de conceptos por nómina (salarios, auxilios, descuentos)';
COMMENT ON COLUMN nomina_detalle.tipo IS 'DEVENGADO (sueldos, auxilios) o DEDUCCION (descuentos)';

CREATE INDEX idx_nomina_detalle_nomina ON nomina_detalle(id_nomina);

-- ====================================================================
-- 6. VISTAS CONTABLES
-- ====================================================================

-- 📊 Vista: Saldo por cuenta
CREATE VIEW v_saldo_cuenta AS
SELECT
    mc.id_empresa,
    c.id AS id_cuenta,
    c.codigo_contable,
    c.nombre,
    tcc.nombre AS tipo_cuenta,
    SUM(mc.debe - mc.haber) AS saldo
FROM movimiento_contable mc
JOIN cuenta c ON c.id = mc.id_cuenta
JOIN tipo_cuenta_contable tcc ON tcc.id = c.id_tipo_cuenta
GROUP BY mc.id_empresa, c.id, c.codigo_contable, c.nombre, tcc.nombre;

COMMENT ON VIEW v_saldo_cuenta IS 'Saldo acumulado por cuenta contable y empresa';

-- 📈 Vista: Balance General
CREATE VIEW v_balance_general AS
SELECT
    id_empresa,
    SUM(CASE WHEN tipo_cuenta = 'Activo' THEN saldo ELSE 0 END) AS activos,
    SUM(CASE WHEN tipo_cuenta = 'Pasivo' THEN saldo ELSE 0 END) AS pasivos,
    SUM(CASE WHEN tipo_cuenta = 'Activo' THEN saldo ELSE 0 END)
      -
    SUM(CASE WHEN tipo_cuenta = 'Pasivo' THEN saldo ELSE 0 END) AS patrimonio
FROM v_saldo_cuenta
GROUP BY id_empresa;

COMMENT ON VIEW v_balance_general IS 'Balance general: Activos, Pasivos y Patrimonio por empresa';

-- 💰 Vista: Estado de Resultados
CREATE VIEW v_estado_resultados AS
SELECT
    id_empresa,
    SUM(CASE WHEN tipo_cuenta = 'Ingreso' THEN saldo ELSE 0 END) AS ingresos,
    SUM(CASE WHEN tipo_cuenta = 'Gasto' THEN saldo ELSE 0 END) AS gastos,
    SUM(CASE WHEN tipo_cuenta = 'Costo' THEN saldo ELSE 0 END) AS costos,
    SUM(CASE WHEN tipo_cuenta = 'Ingreso' THEN saldo ELSE 0 END)
      -
    SUM(CASE WHEN tipo_cuenta = 'Gasto' THEN saldo ELSE 0 END)
      -
    SUM(CASE WHEN tipo_cuenta = 'Costo' THEN saldo ELSE 0 END) AS resultado
FROM v_saldo_cuenta
GROUP BY id_empresa;

COMMENT ON VIEW v_estado_resultados IS 'Estado de resultados: Ingresos, Gastos, Costos y Resultado neto';

-- 🏦 Vista: Liquidez (Cuentas corrientes)
CREATE VIEW v_liquidez AS
SELECT
    mc.id_empresa,
    c.id AS id_cuenta,
    c.codigo_contable,
    c.nombre,
    SUM(mc.debe - mc.haber) AS saldo_disponible
FROM movimiento_contable mc
JOIN cuenta c ON c.id = mc.id_cuenta
WHERE c.es_corriente = TRUE
  AND c.activo = TRUE
GROUP BY mc.id_empresa, c.id, c.codigo_contable, c.nombre
HAVING SUM(mc.debe - mc.haber) != 0;

COMMENT ON VIEW v_liquidez IS 'Cuentas corrientes con saldo disponible (liquidez inmediata)';

-- ====================================================================
-- 7. DATOS INICIALES (SEED DATA)
-- ====================================================================

-- Tipos de cuenta contable
INSERT INTO tipo_cuenta_contable (codigo, nombre, descripcion, usuario_creacion) VALUES
(1, 'Activo', 'Recursos controlados por la entidad', 'SYSTEM'),
(2, 'Pasivo', 'Obligaciones presentes de la entidad', 'SYSTEM'),
(3, 'Patrimonio', 'Valor residual de activos menos pasivos', 'SYSTEM'),
(4, 'Ingreso', 'Incrementos en beneficios económicos', 'SYSTEM'),
(5, 'Gasto', 'Decrementos en beneficios económicos', 'SYSTEM'),
(6, 'Costo', 'Erogaciones asociadas a producción/servicios', 'SYSTEM');

-- ====================================================================
-- FIN DEL SCRIPT
-- ====================================================================
INSERT INTO public.empresa_contable
    (nombre, nit)
VALUES
    ('Mi Empresa S.A.S.', '900123456-1'),
    ('Comercial ABC Ltda.', '800987654-2');


-- Insertar cuentas contables básicas (requiere que existan los tipos de cuenta)
INSERT INTO public.cuenta
    (codigo_contable, nombre, id_tipo_cuenta, es_corriente, usuario_creacion)
VALUES
    ('1105', 'CAJA GENERAL', 1, true, 'admin'),
    ('1110', 'BANCOS', 1, true, 'admin'),
    ('1305', 'CLIENTES', 1, true, 'admin'),
    ('1435', 'MERCANCÍAS NO FABRICADAS POR LA EMPRESA', 1, true, 'admin'),
    ('2205', 'PROVEEDORES NACIONALES', 2, true, 'admin'),
    ('2365', 'RETENCIÓN EN LA FUENTE', 2, true, 'admin'),
    ('3115', 'APORTES SOCIALES', 3, false, 'admin'),
    ('4135', 'COMERCIO AL POR MAYOR Y AL POR MENOR', 4, false, 'admin'),
    ('5135', 'SERVICIOS', 5, false, 'admin'),
    ('6135', 'COMERCIO AL POR MAYOR Y AL POR MENOR', 6, false, 'admin');
