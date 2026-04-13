/**
 * Funções de lógica de negócio críticas do TrueNorth
 * ATENÇÃO: não alterar estas funções sem alinhar com o backend
 */

/**
 * Calcula o risco percentual de um NCM baseado na validade do código e na inadimplência histórica.
 * NCM inválido (≠ 8 dígitos): risco entre 85–100.
 * NCM válido: risco 0.
 */
export function calcularRiscoNCM(ncm: string, inadimplencia: number): number {
  const limpo = (ncm || '').replace(/\D/g, '');
  const ncmInvalido = limpo.length !== 8;

  if (ncmInvalido) {
    const inad = Math.min(Math.max(inadimplencia, 0), 1);
    const risco = 85 + inad * 15;
    return Math.round(risco);
  }

  return 0;
}
