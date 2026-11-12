import { supabase } from './supabase';
import { WashJob, DetailingJob, MechanicsJob, CashTransaction } from '../types';

// Map database row to WashJob
export function mapDbToWashJob(row: any): WashJob {
  return {
    id: row.id,
    placa: row.placa || '',
    marca: row.marca || 'General',
    modelo: row.modelo || '',
    color: row.color || 'No especificado',
    tipoVehiculo: row.tipo_vehiculo || 'Sedán',
    tipoLavado: row.tipo_lavado || 'Lavado Sencillo',
    estado: row.estado || 'En espera',
    operador: row.operador || 'Sin asignar',
    horaIngreso: row.hora_ingreso || '',
    precio: Number(row.precio || 0),
    notas: row.notas || undefined,
    clienteNombre: row.cliente_nombre || 'Cliente Particular',
    clienteTelefono: row.cliente_telefono || 'N/A'
  };
}

// Map WashJob to database row
export function mapWashJobToDb(job: WashJob): any {
  return {
    id: job.id,
    placa: job.placa,
    marca: job.marca,
    modelo: job.modelo,
    color: job.color,
    tipo_vehiculo: job.tipoVehiculo,
    tipo_lavado: job.tipoLavado,
    estado: job.estado,
    operador: job.operador,
    hora_ingreso: job.horaIngreso,
    precio: job.precio,
    notas: job.notas || null,
    cliente_nombre: job.clienteNombre,
    cliente_telefono: job.clienteTelefono
  };
}

// Map database row to DetailingJob
export function mapDbToDetailingJob(row: any): DetailingJob {
  return {
    id: row.id,
    placa: row.placa || '',
    modelo: row.modelo || '',
    propietario: row.propietario || 'Cliente Particular',
    telefono: row.telefono || 'N/A',
    servicio: row.servicio || 'Detailing & Polishing',
    etapaActual: row.etapa_actual || 'Recepción e Inspección',
    progreso: Number(row.progreso || 20),
    tecnico: row.tecnico || 'Técnico Detailing',
    fechaInicio: row.fecha_inicio || '',
    fechaEstimadaEntrega: row.fecha_estimada_entrega || 'Por coordinar',
    precio: Number(row.precio || 0),
    observaciones: row.observaciones || '',
    estado: row.estado || 'En proceso'
  };
}

// Map DetailingJob to database row
export function mapDetailingJobToDb(job: DetailingJob): any {
  return {
    id: job.id,
    placa: job.placa,
    modelo: job.modelo,
    propietario: job.propietario,
    telefono: job.telefono,
    servicio: job.servicio,
    etapa_actual: job.etapaActual,
    progreso: job.progreso,
    tecnico: job.tecnico,
    fecha_inicio: job.fechaInicio,
    fecha_estimada_entrega: job.fechaEstimadaEntrega,
    precio: job.precio,
    observaciones: job.observaciones,
    estado: job.estado
  };
}

// Map database row to MechanicsJob
export function mapDbToMechanicsJob(row: any): MechanicsJob {
  return {
    id: row.id,
    placa: row.placa || '',
    vehiculo: row.vehiculo || '',
    cliente: row.cliente || 'Particular',
    telefono: row.telefono || 'N/A',
    tipoServicio: row.tipo_servicio || 'Mantenimiento General',
    aceiteUtilizado: row.aceite_utilizado || undefined,
    litrosAceite: row.litros_aceite ? Number(row.litros_aceite) : undefined,
    filtroUtilizado: row.filtro_utilizado || undefined,
    mecanico: row.mecanico || 'Mecánico de Turno',
    kilometraje: Number(row.kilometraje || 0),
    fecha: row.fecha || '',
    montoTotal: Number(row.monto_total || 0),
    estado: row.estado || 'En rampa',
    notas: row.notas || ''
  };
}

// Map MechanicsJob to database row
export function mapMechanicsJobToDb(job: MechanicsJob): any {
  return {
    id: job.id,
    placa: job.placa,
    vehiculo: job.vehiculo,
    cliente: job.cliente,
    telefono: job.telefono,
    tipo_servicio: job.tipoServicio,
    aceite_utilizado: job.aceiteUtilizado || null,
    litros_aceite: job.litrosAceite || null,
    filtro_utilizado: job.filtroUtilizado || null,
    mecanico: job.mecanico,
    kilometraje: job.kilometraje,
    fecha: job.fecha,
    monto_total: job.montoTotal,
    estado: job.estado,
    notas: job.notas
  };
}

// Map database row to CashTransaction
export function mapDbToCashTransaction(row: any): CashTransaction {
  return {
    id: row.id,
    tipo: row.tipo || 'Ingreso',
    concepto: row.concepto || '',
    montoUSD: Number(row.monto_usd || 0),
    metodoPago: row.metodo_pago || 'Divisas / USD Efectivo',
    moduloOrigen: row.modulo_origen || 'Caja General',
    placaVehiculo: row.placa_vehiculo || undefined,
    referencia: row.referencia || undefined,
    fechaHora: row.fecha_hora || '',
    responsable: row.responsable || 'Personal'
  };
}

// Map CashTransaction to database row
export function mapCashTransactionToDb(tx: CashTransaction): any {
  return {
    id: tx.id,
    tipo: tx.tipo,
    concepto: tx.concepto,
    monto_usd: tx.montoUSD,
    metodo_pago: tx.metodoPago,
    modulo_origen: tx.moduloOrigen,
    placa_vehiculo: tx.placaVehiculo || null,
    referencia: tx.referencia || null,
    fecha_hora: tx.fechaHora,
    responsable: tx.responsable
  };
}

/**
 * Supabase DB Operations with silent graceful fallbacks
 */
export const SupabaseDb = {
  // Wash Jobs
  async fetchWashJobs(): Promise<WashJob[] | null> {
    try {
      const { data, error } = await supabase
        .from('wash_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map(mapDbToWashJob);
    } catch {
      return null;
    }
  },
  async upsertWashJob(job: WashJob) {
    try {
      await supabase.from('wash_jobs').upsert(mapWashJobToDb(job));
    } catch (e) {
      console.warn('Sync wash_jobs upsert error:', e);
    }
  },
  async deleteWashJob(id: string) {
    try {
      await supabase.from('wash_jobs').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync wash_jobs delete error:', e);
    }
  },

  // Detailing Jobs
  async fetchDetailingJobs(): Promise<DetailingJob[] | null> {
    try {
      const { data, error } = await supabase
        .from('detailing_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map(mapDbToDetailingJob);
    } catch {
      return null;
    }
  },
  async upsertDetailingJob(job: DetailingJob) {
    try {
      await supabase.from('detailing_jobs').upsert(mapDetailingJobToDb(job));
    } catch (e) {
      console.warn('Sync detailing_jobs upsert error:', e);
    }
  },
  async deleteDetailingJob(id: string) {
    try {
      await supabase.from('detailing_jobs').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync detailing_jobs delete error:', e);
    }
  },

  // Mechanics Jobs
  async fetchMechanicsJobs(): Promise<MechanicsJob[] | null> {
    try {
      const { data, error } = await supabase
        .from('mechanics_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map(mapDbToMechanicsJob);
    } catch {
      return null;
    }
  },
  async upsertMechanicsJob(job: MechanicsJob) {
    try {
      await supabase.from('mechanics_jobs').upsert(mapMechanicsJobToDb(job));
    } catch (e) {
      console.warn('Sync mechanics_jobs upsert error:', e);
    }
  },
  async deleteMechanicsJob(id: string) {
    try {
      await supabase.from('mechanics_jobs').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync mechanics_jobs delete error:', e);
    }
  },

  // Transactions
  async fetchTransactions(): Promise<CashTransaction[] | null> {
    try {
      const { data, error } = await supabase
        .from('cash_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map(mapDbToCashTransaction);
    } catch {
      return null;
    }
  },
  async insertTransaction(tx: CashTransaction) {
    try {
      await supabase.from('cash_transactions').upsert(mapCashTransactionToDb(tx));
    } catch (e) {
      console.warn('Sync cash_transactions upsert error:', e);
    }
  }
};
