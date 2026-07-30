import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Serviço de cache em memória para reduzir consultas ao banco de dados.
 * Usa um Map interno com TTL (time-to-live) por entrada.
 * 
 * Funcionalidades:
 * - Cache de perfil de usuário (após login/validação)
 * - Invalidação automática por TTL
 * - Invalidação manual por chave ou padrão
 * - Limpeza periódica de entradas expiradas
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  /** TTLs padrão por tipo de dado (em milissegundos) */
  static readonly TTL = {
    USER_PROFILE: 5 * 60 * 1000,      // 5 minutos
    USER_BY_EMAIL: 3 * 60 * 1000,     // 3 minutos
    USER_BY_ID: 5 * 60 * 1000,        // 5 minutos
    USER_VALIDATION: 2 * 60 * 1000,   // 2 minutos
    SHORT: 30 * 1000,                 // 30 segundos
  } as const;

  constructor() {
    // Limpar entradas expiradas a cada 60 segundos
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    this.logger.log('✅ CacheService inicializado (in-memory com TTL)');
  }

  /**
   * Busca valor no cache. Retorna null se não encontrado ou expirado.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Salva valor no cache com TTL em milissegundos.
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Remove uma chave específica do cache.
   */
  del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Remove todas as chaves que começam com o prefixo informado.
   * Útil para invalidar todo o cache de um usuário específico.
   * Ex: invalidateByPrefix('user:42') remove 'user:42:profile', 'user:42:validation', etc.
   */
  invalidateByPrefix(prefix: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(`Cache invalidado: ${count} entrada(s) com prefixo '${prefix}'`);
    }
  }

  /**
   * Limpa todas as entradas expiradas.
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.debug(`Cache cleanup: ${removed} entrada(s) expirada(s) removida(s). Tamanho atual: ${this.cache.size}`);
    }
  }

  /**
   * Retorna estatísticas do cache (para debugging).
   */
  getStats() {
    return {
      totalEntries: this.cache.size,
      keys: [...this.cache.keys()],
    };
  }

  /**
   * Limpa todo o cache.
   */
  flush(): void {
    this.cache.clear();
    this.logger.log('Cache completamente limpo');
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }
}
