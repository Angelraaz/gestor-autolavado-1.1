export type VehicleType = 'Sedán' | 'Camioneta / SUV' | 'Pick-Up / Rústico' | 'Moto' | 'Camión Ligero';

export type WashType = 'Lavado Sencillo (Carrocería + Aspirado)' | 'Lavado Especial Chasis & Motor' | 'Lavado Integral VIP (+ Cera Líquida)';

export type QueueStatus = 'En espera' | 'En proceso' | 'Listo' | 'Entregado';

export interface WashJob {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  tipoVehiculo: VehicleType;
  tipoLavado: WashType;
  estado: QueueStatus;
  operador: string;
  horaIngreso: string;
  precio: number;
  notas?: string;
  clienteNombre: string;
  clienteTelefono: string;
}

export type DetailingStage = 'Recepción e Inspección' | 'Lavado & Descontaminado (Clay Bar)' | 'Corrección / Pulido' | 'Aplicación Cerámico / Sellado' | 'Curado & Inspección Final';

export interface DetailingJob {
  id: string;
  placa: string;
  modelo: string;
  propietario: string;
  telefono: string;
  servicio: 'Pulitura 1-Paso (Brillo)' | 'Corrección 3-Pasos (Corte + Hologramas)' | 'Tratamiento Cerámico 9H (1 Año)' | 'Tratamiento Cerámico 9H (3 Años)' | 'Detailing Interior Profundo (Vapor)';
  etapaActual: DetailingStage;
  progreso: number; // 0 to 100
  tecnico: string;
  fechaInicio: string;
  fechaEstimadaEntrega: string;
  precio: number;
  observaciones: string;
  estado: 'En proceso' | 'En espera de curado' | 'Listo para entrega';
}

// 1. INVENTARIO AUTOLAVADO (Insumos de lavado)
export interface WashSupplyItem {
  id: string;
  codigo: string;
  nombre: string;
  tipoInsumo: 'Champú con Cera' | 'Silicona de Cauchos' | 'Cera Líquida' | 'Ambientador / Fragancia' | 'Desengrasante Motor/Chasis' | 'Paño Microfibra';
  stockActual: number;
  stockMinimo: number;
  unidad: 'Litros' | 'Galones' | 'Unidades' | 'Pailas';
  precioRef: number;
}

// 2. INVENTARIO DETAILING (Productos especializados)
export interface DetailingSupplyItem {
  id: string;
  codigo: string;
  nombre: string;
  tipoProducto: 'Compuesto de Corte Pesado' | 'Pulimento Medio' | 'Sellador Cerámico 9H' | 'Pads / Discos de Pulido' | 'Clay Bar' | 'Microfibra Densidad Alta';
  stockActual: number;
  stockMinimo: number;
  unidad: 'Envases (500ml)' | 'Kits Cerámicos' | 'Unidades' | 'Barras';
  precioRef: number;
}

// 3. INVENTARIO MECÁNICA & ACEITE (Lubricantes, filtros y repuestos)
export interface InventoryItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria: 'Aceite de Motor' | 'Filtro' | 'Fluido de Transmisión' | 'Frenos' | 'Refrigerante / Químicos';
  viscosidad?: string;
  stockActual: number;
  stockMinimo: number;
  unidad: 'Litros' | 'Galones' | 'Unidades' | 'Pailas';
  precioUnitario: number;
  ubicacion: string;
}

export interface MechanicsJob {
  id: string;
  placa: string;
  vehiculo: string;
  cliente: string;
  telefono: string;
  tipoServicio: 'Cambio de Aceite & Filtros' | 'Frenos (Pastillas/Discos)' | 'Tren Delantero & Suspensión' | 'Mecánica Ligera General';
  aceiteUtilizado?: string;
  litrosAceite?: number;
  filtroUtilizado?: string;
  mecanico: string;
  kilometraje: number;
  fecha: string;
  montoTotal: number;
  estado: 'En rampa' | 'Esperando repuestos' | 'Finalizado';
  notas: string;
}

export interface AutoCoolJob {
  id: string;
  placa: string;
  vehiculo: string;
  cliente: string;
  telefono: string;
  tipoGas: 'R134a (Estándar)' | 'R1234yf (Ecológico)' | 'Refrigerante 50/50';
  presionBajaPsi: number;
  presionAltaPsi: number;
  tempRejillaCelsius: number;
  gasGramos: number;
  servicio: 'Carga de Gas + Vacío' | 'Detección de Fugas (Nitrógeno)' | 'Cambio de Compresor / Filtro' | 'Mantenimiento de Radiador & Fugas';
  tecnico: string;
  estado: 'Diagnóstico' | 'En prueba de vacío' | 'Cargando gas' | 'Operativo y Listo';
  fecha: string;
  precio: number;
  diagnostico: string;
}

export interface Client {
  id: string;
  nombre: string;
  cedulaRif: string;
  telefono: string;
  correo: string;
  vehiculos: {
    placa: string;
    marca: string;
    modelo: string;
    año: string;
    color: string;
  }[];
  fechaRegistro: string;
  totalVisitas: number;
}

export type PaymentMethod = 'Divisas / USD Efectivo' | 'Bolívares Efectivo' | 'Punto de Venta' | 'Pago Móvil' | 'Zelle / Transferencia';

export interface CashTransaction {
  id: string;
  tipo: 'Ingreso' | 'Egreso';
  concepto: string;
  montoUSD: number;
  metodoPago: PaymentMethod;
  moduloOrigen: 'Autolavado' | 'Detailing' | 'Mecánica & Aceite' | 'Auto Cool' | 'Caja General' | 'Gasto Operativo';
  placaVehiculo?: string;
  referencia?: string;
  fechaHora: string;
  responsable: string;
}

export interface Commission {
  id: string;
  trabajador: string;
  cargo: 'Lavador' | 'Mecánico' | 'Técnico Detailing' | 'Técnico Auto Cool';
  servicioRealizado: string;
  placa: string;
  montoServicioUSD: number;
  porcentaje: number;
  comisionUSD: number;
  estado: 'Pendiente' | 'Pagado';
  fecha: string;
}

export type RoleId = 'admin_maestro' | 'sup_autolavado' | 'sup_mecanica' | 'sup_detailing' | 'cajero';

export type SupabaseRole = 'admin' | 'lavado' | 'detailing' | 'mecanica' | 'cajera';

export interface UserRole {
  id: RoleId;
  nombre: string;
  titulo: string;
  descripcion: string;
  avatar: string;
  permisos: {
    autolavado: boolean;
    detailing: boolean;
    mecanica: boolean;
    autoCool: boolean;
    clientesCaja: boolean;
    verFinanzas: boolean;
    editarInventario: boolean;
    gestionUsuarios: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rolId: RoleId;
  role: SupabaseRole;
  titulo: string;
  avatar: string;
  allowedTabs: string[];
}

export interface DailyClosure {
  id: string;
  fecha: string;
  hora: string;
  totalIngresosUSD: number;
  totalEgresosUSD: number;
  balanceNetoUSD: number;
  desgloseMetodos: Record<PaymentMethod, number>;
  totalServiciosAtendidos: number;
  totalComisionesPagadasUSD: number;
  responsable: string;
  observaciones: string;
}
