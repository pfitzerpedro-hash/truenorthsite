import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Anchor, ShieldCheck, BarChart3, FileSearch, AlertTriangle,
  ArrowRight, Globe2, CheckCircle2, Clock, X, Calculator, Plus, Trash2,
  ChevronDown, ChevronUp, HelpCircle, Ship, Download, XCircle,
  TrendingDown, Home, FileText, Upload, Sparkles, Copy, Zap, Timer,
  AlertCircle, Building2, DollarSign, Lock, LogOut, User, Pen, Info,
  Check, RefreshCw
} from 'lucide-react';
import * as api from '../api';
import jsPDF from 'jspdf';
import { NcmBadge } from '../components/ncm';
import { DuimpExportSection } from '../components/results/DuimpExportSection';
import { FichaProdutoSimulada } from '../components/results/FichaProdutoSimulada';
import { CostBreakdownTooltip } from '../components/results/CostBreakdownTooltip';
import { calcularRiscoNCM } from '../utils/businessLogic';
// --- LISTA DE PAÍSES QUE MAIS EXPORTAM PARA O BRASIL ---
const PAISES_IMPORTADORES = [
  'China',
  'Estados Unidos',
  'Alemanha',
  'Argentina',
  'Índia',
  'Coreia do Sul',
  'Itália',
  'Japão',
  'França',
  'México',
  'Reino Unido',
  'Chile',
  'Espanha',
  'Rússia',
  'Países Baixos',
  'Canadá',
  'Paraguai',
  'Taiwan',
  'Suíça',
  'Bélgica',
  'Colômbia',
  'Vietnã',
  'Tailândia',
  'Malásia',
  'Arábia Saudita',
  'Nigéria',
  'Indonésia',
  'Portugal',
  'Peru',
  'Uruguai'
];

// --- LISTA DE ÓRGÃOS ANUENTES ---
const LISTA_ANUENTES = [
  'ANVISA',
  'ANATEL',
  'ANM',
  'ANEEL',
  'ANP',
  'CNEN',
  'CNPq',
  'COMEXE',
  'DECEX',
  'DPF',
  'ECT',
  'IBAMA',
  'INMETRO',
  'MAPA',
  'MCTI',
  'SUFRAMA'
];

// NcmBadge importado de ../components/ncm


// calcularRiscoNCM importado de ../utils/businessLogic

// --- BASE DE NCMs COM REGRAS DE COMPLIANCE ---
const NCM_DATABASE: Record<string, {
  desc: string;
  aliquotaII: number;
  aliquotaIPI: number;
  anuentes: string[];
  exTarifario?: boolean;
  destaque?: string;
}> = {
  // ELETRÔNICOS (Cap. 84-85)
  '85171231': { desc: 'Telefones celulares', aliquotaII: 16, aliquotaIPI: 15, anuentes: ['ANATEL'] },
  '85171291': { desc: 'Aparelhos para transmissão de dados sem fio', aliquotaII: 16, aliquotaIPI: 15, anuentes: ['ANATEL'] },
  '85183000': { desc: 'Fones de ouvido e auriculares', aliquotaII: 20, aliquotaIPI: 15, anuentes: ['ANATEL'] },
  '84713012': { desc: 'Notebooks e laptops', aliquotaII: 16, aliquotaIPI: 15, anuentes: ['ANATEL'], exTarifario: true },
  '84717020': { desc: 'Unidades de disco rígido (HDD)', aliquotaII: 2, aliquotaIPI: 0, anuentes: [] },
  '85234110': { desc: 'Cartões de memória flash', aliquotaII: 16, aliquotaIPI: 15, anuentes: [] },
  '85285990': { desc: 'Monitores de vídeo', aliquotaII: 20, aliquotaIPI: 15, anuentes: [] },
  '84719000': { desc: 'Outras máquinas de processamento de dados', aliquotaII: 16, aliquotaIPI: 0, anuentes: [] },

  // AUTOPEÇAS (Cap. 87)
  '87089990': { desc: 'Outras partes e acessórios de veículos', aliquotaII: 18, aliquotaIPI: 5, anuentes: ['INMETRO'] },
  '87088000': { desc: 'Amortecedores de suspensão', aliquotaII: 18, aliquotaIPI: 5, anuentes: ['INMETRO'] },
  '87083010': { desc: 'Freios e suas partes', aliquotaII: 18, aliquotaIPI: 5, anuentes: ['INMETRO'] },
  '87084090': { desc: 'Caixas de marchas', aliquotaII: 18, aliquotaIPI: 5, anuentes: ['INMETRO'] },
  '87085099': { desc: 'Eixos e semi-eixos', aliquotaII: 18, aliquotaIPI: 5, anuentes: ['INMETRO'] },
  '87087010': { desc: 'Rodas e suas partes', aliquotaII: 18, aliquotaIPI: 5, anuentes: ['INMETRO'] },
  '40111000': { desc: 'Pneus novos para automóveis', aliquotaII: 16, aliquotaIPI: 0, anuentes: ['INMETRO', 'IBAMA'] },
  '68138100': { desc: 'Pastilhas de freio', aliquotaII: 14, aliquotaIPI: 0, anuentes: ['INMETRO'] },

  // COSMÉTICOS (Cap. 33)
  '33049990': { desc: 'Outros produtos de beleza ou maquiagem', aliquotaII: 18, aliquotaIPI: 22, anuentes: ['ANVISA'] },
  '33049100': { desc: 'Pós para maquiagem', aliquotaII: 18, aliquotaIPI: 22, anuentes: ['ANVISA'] },
  '33041000': { desc: 'Produtos de maquiagem para lábios', aliquotaII: 18, aliquotaIPI: 22, anuentes: ['ANVISA'] },
  '33042090': { desc: 'Produtos de maquiagem para olhos', aliquotaII: 18, aliquotaIPI: 22, anuentes: ['ANVISA'] },
  '33051000': { desc: 'Xampus', aliquotaII: 18, aliquotaIPI: 7, anuentes: ['ANVISA'] },
  '33059000': { desc: 'Outras preparações capilares', aliquotaII: 18, aliquotaIPI: 7, anuentes: ['ANVISA'] },
  '33061000': { desc: 'Dentifrícios', aliquotaII: 18, aliquotaIPI: 0, anuentes: ['ANVISA'] },
  '33030010': { desc: 'Perfumes e águas-de-colônia', aliquotaII: 18, aliquotaIPI: 42, anuentes: ['ANVISA'] },

  // ALIMENTOS (Cap. 16-22)
  '22041000': { desc: 'Vinhos espumantes', aliquotaII: 27, aliquotaIPI: 40, anuentes: ['MAPA'] },
  '22042100': { desc: 'Outros vinhos em recipientes até 2L', aliquotaII: 27, aliquotaIPI: 30, anuentes: ['MAPA'] },
  '22030000': { desc: 'Cervejas de malte', aliquotaII: 20, aliquotaIPI: 40, anuentes: ['MAPA'] },
  '18063100': { desc: 'Chocolates recheados', aliquotaII: 20, aliquotaIPI: 5, anuentes: ['MAPA'] },
  '18063200': { desc: 'Chocolate em tabletes ou barras', aliquotaII: 20, aliquotaIPI: 5, anuentes: ['MAPA'] },
  '21069090': { desc: 'Outras preparações alimentícias', aliquotaII: 16, aliquotaIPI: 0, anuentes: ['ANVISA', 'MAPA'] },
  '16010000': { desc: 'Embutidos e produtos similares de carne', aliquotaII: 16, aliquotaIPI: 0, anuentes: ['MAPA'] },
  '04069000': { desc: 'Outros queijos', aliquotaII: 28, aliquotaIPI: 0, anuentes: ['MAPA'] },
  '20098900': { desc: 'Outros sucos de frutas', aliquotaII: 14, aliquotaIPI: 0, anuentes: ['MAPA'] },

  // MÁQUINAS INDUSTRIAIS (Cap. 84)
  '84798999': { desc: 'Outras máquinas e aparelhos mecânicos', aliquotaII: 14, aliquotaIPI: 0, anuentes: [], exTarifario: true },
  '84212300': { desc: 'Aparelhos para filtrar óleos', aliquotaII: 14, aliquotaIPI: 0, anuentes: [] },
  '84229090': { desc: 'Partes de máquinas de lavar louça', aliquotaII: 18, aliquotaIPI: 0, anuentes: [] },
  '84314990': { desc: 'Partes de guindastes e gruas', aliquotaII: 14, aliquotaIPI: 5, anuentes: [] },
  '84329000': { desc: 'Partes de máquinas agrícolas', aliquotaII: 0, aliquotaIPI: 0, anuentes: ['MAPA'], destaque: 'Máquinas agrícolas' },
  '84248990': { desc: 'Outros aparelhos mecânicos para projetar', aliquotaII: 14, aliquotaIPI: 5, anuentes: [] },
  '84223000': { desc: 'Máquinas de encher, fechar ou etiquetar', aliquotaII: 14, aliquotaIPI: 0, anuentes: [], exTarifario: true },
  '84669400': { desc: 'Partes para máquinas-ferramenta', aliquotaII: 14, aliquotaIPI: 0, anuentes: [] },

  // TÊXTEIS (Cap. 50-63)
  '62034200': { desc: 'Calças masculinas de algodão', aliquotaII: 35, aliquotaIPI: 0, anuentes: [] },
  '62046200': { desc: 'Calças femininas de algodão', aliquotaII: 35, aliquotaIPI: 0, anuentes: [] },
  '61091000': { desc: 'T-shirts de malha de algodão', aliquotaII: 35, aliquotaIPI: 0, anuentes: [] },
  '62052000': { desc: 'Camisas masculinas de algodão', aliquotaII: 35, aliquotaIPI: 0, anuentes: [] },
  '61046200': { desc: 'Calças femininas de malha de algodão', aliquotaII: 35, aliquotaIPI: 0, anuentes: [] },
  '64039990': { desc: 'Outros calçados de couro', aliquotaII: 35, aliquotaIPI: 0, anuentes: [] },
  '42021200': { desc: 'Malas e maletas com superfície exterior de plástico', aliquotaII: 20, aliquotaIPI: 0, anuentes: [] },
  '42022200': { desc: 'Bolsas com superfície exterior de plástico', aliquotaII: 20, aliquotaIPI: 0, anuentes: [] },

  // QUÍMICOS (Cap. 28-38)
  '29181400': { desc: 'Ácido cítrico', aliquotaII: 12, aliquotaIPI: 0, anuentes: ['ANVISA'], destaque: 'Uso farmacêutico' },
  '29362100': { desc: 'Vitaminas A e seus derivados', aliquotaII: 0, aliquotaIPI: 0, anuentes: ['ANVISA'] },
  '38089410': { desc: 'Desinfetantes', aliquotaII: 14, aliquotaIPI: 0, anuentes: ['ANVISA'] },
  '32089090': { desc: 'Outras tintas e vernizes', aliquotaII: 14, aliquotaIPI: 0, anuentes: ['IBAMA'] },
  '34022000': { desc: 'Preparações tensoativas', aliquotaII: 14, aliquotaIPI: 0, anuentes: ['ANVISA'] },
};

// --- DADOS DE EXEMPLO PARA DEMONSTRAÇÃO ---
const SAMPLE_INVOICES = {
  electronics: {
    // Dados do documento
    name: "Invoice_Eletrônicos_Shenzhen.pdf",
    invoiceNumber: "INV-2024-SZ-00847",
    invoiceDate: "2024-11-15",

    // Dados do fornecedor
    supplier: {
      name: "Shenzhen TechPro Electronics Co., Ltd.",
      address: "Building A12, Huaqiang North, Futian District, Shenzhen 518031, China",
      contact: "export@techpro-sz.cn"
    },

    // Dados comerciais
    incoterm: "FOB Shenzhen",
    currency: "USD",
    totalValue: 18450.00,
    freight: 1250.00,
    insurance: 185.00,

    // Dados da operação
    operation: {
      type: 'Importação Própria',
      urf: 'Santos (SP)',
      country: 'China',
      modality: 'Normal',
      sector: 'Outros'
    },

    // Dados logísticos
    portOrigin: "Shenzhen (CNSZX)",
    portDestination: "Santos (BRSSZ)",
    vessel: "MSC PALOMA III",
    container: "MSCU7234561 - 20' DRY",
    etd: "2024-11-20",
    eta: "2024-12-25",

    // Itens detalhados
    items: [
      {
        id: 1,
        desc: 'Smartphone Android 128GB - Model TP-X15 Pro',
        ncm: '85171231',
        weight: '150',
        value: '15000',
        quantity: '100 UN',
        unitPrice: '150.00',
        origin: 'CN'
      },
      {
        id: 2,
        desc: 'Fone Bluetooth TWS - Model AirBuds Pro 3',
        ncm: '85183000',
        weight: '50',
        value: '3000',
        quantity: '200 UN',
        unitPrice: '15.00',
        origin: 'CN'
      }
    ],

    // Compliance
    compliance: { anvisa: false, mapa: false, outros: false, lpcoRequested: true },
    anuentes: ['ANATEL'],

    // Métricas de processamento
    processingTime: 6,
    manualTimeEstimate: 25
  },

  autoparts: {
    name: "Invoice_Autopeças_Stuttgart.pdf",
    invoiceNumber: "DE-2024-AUT-003291",
    invoiceDate: "2024-11-10",

    supplier: {
      name: "Süddeutsche Automotive GmbH",
      address: "Industriestraße 45, 70565 Stuttgart, Germany",
      contact: "export@sud-auto.de"
    },

    incoterm: "CIF Paranaguá",
    currency: "EUR",
    totalValue: 8750.00,
    freight: 0, // Incluído no CIF
    insurance: 0, // Incluído no CIF

    operation: {
      type: 'Importação Própria',
      urf: 'Paranaguá (PR)',
      country: 'Alemanha',
      modality: 'Normal',
      sector: 'Autopeças'
    },

    portOrigin: "Hamburg (DEHAM)",
    portDestination: "Paranaguá (BRPNG)",
    vessel: "HAMBURG EXPRESS",
    container: "HLCU8547123 - 20' DRY",
    etd: "2024-11-15",
    eta: "2024-12-10",

    items: [
      {
        id: 1,
        desc: 'Kit Embreagem Completo - Ref. VAG-001234',
        ncm: '87089990',
        weight: '25',
        value: '4500',
        quantity: '15 KIT',
        unitPrice: '300.00',
        origin: 'DE'
      },
      {
        id: 2,
        desc: 'Amortecedor Dianteiro Par - Ref. BILSTEIN-B4',
        ncm: '87088000',
        weight: '18',
        value: '3200',
        quantity: '20 PAR',
        unitPrice: '160.00',
        origin: 'DE'
      },
      {
        id: 3,
        desc: 'Pastilha Freio Cerâmica Premium - Ref. ATE-13046',
        ncm: '68138100',
        weight: '5',
        value: '1050',
        quantity: '30 JG',
        unitPrice: '35.00',
        origin: 'DE'
      }
    ],

    compliance: { anvisa: false, mapa: false, outros: true, lpcoRequested: true },
    anuentes: ['INMETRO'],

    processingTime: 8,
    manualTimeEstimate: 30
  },

  cosmetics: {
    name: "Invoice_Cosméticos_NewYork.pdf",
    invoiceNumber: "US-NYC-2024-78456",
    invoiceDate: "2024-11-08",

    supplier: {
      name: "Manhattan Beauty Supplies Inc.",
      address: "350 Fifth Avenue, Suite 4500, New York, NY 10118, USA",
      contact: "international@manhattanbeauty.com"
    },

    incoterm: "DAP Guarulhos Airport",
    currency: "USD",
    totalValue: 12500.00,
    freight: 0, // Incluído no DAP
    insurance: 0, // Incluído no DAP

    operation: {
      type: 'Conta e Ordem',
      urf: 'Aeroporto Guarulhos (SP)',
      country: 'Estados Unidos',
      modality: 'Normal',
      sector: 'Cosméticos'
    },

    portOrigin: "JFK Airport (USJFK)",
    portDestination: "Guarulhos (BRGRU)",
    vessel: "LATAM CARGO 8064",
    awb: "957-12345678",
    etd: "2024-11-12",
    eta: "2024-11-13",

    items: [
      {
        id: 1,
        desc: 'Sérum Vitamina C 30ml - SkinCeuticals C E Ferulic',
        ncm: '33049990',
        weight: '2',
        value: '8500',
        quantity: '50 UN',
        unitPrice: '170.00',
        origin: 'US'
      },
      {
        id: 2,
        desc: 'Creme Anti-idade 50g - La Prairie Platinum Rare',
        ncm: '33049100',
        weight: '3',
        value: '4000',
        quantity: '8 UN',
        unitPrice: '500.00',
        origin: 'CH' // Produto suíço distribuído dos EUA
      }
    ],

    compliance: { anvisa: true, mapa: false, outros: false, lpcoRequested: false },
    anuentes: ['ANVISA'],
    lpcoStatus: 'Pendente - Aguardando registro de produto',

    processingTime: 12,
    manualTimeEstimate: 45
  }
};

const ReportModal = ({
  results,
  extractionSummary,
  impostosEstimados,
  selectedAnuentes,
  items,
  aiFeedback,
  alertaSubfaturamento,
  invoiceInfo,
  uploadedFileName,
  timeStats,
  apiValidation,
  lpcoRequested,
  onClose
}: {
  results: {
    risks: string[];
    impactRange: string;
    totalImpact: string;
    avoided: string;
    details: { fines: string; demurrage: string; ops: string; total: string };
    inadimplencia: number;
  };
  extractionSummary: {
    totalItems: number;
    totalValue: number;
    currency: string;
    sector: string;
    country: string;
    processingTimeMs: number;
    ncmConfidence: { alta: number; media: number; baixa: number };
  } | null;
  impostosEstimados: {
    ii: number;
    ipi: number;
    pis_cofins: number;
    total_impostos: number;
    base_calculo: number;
  } | null;
  selectedAnuentes: string[];
  items: Array<{
    id: number;
    desc: string;
    ncm: string;
    weight: string;
    value: string;
    ncmDescricao?: string;
    ncmConfianca?: string;
    quantity?: string;
    unitPrice?: string;
    origin?: string;
    anuentes?: string[];
  }>;
  aiFeedback: string | null;
  alertaSubfaturamento: string | null;
  invoiceInfo: { invoice_number: string; supplier: { name: string; country: string } } | null;
  uploadedFileName: string | null;
  timeStats: { started: number; ended: number; saved: number };
  apiValidation: api.ValidationResult | null;
  lpcoRequested: boolean;
  onClose: () => void;
}) => {
  const formatBRL = (value?: number | null) => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/D';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  const sanitizeNcm = (ncm: string) => (ncm || '').replace(/\D/g, '');
  const totalItems = extractionSummary?.totalItems ?? items.length;
  const totalValue = extractionSummary?.totalValue ?? items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  const currency = extractionSummary?.currency || 'USD';
  const totalValueLabel = totalValue > 0 ? `${currency} ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/D';
  const ncmConfidence = extractionSummary?.ncmConfidence || {
    alta: items.filter(i => i.ncmConfianca === 'ALTA').length,
    media: items.filter(i => i.ncmConfianca === 'MEDIA').length,
    baixa: items.filter(i => i.ncmConfianca !== 'ALTA' && i.ncmConfianca !== 'MEDIA').length,
  };
  const genericNcmCount = items.filter(i => sanitizeNcm(i.ncm).length !== 8).length;
  const timeSavedLabel = typeof timeStats?.saved === 'number' ? `${timeStats.saved} min` : 'N/D';
  const impostosBreakdown = impostosEstimados ? [
    { label: 'II', value: formatBRL(impostosEstimados.ii) },
    { label: 'IPI', value: formatBRL(impostosEstimados.ipi) },
    { label: 'PIS/COFINS', value: formatBRL(impostosEstimados.pis_cofins) },
    { label: 'Total Estimado', value: formatBRL(impostosEstimados.total_impostos) },
  ] : [];
  const anuentesNaoMarcados = LISTA_ANUENTES.filter(a => !selectedAnuentes.includes(a));
  const riscoGeral = apiValidation?.risco_geral || null;
  const custosValidacao = apiValidation?.custos?.custoTotal ? formatBRL(apiValidation.custos.custoTotal) : null;
  const alertasBase = [
    ...(alertaSubfaturamento ? [alertaSubfaturamento] : []),
    ...results.risks,
  ];
  const alertas = Array.from(new Set(alertasBase));
  const recomendacoes: string[] = [];
  if (aiFeedback) recomendacoes.push(aiFeedback);
  const missingNcm = items.filter(i => !sanitizeNcm(i.ncm)).length;
  if (missingNcm > 0) {
    recomendacoes.push(`${missingNcm} item(s) ainda sem NCM definido. Preencha para reduzir risco.`);
  }
  if (selectedAnuentes.length === 0) {
    recomendacoes.push('Nenhum anuente marcado. Confirme exigências antes do registro.');
  }
  if (!lpcoRequested && selectedAnuentes.length > 0) {
    recomendacoes.push('LPCO não marcado como solicitado. Solicite se houver anuente aplicável.');
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('TrueNorth - Relatório da Operação', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(9);
    doc.text(
      `Arquivo: ${uploadedFileName || invoiceInfo?.invoice_number || 'N/D'} | País: ${extractionSummary?.country || invoiceInfo?.supplier?.country || 'N/D'}`,
      pageWidth / 2,
      26,
      { align: 'center' }
    );

    y = 42;
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(13);
    doc.text('Sumário Executivo', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Economia estimada: ${results.details?.total || 'N/D'}`, 14, y); y += 6;
    doc.text(`Riscos mitigados: ${results.risks.length}`, 14, y); y += 6;
    doc.text(`Tempo economizado: ${timeSavedLabel}`, 14, y); y += 8;

    doc.setFontSize(13);
    doc.text('Classificação NCM', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Itens classificados: ${totalItems}`, 14, y); y += 6;
    doc.text(`Confiança - Alta: ${ncmConfidence.alta} | Média: ${ncmConfidence.media} | Baixa: ${ncmConfidence.baixa}`, 14, y); y += 6;
    doc.text(`NCMs genéricos/pendentes: ${genericNcmCount}`, 14, y); y += 8;

    doc.setFontSize(13);
    doc.text('Impostos Estimados', 14, y);
    y += 8;
    doc.setFontSize(10);
    if (impostosBreakdown.length > 0) {
      impostosBreakdown.forEach(item => {
        doc.text(`${item.label}: ${item.value}`, 14, y);
        y += 6;
      });
    } else {
      doc.text('Não disponível para esta operação.', 14, y);
      y += 6;
    }
    y += 2;

    doc.setFontSize(13);
    doc.text('Compliance & Anuentes', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Selecionados: ${selectedAnuentes.length > 0 ? selectedAnuentes.join(', ') : 'Nenhum'}`, 14, y); y += 6;
    doc.text(`Pendentes: ${anuentesNaoMarcados.length > 0 ? anuentesNaoMarcados.join(', ') : 'Nenhum'}`, 14, y); y += 8;

    doc.setFontSize(13);
    doc.text('Alertas e Recomendações', 14, y);
    y += 8;
    doc.setFontSize(10);
    (alertas.length > 0 ? alertas : ['Nenhum alerta informado']).forEach(alerta => {
      doc.text(`• ${alerta}`, 14, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    recomendacoes.forEach(rec => {
      doc.text(`• ${rec}`, 14, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.addPage();
    y = 20;
    doc.setFontSize(13);
    doc.text('Itens da Operação', 14, y);
    y += 8;
    doc.setFontSize(10);
    items.forEach((item, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`Item ${idx + 1}: ${item.desc || 'Sem descrição'}`, 14, y); y += 6;
      doc.text(`NCM: ${item.ncm || 'N/A'} | Valor: ${item.value || '0'} | Peso: ${item.weight || '0'}`, 14, y); y += 6;
      if (item.ncmConfianca) { doc.text(`Confiança: ${item.ncmConfianca}`, 14, y); y += 6; }
      y += 2;
    });

    doc.save(`truenorth-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Validação de segurança - garantir que results tem estrutura correta
  if (!results || !results.risks) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Erro ao carregar relatório</h3>
            <p className="text-slate-400 mb-6">Estrutura de dados inválida. Por favor, execute a simulação novamente.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-accent-500" /> Relatório Completo da Operação
            </h3>
            <p className="text-xs text-slate-400">
              {uploadedFileName || invoiceInfo?.invoice_number || 'Operação simulada'} • {extractionSummary?.country || invoiceInfo?.supplier?.country || 'Origem não informada'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 uppercase mb-1">Economia estimada</div>
              <div className="text-lg font-bold text-green-400">{results?.details?.total || 'N/D'}</div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 uppercase mb-1">Riscos mapeados</div>
              <div className="text-lg font-bold text-orange-400">{results?.risks?.length || 0}</div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 uppercase mb-1">Tempo economizado</div>
              <div className="text-lg font-bold text-blue-400">{timeSavedLabel}</div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 uppercase mb-1">Risco geral</div>
              <div className="text-lg font-bold text-slate-100">{riscoGeral || 'Simulação'}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-500" /> Classificação NCM
                  </div>
                  <div className="text-xs text-slate-400">Itens: {totalItems} • Valor: {totalValueLabel}</div>
                </div>
                <div className="text-xs text-slate-500">Setor: {extractionSummary?.sector || 'N/D'}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-green-300">Alta</div>
                  <div className="text-lg font-bold text-green-400">{ncmConfidence.alta}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-amber-200">Média</div>
                  <div className="text-lg font-bold text-amber-300">{ncmConfidence.media}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-red-200">Baixa/Pendente</div>
                  <div className="text-lg font-bold text-red-300">{ncmConfidence.baixa}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">NCMs genéricos ou incompletos: {genericNcmCount}</div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-accent-500" /> Impostos Estimados
                </div>
                <div className="text-xs text-slate-400">{impostosEstimados ? 'Fonte: Extração' : 'Não informado'}</div>
              </div>
              {impostosBreakdown.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {impostosBreakdown.map(item => (
                    <div key={item.label} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Impostos não retornados pela API para esta operação.</div>
              )}
            </div>
          </div>

            <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-500" /> Compliance & Anuentes
              </div>
              <div className="text-xs text-slate-400">Selecionados: {selectedAnuentes.length > 0 ? selectedAnuentes.join(', ') : 'Nenhum'}</div>
              <div className="text-xs text-slate-500">Pendentes para revisão: {anuentesNaoMarcados.join(', ') || 'Nenhum'}</div>
              <div className="text-xs text-slate-400">LPCO: {lpcoRequested ? 'Solicitado' : 'Não indicado'}</div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" /> Alertas e Recomendações
              </div>
              <div className="flex flex-wrap gap-2">
                {(alertas.length > 0 ? alertas : ['Nenhum alerta registrado']).map((alerta, idx) => (
                  <span key={`alerta-${idx}`} className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-200 text-xs px-2 py-1 rounded-full border border-orange-500/30">
                    <AlertTriangle className="w-3 h-3" /> {alerta}
                  </span>
                ))}
                {recomendacoes.map((rec, idx) => (
                  <span key={`rec-${idx}`} className="inline-flex items-center gap-1 bg-accent-500/10 text-accent-200 text-xs px-2 py-1 rounded-full border border-accent-500/30">
                    <Sparkles className="w-3 h-3" /> {rec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {results && (
            <div className="sticky bottom-4 z-10">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row gap-3 shadow-lg shadow-slate-900/40">
                <button
                  onClick={handleSimulationClick}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Calculator className="w-4 h-4" /> Revalidar simulação
                </button>
                <button
                  onClick={generateDocument}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FileCheck className="w-4 h-4" /> Exportar XML/PDF
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-accent-500" /> Itens da Operação
              </div>
              <div className="text-xs text-slate-400">{items.length} item(s)</div>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const isRecommended = item.ncmFonte === 'recomendado' && !item.ncmEditado;
                const isEdited = !!item.ncmEditado;
                const isFromDocument = item.ncmFonte === 'documento';
                const isOpen = expandedItem === item.id;

                return (
                  <div key={item.id || idx} className="bg-slate-900 border border-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedItem(isOpen ? null : item.id)}
                      className="w-full text-left px-3 py-3 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          Item {idx + 1}
                          {isFromDocument && <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">NCM do doc</span>}
                          {isEdited && <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">Editado</span>}
                          {isRecommended && <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">Recomendado</span>}
                        </div>
                        <div className="text-sm text-slate-300 mt-1 line-clamp-1">{item.desc || 'Sem descrição'}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                          <span>Valor: {item.value || '0'}</span>
                          <span>Peso: {item.weight || '0'} kg</span>
                          {item.ncmConfianca && <span>Confiança: {item.ncmConfianca}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <NcmBadge
                          item={item}
                          idx={idx}
                          operationId={currentOperationId}
                          onNcmUpdate={(newNcm) => {
                            const updatedItems = [...items];
                            updatedItems[idx] = { ...updatedItems[idx], ncm: newNcm, ncmEditado: newNcm };
                            setItems(updatedItems);
                          }}
                        />
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-800 px-3 pb-3 text-sm text-slate-200 space-y-2">
                        <div className="flex flex-wrap gap-3 text-[12px] text-slate-400">
                          <span>Qtd/Unidade: {item.quantity || 'N/D'}</span>
                          <span>Unit: {item.unitPrice || item.unit_price || 'N/D'}</span>
                          <span>Origem: {item.origin || item.origem || 'N/D'}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          NCM fonte: {item.ncmFonte || 'N/D'} {item.ncmDocumento ? `• Doc: ${item.ncmDocumento}` : ''}
                        </div>
                        {item.anuentes && item.anuentes.length > 0 && (
                          <div className="text-xs text-slate-300 flex flex-wrap gap-2">
                            {item.anuentes.map((a: string) => (
                              <span key={a} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] border border-slate-700">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-accent-500" /> Valor agregado desta análise
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                <div className="text-xs text-slate-500">Multas evitadas</div>
                <div className="text-sm font-semibold text-white">{results.details?.fines || 'N/D'}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                <div className="text-xs text-slate-500">Demurrage evitado</div>
                <div className="text-sm font-semibold text-white">{results.details?.demurrage || 'N/D'}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                <div className="text-xs text-slate-500">Eficiência operacional</div>
                <div className="text-sm font-semibold text-white">{results.details?.ops || 'N/D'}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                <div className="text-xs text-slate-500">Custos (validação real)</div>
                <div className="text-sm font-semibold text-white">{custosValidacao || 'N/D'}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PlatformSimulationPage = ({
  onNavigateHome,
  currentUser,
  onLogout,
  onOpenAuth,
}: {
  onNavigateHome: () => void;
  currentUser: api.User | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}) => {
  const [operationData, setOperationData] = useState({
    type: 'Importação Própria',
    urf: 'Santos (SP)',
    country: 'China',
    modality: 'Normal',
    sector: 'Outros'
  });
  const [duimpFields, setDuimpFields] = useState({
    cnpj: '',
    nome: '',
    uf: '',
    codigoURF: 'NAO_INFORMADO',
    viaTransporte: 'MARITIMO',
    tipoDeclaracao: 'CONSUMO',
    dataEmbarque: '',
    incoterm: 'FOB',
    moeda: 'USD'
  });

  const [items, setItems] = useState([
    { id: 1, desc: '', ncm: '', weight: '', value: '', unitPrice: '', quantity: '', origin: '' }
  ]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  // Estado de compliance usando novo sistema de multi-select
  const [selectedAnuentes, setSelectedAnuentes] = useState<string[]>([]);
  const [lpcoRequested, setLpcoRequested] = useState(false);
  const [anuentsDropdownOpen, setAnuentsDropdownOpen] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false); // Indica se anuentes foram preenchidos automaticamente

  const [calculating, setCalculating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [results, setResults] = useState<null | {
    risks: string[],
    impactRange: string,
    totalImpact: string,
    avoided: string,
    details: {
      fines: string,
      demurrage: string,
      ops: string,
      total: string
    },
    inadimplencia: number
  }>(null);

  // --- NOVOS ESTADOS PARA O FLUXO DO COPILOTO ---
  const [workflowStep, setWorkflowStep] = useState<'upload' | 'processing' | 'summary' | 'form' | 'document'>('upload');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [timeStats, setTimeStats] = useState({ started: 0, ended: 0, saved: 17 }); // minutos economizados
  const [showProfile, setShowProfile] = useState(false);

  // --- ESTADOS PARA INTEGRAÇÃO COM API REAL ---
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
  const [apiValidation, setApiValidation] = useState<api.ValidationResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS PARA HISTÓRICO DE OPERAÇÕES ---
  const [operationsHistory, setOperationsHistory] = useState<api.Operation[]>([]);
  const [operationsStats, setOperationsStats] = useState<api.OperationsStats | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- ESTADOS PARA NOVO LAYOUT ---
  const [showFichaModal, setShowFichaModal] = useState(false);
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const [showCalculationExplainer, setShowCalculationExplainer] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  useEffect(() => {
    // Evita overlay escuro sem conteúdo caso os resultados não existam
    if (showReport && (!results || !results.risks)) {
      setShowReport(false);
    }
  }, [showReport, results]);

  // Novas features - Impostos, Descrição DI, Subfaturamento
  const [impostosEstimados, setImpostosEstimados] = useState<{
    ii: number;
    ipi: number;
    pis_cofins: number;
    total_impostos: number;
    base_calculo: number;
  } | null>(null);
  const [descricaoDI, setDescricaoDI] = useState<string | null>(null);
  const [alertaSubfaturamento, setAlertaSubfaturamento] = useState<string | null>(null);
  const [invoiceInfo, setInvoiceInfo] = useState<{
    invoice_number: string;
    supplier: { name: string; country: string };
  } | null>(null);
  const [incotermInfo, setIncotermInfo] = useState<api.IncotermInfo | undefined>(undefined);

  // --- ESTADOS PARA UX CLEAN (Summary Card + Campos Avançados) ---
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [extractionSummary, setExtractionSummary] = useState<{
    totalItems: number;
    totalValue: number;
    currency: string;
    sector: string;
    country: string;
    processingTimeMs: number;
    ncmConfidence: { alta: number; media: number; baixa: number };
  } | null>(null);
  const [editEssentials, setEditEssentials] = useState(false);

  // Carrega histórico de operações
  const loadOperationsHistory = async () => {
    setLoadingHistory(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        api.listOperations(5, 0),
        api.getOperationsStats()
      ]);
      setOperationsHistory(historyRes.operations);
      setOperationsStats(statsRes);
    } catch (error) {
      console.warn('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Carregar histórico automaticamente ao abrir o perfil
  useEffect(() => {
    if (showProfile && currentUser) {
      loadOperationsHistory();
    }
  }, [showProfile, currentUser]);

  // Carrega histórico ao montar o componente
  useEffect(() => {
    loadOperationsHistory();
  }, []);

  // Função para fazer upload de arquivo real
  const handleFileUpload = async (file: File) => {
    // Verificar se usuário está logado antes de fazer upload
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    setWorkflowStep('processing');
    setProcessingProgress(0);
    setTimeStats({ ...timeStats, started: Date.now() });
    setUploadedFileName(file.name);
    setSelectedInvoice(null); // Not using sample invoice
    setIncotermInfo(undefined);

    try {
      // Step 1: Upload & Process (0-70%) - Now done in single call
      setProcessingProgress(10);
      const { operationId, extractedData } = await api.uploadFile(file);
      setCurrentOperationId(operationId);
      setProcessingProgress(70);

      // Step 2: Validate (70-100%)
      setProcessingProgress(80);
      const validation = await api.validateOperation(operationId);
      setApiValidation(validation);

      // Auto-fill compliance após validação (merge com seleção existente)
      if (validation?.anuentes_necessarios && validation.anuentes_necessarios.length > 0) {
        setSelectedAnuentes(prev => {
          const merged = new Set([...prev, ...validation.anuentes_necessarios]);
          console.log('[Auto-fill] Anuentes após validação:', Array.from(merged));
          return Array.from(merged);
        });
        setAutoFilled(true);
      }

      setProcessingProgress(100);

      // Convert API data to form format
      const apiItems = (extractedData?.items || []).map((item: any, idx: number) => ({
        id: idx + 1,
        desc: item.description || '',
        ncm: item.ncm_editado || item.ncm_sugerido || '',  // Prioriza NCM editado
        ncmDescricao: item.ncm_descricao || '',
        ncmConfianca: item.ncm_confianca || '',
        ncmFonte: item.ncm_fonte || 'recomendado',  // 'documento' ou 'recomendado'
        ncmDocumento: item.ncm_documento || null,
        ncmEditado: item.ncm_editado || null,
        ncmEditadoEm: item.ncm_editado_em || null,
        weight: (item.peso_bruto ?? item.peso_kg ?? item.peso_liquido ?? '').toString(),
        value: item.total_price?.toString() || '0',
        quantity: `${item.quantity || ''} ${item.unit || ''}`.trim(),
        unitPrice: item.unit_price?.toString() || '0',
        origin: item.origem || '',
        anuentes: item.anuentes_necessarios || []
      }));

      // Update form with extracted data
      const detectedSector = extractedData?.setor_detectado || 'Outros';
      setOperationData({
        type: 'Importação Própria',
        urf: 'Santos (SP)',
        country: extractedData?.supplier?.country || 'Desconhecido',
        modality: 'Normal',
        sector: detectedSector
      });
      setDuimpFields({
        cnpj: extractedData?.buyer?.cnpj || '',
        nome: extractedData?.buyer?.name || '',
        uf: extractedData?.buyer?.estado || '',
        codigoURF: extractedData?.codigo_urf || 'NAO_INFORMADO',
        viaTransporte: extractedData?.via_transporte || extractedData?.modal || 'MARITIMO',
        tipoDeclaracao: extractedData?.tipo_declaracao || 'CONSUMO',
        dataEmbarque: extractedData?.invoice_date || '',
        incoterm: extractedData?.incoterm || 'FOB',
        moeda: extractedData?.currency || 'USD'
      });
      setItems(apiItems.length > 0 ? apiItems : [{ id: 1, desc: '', ncm: '', weight: '', value: '', unitPrice: '', quantity: '', origin: '' }]);

      // Set AI feedback if available
      setAiFeedback(extractedData?.feedback_especialista || null);

      // Set new features - Impostos, Descrição DI, Subfaturamento
      setImpostosEstimados(extractedData?.impostos_estimados || null);
      setDescricaoDI(extractedData?.descricao_di || null);
      setAlertaSubfaturamento(extractedData?.alerta_subfaturamento || null);
      setInvoiceInfo({
        invoice_number: extractedData?.invoice_number || 'N/A',
        supplier: extractedData?.supplier || { name: 'N/A', country: 'N/A' }
      });
      setIncotermInfo(extractedData?.incoterm_info);

      // Auto-fill compliance com anuentes detectados
      if (extractedData?.anuentes_operacao && extractedData.anuentes_operacao.length > 0) {
        setSelectedAnuentes(extractedData.anuentes_operacao);
        setAutoFilled(true);
        console.log('[Auto-fill] Anuentes da operação:', extractedData.anuentes_operacao);
      } else {
        // Fallback: agregar de todos os itens
        const anuentesAgregados = new Set<string>();
        apiItems.forEach((item: any) => {
          (item.anuentes || []).forEach((a: string) => anuentesAgregados.add(a));
        });
        if (anuentesAgregados.size > 0) {
          setSelectedAnuentes(Array.from(anuentesAgregados));
          setAutoFilled(true);
          console.log('[Auto-fill] Anuentes agregados dos itens:', Array.from(anuentesAgregados));
        }
      }

      // Calculate time saved
      // Validar que started foi setado (se for 0, é o valor inicial inválido)
      const validStartTime = timeStats.started > 0 ? timeStats.started : Date.now();
      const processingTimeMs = Date.now() - validStartTime;
      const processingTime = Math.round(processingTimeMs / 1000 / 60);
      setTimeStats(prev => ({ ...prev, ended: Date.now(), saved: Math.max(17, 25 - processingTime) }));

      // Calculate extraction summary for Summary Card
      const ncmConfidence = { alta: 0, media: 0, baixa: 0 };
      apiItems.forEach((item: any) => {
        if (item.ncmConfianca === 'ALTA') ncmConfidence.alta++;
        else if (item.ncmConfianca === 'MEDIA') ncmConfidence.media++;
        else ncmConfidence.baixa++;
      });

      const totalValue = apiItems.reduce((sum: number, item: any) => sum + (parseFloat(item.value) || 0), 0);

      setExtractionSummary({
        totalItems: apiItems.length,
        totalValue,
        currency: extractedData?.currency || 'USD',
        sector: detectedSector,
        country: extractedData?.supplier?.country || 'Desconhecido',
        processingTimeMs,
        ncmConfidence
      });

      // Go to summary step instead of form
      setWorkflowStep('summary');

      // Reload history after successful operation
      loadOperationsHistory();
    } catch (error: any) {
      console.error('Error processing file:', error);
      // Se erro de autenticação, mostrar modal de login
      if (error.message.includes('Autenticação') || error.message.includes('logado') || error.message.includes('Token')) {
        onOpenAuth('login');
      } else {
        alert('Erro ao processar arquivo: ' + error.message);
      }
      setWorkflowStep('upload');
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Função para copiar dados para clipboard
  const handleCopyFields = () => {
    const fieldsText = items.map((item, idx) =>
      `Item ${idx + 1}:
- Descrição: ${item.desc}
- NCM: ${item.ncm}
- Peso: ${item.weight} kg
- Valor: USD ${item.value}`
    ).join('\n\n');

    const fullText = `=== DADOS DA OPERAÇÃO ===
Tipo: ${operationData.type}
URF: ${operationData.urf}
País de Origem: ${operationData.country}
Modalidade: ${operationData.modality}

=== ITENS ===
${fieldsText}

=== ANUENTES ===
${selectedAnuentes.join(', ') || 'Nenhum'}
LPCO: ${lpcoRequested ? 'Sim' : 'Não'}`;

    navigator.clipboard.writeText(fullText).then(() => {
      alert('Dados copiados para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar dados.');
    });
  };

  // Função para copiar TODOS os dados extraídos formatados
  const handleCopyAll = () => {
    const itemsText = items.map((item, idx) =>
      `${idx + 1}. ${item.desc || 'Item sem descrição'} - NCM ${item.ncm || 'N/A'} - USD ${item.value || '0.00'}`
    ).join('\n');

    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

    let fullText = `══════════════════════════════════════
INVOICE: ${invoiceInfo?.invoice_number || 'N/A'}
FORNECEDOR: ${invoiceInfo?.supplier?.name || 'N/A'} (${invoiceInfo?.supplier?.country || 'N/A'})
VALOR TOTAL: USD ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
══════════════════════════════════════

ITENS:
${itemsText}`;

    if (impostosEstimados) {
      fullText += `

══════════════════════════════════════
IMPOSTOS ESTIMADOS:
II: R$ ${impostosEstimados.ii.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
IPI: R$ ${impostosEstimados.ipi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
PIS/COFINS: R$ ${impostosEstimados.pis_cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
TOTAL: R$ ${impostosEstimados.total_impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Base de cálculo: R$ ${impostosEstimados.base_calculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
══════════════════════════════════════`;
    }

    if (selectedAnuentes.length > 0) {
      fullText += `

ANUENTES NECESSÁRIOS: ${selectedAnuentes.join(', ')}`;
    }

    if (alertaSubfaturamento) {
      fullText += `

⚠️ ALERTA: ${alertaSubfaturamento}`;
    }

    navigator.clipboard.writeText(fullText).then(() => {
      alert('Todos os dados copiados para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar dados.');
    });
  };

  // Função para exportar XML Siscomex
  const handleExportSiscomexXml = async () => {
    if (!currentOperationId) {
      alert('Nenhuma operação selecionada para exportar');
      return;
    }

    try {
      const overrides = buildExportOverrides();
      const preview = await api.getExportPreview(currentOperationId, overrides);

      if (preview.validationErrors.length > 0) {
        alert(`Corrija os campos antes de exportar:\n${preview.validationErrors.join('\n')}`);
        return;
      }

      await api.exportSiscomexXml(currentOperationId, overrides, true);
      alert('XML exportado com sucesso!');
    } catch (error: any) {
      // Format error message with line breaks for validation errors
      const message = error.message?.includes('\n')
        ? error.message
        : `Erro ao exportar XML:\n${error.message}`;
      alert(message);
    }
  };

  // Função para exportar DUIMP como PDF
  const handleExportDUIMP = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('TrueNorth - Rascunho DUIMP', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Operação ID: ${currentOperationId || 'N/A'}`, pageWidth / 2, 38, { align: 'center' });

    y = 55;
    doc.setTextColor(0, 0, 0);

    // Dados da Operação
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados da Operação', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo de Operação: ${operationData.type}`, 14, y); y += 6;
    doc.text(`URF de Despacho: ${operationData.urf}`, 14, y); y += 6;
    doc.text(`País de Origem: ${operationData.country}`, 14, y); y += 6;
    doc.text(`Modalidade: ${operationData.modality}`, 14, y); y += 10;

    // Itens
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Itens da Importação', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    items.forEach((item, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Item ${idx + 1}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      doc.text(`  NCM: ${item.ncm || 'Não informado'}`, 14, y); y += 5;
      doc.text(`  Descrição: ${(item.desc || 'Não informado').substring(0, 60)}`, 14, y); y += 5;
      doc.text(`  Peso: ${item.weight || '0'} kg | Valor: USD ${item.value || '0'}`, 14, y); y += 8;
    });

    // Anuentes
    y += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Anuentes e Compliance', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Órgãos Anuentes: ${selectedAnuentes.length > 0 ? selectedAnuentes.join(', ') : 'Nenhum'}`, 14, y);
    y += 6;
    doc.text(`LPCO Requerido: ${lpcoRequested ? 'Sim' : 'Não'}`, 14, y);

    // Resultado da Validação API
    if (apiValidation) {
      y += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resultado da Validação', 14, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Risco Geral: ${apiValidation.risco_geral || 'N/A'}`, 14, y);
      y += 6;
      doc.text(`Custo Total de Erros: R$ ${(apiValidation.custos?.custoTotal || 0).toLocaleString('pt-BR')}`, 14, y);
      y += 6;
      doc.text(`Dias de Atraso Estimado: ${apiValidation.custos?.diasAtrasoEstimado || 0} dias`, 14, y);
    }

    // Footer
    y = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TrueNorth - Documento gerado automaticamente. Verifique os dados antes de submeter ao SISCOMEX.', pageWidth / 2, y, { align: 'center' });

    doc.save(`duimp-rascunho-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Função para processar invoice (simula extração de dados)
  const processInvoice = (invoiceKey: keyof typeof SAMPLE_INVOICES) => {
    setSelectedInvoice(invoiceKey);
    setWorkflowStep('processing');
    setProcessingProgress(0);
    setTimeStats({ ...timeStats, started: Date.now() });

    // Simula progresso de processamento
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Após 2.5 segundos, preenche o formulário
    setTimeout(() => {
      const invoice = SAMPLE_INVOICES[invoiceKey];
      setOperationData(invoice.operation);
      setItems(invoice.items);
      // Usar campo anuentes se disponível, senão converter do compliance antigo
      if (invoice.anuentes && invoice.anuentes.length > 0) {
        setSelectedAnuentes(invoice.anuentes);
        setAutoFilled(true);
        console.log('[Auto-fill] Anuentes do histórico:', invoice.anuentes);
      } else if (invoice.compliance) {
        const anuentes: string[] = [];
        if (invoice.compliance.anvisa) anuentes.push('ANVISA');
        if (invoice.compliance.mapa) anuentes.push('MAPA');
        if (invoice.compliance.anatel) anuentes.push('ANATEL');
        if (invoice.compliance.inmetro) anuentes.push('INMETRO');
        if (invoice.compliance.ibama) anuentes.push('IBAMA');
        if (anuentes.length > 0) {
          setSelectedAnuentes(anuentes);
          setAutoFilled(true);
          console.log('[Auto-fill] Anuentes convertidos do formato antigo:', anuentes);
        }
      }
      setLpcoRequested(invoice.compliance?.lpcoRequested || false);
      setWorkflowStep('form');
      setTimeStats(prev => ({ ...prev, ended: Date.now(), saved: 25 - invoice.processingTime }));
    }, 2500);
  };

  // Função para gerar documento
  const generateDocument = () => {
    setShowDocumentPreview(true);
    setWorkflowStep('document');
  };

  // Função para voltar ao início
  const resetWorkflow = () => {
    setWorkflowStep('upload');
    setSelectedInvoice(null);
    setProcessingProgress(0);
    setShowDocumentPreview(false);
    setResults(null);
    setOperationData({
      type: 'Importação Própria',
      urf: 'Santos (SP)',
      country: 'China',
      modality: 'Normal',
      sector: 'Outros'
    });
    setDuimpFields({
      cnpj: '',
      nome: '',
      uf: '',
      codigoURF: 'NAO_INFORMADO',
      viaTransporte: 'MARITIMO',
      tipoDeclaracao: 'CONSUMO',
      dataEmbarque: '',
      incoterm: 'FOB',
      moeda: 'USD'
    });
    setItems([{ id: 1, desc: '', ncm: '', weight: '', value: '', unitPrice: '', quantity: '', origin: '' }]);
    setSelectedAnuentes([]);
    setLpcoRequested(false);
    // Reset API states
    setCurrentOperationId(null);
    setApiValidation(null);
    setUploadedFileName(null);
  };

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    if (items.length < 3) {
      setItems([...items, { id: Date.now(), desc: '', ncm: '', weight: '', value: '', unitPrice: '', quantity: '', origin: '' }]);
    }
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const toNumber = (value: any): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const cleaned = String(value).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  };

  const parseQuantityUnit = (value: string) => {
    if (!value) return { quantity: undefined, unit: undefined };
    const match = value.match(/([\d.,]+)/);
    const quantity = match ? parseFloat(match[1].replace(',', '.')) : undefined;
    const unit = value.replace(match ? match[1] : '', '').trim() || undefined;
    return { quantity, unit };
  };

  const buildExportOverrides = (): api.ExportOverrides => {
    const itemOverrides = items.map((item, idx) => {
      const { quantity, unit } = parseQuantityUnit(item.quantity || '');
      return {
        sequencial: idx + 1,
        ncm: item.ncm,
        description: item.desc,
        quantity,
        unit,
        total_price: toNumber(item.value),
        unit_price: toNumber(item.unitPrice),
        peso_bruto: toNumber(item.weight),
        peso_kg: toNumber(item.weight),
        peso_liquido: toNumber(item.weight),
        origem: item.origin || undefined,
      };
    });

    return {
      numeroReferencia: invoiceInfo?.invoice_number,
      dataEmbarque: duimpFields.dataEmbarque,
      incoterm: duimpFields.incoterm,
      moeda: duimpFields.moeda,
      codigo_urf: duimpFields.codigoURF,
      via_transporte: duimpFields.viaTransporte,
      tipo_declaracao: duimpFields.tipoDeclaracao,
      importador: {
        cnpj: duimpFields.cnpj,
        nome: duimpFields.nome,
        uf: duimpFields.uf,
      },
      buyer: {
        cnpj: duimpFields.cnpj,
        name: duimpFields.nome,
        estado: duimpFields.uf,
      },
      items: itemOverrides,
    };
  };

  // Handler do botão que verifica autenticação antes de rodar a simulação
  const handleSimulationClick = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    runSimulation();
  };

  const runSimulation = () => {
    setCalculating(true);
    setResults(null);
    setShowReport(false);

    setTimeout(() => {
      // Simulação de inadimplência (0 a 1) para cálculo de risco NCM
      const inadimplenciaSimulada = 0.6; // 60%

      const risks = [];
      let impactLow = 0;
      let impactHigh = 0;

      // 1. Verificação de NCM (vazio ou inválido) com regra de risco
      const itemsWithRisk = items.map(item => {
        const riscoNcm = calcularRiscoNCM(item.ncm, inadimplenciaSimulada);
        return { ...item, riscoNcm };
      });

      const invalidNCMs = itemsWithRisk.filter(i => i.riscoNcm >= 85);

      if (invalidNCMs.length > 0) {
        risks.push(`${invalidNCMs.length} item(s) com NCM inválida ou de alto risco (>85%).`);
        impactLow += 500 * invalidNCMs.length;
        impactHigh += 2000 * invalidNCMs.length;
      }

      const emptyNCMs = items.filter(i => !i.ncm);
      if (emptyNCMs.length > 0) {
        risks.push(`NCM não informada para ${emptyNCMs.length} item(s).`);
      }

      const subValueRisks = items.filter(i => {
         const w = parseFloat(i.weight) || 0;
         const v = parseFloat(i.value) || 0;
         return w > 0 && v < w * 2;
      });
      if (subValueRisks.length > 0) {
        risks.push("Risco de subfaturamento identificado (Valor/Peso abaixo da média do setor).");
        impactLow += 5000;
        impactHigh += 15000;
      }

      const requiresAnuente = ['Alimentos/Bebidas', 'Cosméticos', 'Químico'].includes(operationData.sector);
      const hasAnuenteChecked = selectedAnuentes.length > 0;

      if (requiresAnuente && !hasAnuenteChecked) {
        risks.push(`Setor ${operationData.sector} geralmente exige LPCO (Anuente) não assinalado.`);
        impactLow += 2000;
        impactHigh += 5000;
      }

      if (requiresAnuente && !lpcoRequested) {
        risks.push("LPCO não solicitado previamente. Alto risco de retenção de carga (Demurrage).");
        impactLow += 10000;
        impactHigh += 40000;
      }

      if (risks.length === 0) {
        risks.push("Nenhum risco crítico identificado nesta simulação preliminar.");
      }

      const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      const totalAvoidedRaw = impactHigh * 0.85;
      const finesPart = totalAvoidedRaw * 0.40;
      const demurragePart = totalAvoidedRaw * 0.40;
      const opsPart = totalAvoidedRaw * 0.20;

      setResults({
        risks,
        impactRange: `${fmt(impactLow)} a ${fmt(impactHigh)}`,
        totalImpact: fmt(impactHigh + (impactHigh * 0.2)),
        avoided: fmt(totalAvoidedRaw),
        details: {
          fines: fmt(finesPart),
          demurrage: fmt(demurragePart),
          ops: fmt(opsPart),
          total: fmt(totalAvoidedRaw)
        },
        inadimplencia: inadimplenciaSimulada
      });

      setCalculating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary-600 selection:text-white">
      {/* Simulation Header */}
      <nav className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
              <Anchor className="h-6 w-6 text-accent-500" />
              <span className="font-bold text-lg tracking-tight text-white">TrueNorth</span>
           </div>
      <div className="flex items-center gap-3">
        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
            <button
              onClick={() => setShowProfile((prev) => !prev)}
              className="flex items-center gap-2 hover:text-white text-slate-300"
              title="Abrir perfil"
            >
              <User className="w-4 h-4 text-primary-400" />
              <span className="text-sm">{currentUser.name || currentUser.email}</span>
            </button>
            <button
              onClick={onLogout}
              className="ml-1 p-1 hover:bg-slate-700 rounded transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            </button>
          </div>
        )}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
        >
               <Home className="w-4 h-4" /> Home
             </button>
           </div>
        </div>
      </nav>

      {/* Modal de Autenticação */}
      <main className="py-12 md:py-16">
        <AnimatePresence>
          {showReport && results && (
            <ReportModal
              results={results}
              extractionSummary={extractionSummary}
              impostosEstimados={impostosEstimados}
              selectedAnuentes={selectedAnuentes}
              items={items}
              aiFeedback={aiFeedback}
              alertaSubfaturamento={alertaSubfaturamento}
              invoiceInfo={invoiceInfo}
              uploadedFileName={uploadedFileName}
              timeStats={timeStats}
              apiValidation={apiValidation}
              lpcoRequested={lpcoRequested}
              onClose={() => setShowReport(false)}
            />
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header dinâmico baseado no step */}
          <div className="mb-12 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/30 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-4">
               <Sparkles className="w-3 h-3" /> Seu Copiloto de Importação
             </div>
             <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
               {workflowStep === 'upload' && 'Comece enviando sua Invoice'}
               {workflowStep === 'processing' && 'Seu copiloto está analisando...'}
               {workflowStep === 'summary' && 'Invoice processada com sucesso'}
               {workflowStep === 'form' && 'Revise os dados extraídos'}
               {workflowStep === 'document' && 'Documento pronto para uso'}
             </h1>
             <p className="text-slate-400 max-w-2xl mx-auto">
               {workflowStep === 'upload' && 'Arraste uma invoice ou escolha um exemplo para ver a mágica acontecer.'}
               {workflowStep === 'processing' && 'Extraindo dados, validando NCMs e verificando anuências...'}
               {workflowStep === 'summary' && 'Confira o resumo da extração antes de prosseguir.'}
               {workflowStep === 'form' && `Campos preenchidos automaticamente. Você economizou ${timeStats.saved} minutos!`}
               {workflowStep === 'document' && 'Copie os dados ou exporte o rascunho para o Portal Único.'}
             </p>

             {/* Indicador de progresso */}
             {workflowStep !== 'upload' && (
               <div className="flex items-center justify-center gap-2 mt-6">
                 <button onClick={resetWorkflow} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                   ← Nova operação
                 </button>
               </div>
             )}
          </div>

          {/* === STEP 1: UPLOAD === */}
          {workflowStep === 'upload' && (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Área de Upload */}
              <div
                className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-primary-500/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,.xml,.png,.jpg,.jpeg,.webp,.heic,.heif,image/*"
                  className="hidden"
                />
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600/20 transition-colors">
                  <Upload className="w-10 h-10 text-slate-500 group-hover:text-primary-400 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Arraste sua Invoice aqui</h3>
                <p className="text-slate-500 text-sm mb-4">PDF, XML ou Imagem • Processado com IA</p>
                <div className="text-xs text-slate-600">ou clique para selecionar</div>
              </div>

              {/* Divisor */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-slate-600 text-sm">ou escolha um exemplo</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              {/* Exemplos de Invoice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => processInvoice('electronics')}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-primary-500/50 hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Eletrônicos</div>
                      <div className="text-slate-500 text-xs">China → Santos</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">2 itens • ~6 min</div>
                </button>

                <button
                  onClick={() => processInvoice('autoparts')}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-accent-500/50 hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Autopeças</div>
                      <div className="text-slate-500 text-xs">Alemanha → Paranaguá</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">3 itens • ~8 min</div>
                </button>

                <button
                  onClick={() => processInvoice('cosmetics')}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-green-500/50 hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Cosméticos</div>
                      <div className="text-slate-500 text-xs">EUA → Guarulhos</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">2 itens • ANVISA • ~12 min</div>
                </button>
              </div>

              {/* Histórico de Operações */}
              {operationsHistory.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-slate-600 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Últimas operações
                    </span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                  </div>

                  {/* Estatísticas Rápidas */}
                  {operationsStats && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">{operationsStats.totalOperations}</div>
                        <div className="text-xs text-slate-500">Operações</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          R$ {(operationsStats.totalCostsAvoided || 0).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500">Custos evitados</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-accent-400">{operationsStats.totalTimeSavedMin || 0} min</div>
                        <div className="text-xs text-slate-500">Tempo economizado</div>
                      </div>
                    </div>
                  )}

                  {/* Lista de Operações */}
                  <div className="space-y-2">
                    {operationsHistory.map((op) => (
                      <div
                        key={op.id}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            op.status === 'VALIDADO' ? 'bg-green-500/10' :
                            op.status === 'COM_ERROS' ? 'bg-orange-500/10' :
                            'bg-slate-800'
                          }`}>
                            {op.status === 'VALIDADO' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : op.status === 'COM_ERROS' ? (
                              <AlertTriangle className="w-5 h-5 text-orange-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {op.arquivoNome || 'Operação sem nome'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(op.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {op.arquivoTipo && ` • ${op.arquivoTipo}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {op.custoTotalErros && Number(op.custoTotalErros) > 0 ? (
                            <div className="text-orange-400 text-sm font-medium">
                              R$ {Number(op.custoTotalErros).toLocaleString('pt-BR')}
                            </div>
                          ) : (
                            <div className="text-green-400 text-sm font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> OK
                            </div>
                          )}
                          {op.tempoEconomizadoMin && (
                            <div className="text-xs text-slate-500">
                              {op.tempoEconomizadoMin} min economizados
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {loadingHistory && (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      Carregando histórico...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Perfil dentro da simulação */}
          {showProfile && (
            <div className="max-w-6xl mx-auto mb-8">
              <ProfileSection />
            </div>
          )}

          {/* === STEP 2: PROCESSING === */}
          {workflowStep === 'processing' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                {/* Animação do Copiloto */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-primary-600/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-primary-600/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">Analisando invoice...</h3>

                {/* Barra de progresso */}
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <motion.div
                    className="bg-gradient-to-r from-primary-600 to-accent-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                {/* Status de processamento */}
                <div className="space-y-2 text-sm text-slate-400">
                  <div className={`flex items-center justify-center gap-2 ${processingProgress > 15 ? 'text-green-400' : ''}`}>
                    {processingProgress > 15 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-600 rounded-full animate-spin border-t-primary-500" />}
                    Lendo documento...
                  </div>
                  <div className={`flex items-center justify-center gap-2 ${processingProgress > 35 ? 'text-green-400' : ''}`}>
                    {processingProgress > 35 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-600 rounded-full animate-spin border-t-primary-500" />}
                    Extraindo dados dos itens...
                  </div>
                  <div className={`flex items-center justify-center gap-2 ${processingProgress > 55 ? 'text-green-400' : ''}`}>
                    {processingProgress > 55 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-600 rounded-full animate-spin border-t-primary-500" />}
                    Classificando NCMs...
                  </div>
                  <div className={`flex items-center justify-center gap-2 ${processingProgress > 75 ? 'text-green-400' : ''}`}>
                    {processingProgress > 75 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-600 rounded-full animate-spin border-t-primary-500" />}
                    Verificando anuentes...
                  </div>
                  <div className={`flex items-center justify-center gap-2 ${processingProgress > 90 ? 'text-green-400' : ''}`}>
                    {processingProgress > 90 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-600 rounded-full animate-spin border-t-primary-500" />}
                    Calculando impostos...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === STEP 2.5: SUMMARY CARD (Feedback Breve) === */}
          {workflowStep === 'summary' && extractionSummary && (
            <div className="max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
              >
                {/* Header com status */}
                <div className="bg-gradient-to-r from-green-900/40 to-accent-900/40 border-b border-slate-800 p-6">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Extração Concluída</h3>
                      <p className="text-sm text-slate-400">{uploadedFileName || 'Invoice processada'}</p>
                    </div>
                  </div>
                </div>

                {/* Métricas principais */}
                <div className="p-6 space-y-6">
                  {/* Grid de métricas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 rounded-xl p-4 text-center border border-slate-800">
                      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Setor</div>
                      <div className="text-lg font-bold text-white">{extractionSummary.sector}</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 text-center border border-slate-800">
                      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Itens</div>
                      <div className="text-lg font-bold text-white">{extractionSummary.totalItems}</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 text-center border border-slate-800">
                      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Origem</div>
                      <div className="text-lg font-bold text-white">{extractionSummary.country}</div>
                    </div>
                  </div>

                  {/* Valor total e confiança */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary-900/30 to-primary-950/30 rounded-xl p-4 border border-primary-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-primary-400" />
                        <span className="text-xs text-primary-400 uppercase tracking-wider">Valor Total</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {extractionSummary.currency} {extractionSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 rounded-xl p-4 border border-green-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400 uppercase tracking-wider">NCM Confiança</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {extractionSummary.ncmConfidence.alta > 0 && (
                          <span className="bg-green-500/20 text-green-400 text-sm font-bold px-2 py-1 rounded">
                            {extractionSummary.ncmConfidence.alta} ALTA
                          </span>
                        )}
                        {extractionSummary.ncmConfidence.media > 0 && (
                          <span className="bg-yellow-500/20 text-yellow-400 text-sm font-bold px-2 py-1 rounded">
                            {extractionSummary.ncmConfidence.media} MÉD
                          </span>
                        )}
                        {extractionSummary.ncmConfidence.baixa > 0 && (
                          <span className="bg-red-500/20 text-red-400 text-sm font-bold px-2 py-1 rounded">
                            {extractionSummary.ncmConfidence.baixa} BAIXA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tempo economizado */}
                  <div className="bg-gradient-to-r from-accent-900/20 to-primary-900/20 rounded-xl p-4 border border-accent-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-accent-400" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Processado em {(extractionSummary.processingTimeMs / 1000).toFixed(1)}s</div>
                          <div className="text-lg font-bold text-accent-400">Você economizou ~{timeStats.saved} minutos</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insight da IA */}
                  {aiFeedback && (
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-accent-400" />
                        </div>
                        <div>
                          <div className="text-xs text-accent-400 font-semibold mb-1">Insight do Copiloto</div>
                          <p className="text-sm text-slate-300 leading-relaxed">{aiFeedback}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setWorkflowStep('form')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FileSearch className="w-4 h-4" />
                      Revisar Detalhes
                    </button>
                    <button
                      onClick={() => {
                        setWorkflowStep('form');
                        // Auto-scroll to simulation button after a short delay
                        setTimeout(() => {
                          const simBtn = document.querySelector('[data-simulation-btn]');
                          if (simBtn) simBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-900/30"
                    >
                      Prosseguir
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* === STEP 3: FORM (Layout Single-Column Limpo) === */}
          {workflowStep === 'form' && (
          <div className="max-w-2xl mx-auto">
            {/* Métricas de Produtividade - Compacto */}
            <div className="bg-gradient-to-r from-primary-900/30 to-accent-900/30 border border-primary-800/30 rounded-xl p-4 mb-8">
              <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{selectedInvoice ? SAMPLE_INVOICES[selectedInvoice as keyof typeof SAMPLE_INVOICES].processingTime : Math.max(1, Math.min(999, Math.round((extractionSummary?.processingTimeMs || 8000) / 1000)))} s</div>
                  <div className="text-xs text-slate-400">Com copiloto</div>
                </div>
                <div className="text-slate-600 text-sm">vs</div>
                <div>
                  <div className="text-xl font-bold text-slate-500 line-through">25 min</div>
                  <div className="text-xs text-slate-500">Manual</div>
                </div>
                <div className="bg-green-500/10 px-3 py-1.5 rounded-lg">
                  <div className="text-xl font-bold text-green-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> {timeStats.saved} min
                  </div>
                  <div className="text-xs text-green-400/70">economizados</div>
                </div>
              </div>
            </div>

            {/* Painel-resumo compacto */}
            {(results || incotermInfo || apiValidation) && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">Risco geral</div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent-400" />
                      {apiValidation?.risco_geral || 'N/D'}
                    </div>
                    <div className="text-[11px] text-slate-500">Erros: {apiValidation?.erros?.length || 0}</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">Incoterm</div>
                    <div className="text-lg font-bold text-white">{incotermInfo?.code || duimpFields.incoterm || 'N/D'}</div>
                    <div className="text-[11px] text-slate-500 truncate">{incotermInfo?.location || 'Local não informado'}</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">NCMs</div>
                    <div className="text-lg font-bold text-white flex gap-2">
                      <span className="text-green-400">{extractionSummary?.ncmConfidence.alta || 0}↑</span>
                      <span className="text-yellow-400">{extractionSummary?.ncmConfidence.media || 0}≈</span>
                      <span className="text-red-400">{extractionSummary?.ncmConfidence.baixa || 0}↓</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Itens: {items.length}</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">Tempo</div>
                    <div className="text-lg font-bold text-accent-400">{timeStats.saved} min</div>
                    <div className="text-[11px] text-slate-500">Economizados</div>
                  </div>
                </div>
              </div>
            )}

          {/* === FEEDBACK DA IA === */}
          {aiFeedback && (
            <div className="bg-gradient-to-r from-accent-900/20 to-primary-900/20 border border-accent-700/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-accent-500/20 p-2 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-accent-400 mb-1">💡 Feedback da IA</div>
                  <p className="text-white/90 text-sm leading-relaxed">{aiFeedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* === ALERTA DE SUBFATURAMENTO === */}
          {alertaSubfaturamento && (
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/20 p-2 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-400 mb-1">Alerta de Subfaturamento</div>
                  <p className="text-white/90 text-sm leading-relaxed">{alertaSubfaturamento}</p>
                </div>
              </div>
            </div>
          )}

          {/* === INCOTERM & PORTO === */}
          {(incotermInfo || duimpFields.incoterm) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-accent-400" />
                  <h3 className="text-sm font-semibold text-white">Incoterm & Porto</h3>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    incotermInfo?.validated === false
                      ? 'text-amber-300 border-amber-500/50 bg-amber-500/10'
                      : 'text-green-300 border-green-500/40 bg-green-500/10'
                  }`}
                >
                  {incotermInfo?.validated === false ? 'Atenção' : 'Validado'}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-primary-300 bg-primary-500/10 border border-primary-500/30 px-2 py-1 rounded">
                    {incotermInfo?.code || duimpFields.incoterm || 'N/A'}
                  </span>
                  {incotermInfo?.location && (
                    <span className="text-slate-300">
                      {incotermInfo.location} {incotermInfo.country_code ? `(${incotermInfo.country_code})` : ''}
                    </span>
                  )}
                  {!incotermInfo?.location && duimpFields.incoterm && (
                    <span className="text-slate-400">Local não especificado</span>
                  )}
                </div>
                {incotermInfo?.validation_message && (
                  <div className="text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{incotermInfo.validation_message}</span>
                  </div>
                )}
                {incotermInfo?.suggestions && incotermInfo.suggestions.length > 0 && (
                  <div className="text-xs text-slate-400">
                    Sugestões de portos: <span className="text-slate-200">{incotermInfo.suggestions.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === ESTIMATIVA DE IMPOSTOS === */}
          {impostosEstimados && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Estimativa de Impostos</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">II (Imposto de Importação)</div>
                  <div className="text-lg font-bold text-white">
                    R$ {impostosEstimados.ii.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">IPI</div>
                  <div className="text-lg font-bold text-white">
                    R$ {impostosEstimados.ipi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">PIS/COFINS (11,65%)</div>
                  <div className="text-lg font-bold text-white">
                    R$ {impostosEstimados.pis_cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-primary-900/30 border border-primary-700/30 rounded-lg p-3">
                  <div className="text-xs text-primary-400 mb-1">Total Estimado</div>
                  <div className="text-lg font-bold text-primary-400">
                    R$ {impostosEstimados.total_impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-center">
                Base de cálculo: R$ {impostosEstimados.base_calculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          {/* === DESCRIÇÃO PARA DI === */}
          {descricaoDI && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-400" />
                  <h3 className="text-sm font-semibold text-white">Descrição para DI</h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(descricaoDI);
                  }}
                  className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 bg-accent-500/10 hover:bg-accent-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar
                </button>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{descricaoDI}</p>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Texto formatado para Portal Único - pronto para colar na DI
              </div>
            </div>
          )}

          {/* === VALIDAÇÃO API - Colapsável === */}
          {apiValidation && (
            <div className="mb-6">
              {/* Badge de Risco - Clicável para expandir */}
              <button
                onClick={() => setErrorsExpanded(!errorsExpanded)}
                className={`w-full border rounded-xl p-4 transition-all ${
                  apiValidation.risco_geral === 'CRITICO' ? 'bg-red-900/20 border-red-800/50 hover:border-red-700' :
                  apiValidation.risco_geral === 'ALTO' ? 'bg-orange-900/20 border-orange-800/50 hover:border-orange-700' :
                  apiValidation.risco_geral === 'MEDIO' ? 'bg-yellow-900/20 border-yellow-800/50 hover:border-yellow-700' :
                  'bg-green-900/20 border-green-800/50 hover:border-green-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      apiValidation.risco_geral === 'CRITICO' ? 'bg-red-600' :
                      apiValidation.risco_geral === 'ALTO' ? 'bg-orange-600' :
                      apiValidation.risco_geral === 'MEDIO' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                      {apiValidation.risco_geral === 'CRITICO' || apiValidation.risco_geral === 'ALTO' ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                      ) : apiValidation.risco_geral === 'MEDIO' ? (
                        <AlertCircle className="w-5 h-5 text-white" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white">
                        Risco {apiValidation.risco_geral || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {apiValidation.erros?.length || 0} erros • R$ {(apiValidation.custos?.custoTotal || 0).toLocaleString('pt-BR')} em risco
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${errorsExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Detalhes Expandidos */}
              <AnimatePresence>
                {errorsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-3">
                      {/* Seção Educativa: Como Calculamos */}
                      <div>
                        <button
                          onClick={() => setShowCalculationExplainer(!showCalculationExplainer)}
                          className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                        >
                          <span className="text-sm text-slate-400">
                            💡 Como calculamos a economia de custos?
                          </span>
                          {showCalculationExplainer ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {showCalculationExplainer && (
                          <div className="mt-2 p-4 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 space-y-3">
                            <p>
                              Nosso sistema calcula a <strong className="text-white">economia real</strong> que você obtém ao identificar e corrigir erros <em>antes</em> de enviar a documentação para a alfândega.
                            </p>

                            <div className="space-y-2">
                              <h5 className="text-white font-semibold">Para cada erro encontrado:</h5>
                              <ol className="list-decimal list-inside space-y-1 text-xs">
                                <li>Custo base do erro (ex: NCM errado = R$ 500)</li>
                                <li>+ Percentual sobre valor da mercadoria (ex: 2%)</li>
                                <li>× Multiplicador por setor (químico = 1.5x, alimentos = 1.2x)</li>
                                <li>+ Demurrage (dias de atraso × R$ 1.500/dia)</li>
                              </ol>
                            </div>

                            <div className="border-t border-slate-800 pt-3">
                              <h5 className="text-white font-semibold mb-2">Exemplo Real:</h5>
                              <div className="bg-slate-950 p-3 rounded text-xs space-y-1">
                                <div>Erro: NCM incorreto em mercadoria de R$ 10.000</div>
                                <div>• Base: R$ 500</div>
                                <div>• + 2% do valor: R$ 200</div>
                                <div>• Subtotal: R$ 700</div>
                                <div>• × Setor químico (1.5x): R$ 1.050</div>
                                <div>• + Demurrage (5 dias × R$ 1.500): R$ 7.500</div>
                                <div className="text-red-400 font-bold pt-1 border-t border-slate-800">
                                  = Total: R$ 8.550 evitados
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500">
                              Todos os valores são baseados em tabelas oficiais da Receita Federal e práticas de mercado documentadas.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Lista de Erros */}
                      {apiValidation.erros && apiValidation.erros.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Erros ({apiValidation.erros.length})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {apiValidation.erros.map((erro: any, idx: number) => (
                              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm text-white font-medium">{erro.campo}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{erro.explicacao}</div>
                                  </div>
                                  {erro.custo_estimado && (
                                    <span className="text-sm font-bold text-red-400">
                                      R$ {Number(erro.custo_estimado).toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Impacto Financeiro Resumido */}
                      {apiValidation.custos && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-slate-300">Impacto Financeiro</h4>
                            <CostBreakdownTooltip custo={apiValidation.custos} />
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Custo Total Potencial</span>
                            <span className="text-lg font-bold text-red-400">
                              R$ {(apiValidation.custos.custoTotal || 0).toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Multas e Penalidades</span>
                              <span className="text-red-400">
                                R$ {(apiValidation.custos.custoMultas || 0).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Demurrage (Sobrestadia)</span>
                              <span className="text-orange-400">
                                R$ {(apiValidation.custos.custoDemurrage || 0).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600">
                                {apiValidation.custos.diasAtrasoEstimado || 0} dias × R$ 1.500/dia
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DUIMP Export Section */}
                      {currentOperationId && (
                        <DuimpExportSection
                          operationId={currentOperationId}
                          dadosExtraidos={extractedData}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Formulário Single-Column - CLEAN */}
          <div className="space-y-4">
              {/* Bloco 1: Dados Essenciais (País + Setor) */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs uppercase text-slate-500 tracking-wide">Dados essenciais</div>
                    <div className="text-[11px] text-accent-400">Preenchido automaticamente pela IA</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditEssentials(!editEssentials)}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700 transition-colors"
                  >
                    <Pen className="w-3.5 h-3.5" /> {editEssentials ? 'Fechar' : 'Editar'}
                  </button>
                </div>

                {!editEssentials && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2">
                      <div className="text-[11px] text-slate-500">País de Procedência</div>
                      <div className="text-sm font-semibold text-white">{operationData.country || 'N/D'}</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2">
                      <div className="text-[11px] text-slate-500">Setor do Produto</div>
                      <div className="text-sm font-semibold text-white">{operationData.sector || 'N/D'}</div>
                    </div>
                  </div>
                )}

                {editEssentials && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">País de Procedência</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        value={operationData.country}
                        onChange={(e) => setOperationData({...operationData, country: e.target.value})}
                      >
                        {PAISES_IMPORTADORES.map(pais => (
                          <option key={pais} value={pais}>{pais}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Setor do Produto</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        value={operationData.sector}
                        onChange={(e) => setOperationData({...operationData, sector: e.target.value})}
                      >
                        <option>Outros</option>
                        <option>Eletronicos</option>
                        <option>Químico</option>
                        <option>Cosméticos</option>
                        <option>Alimentos/Bebidas</option>
                        <option>Autopeças</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Campos Avançados - Colapsável */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 py-2 border-t border-slate-800 mt-3 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    Configurações avançadas
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFields ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAdvancedFields && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Tipo de Operação</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            value={operationData.type}
                            onChange={(e) => setOperationData({...operationData, type: e.target.value})}
                          >
                            <option>Importação Própria</option>
                            <option>Conta e Ordem</option>
                            <option>Encomenda</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">URF de Despacho</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            value={operationData.urf}
                            onChange={(e) => setOperationData({...operationData, urf: e.target.value})}
                          >
                            <option>Santos (SP)</option>
                            <option>Rio de Janeiro (RJ)</option>
                            <option>Itajaí (SC)</option>
                            <option>Paranaguá (PR)</option>
                            <option>Aeroporto Guarulhos (SP)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Modalidade</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            value={operationData.modality}
                            onChange={(e) => setOperationData({...operationData, modality: e.target.value})}
                          >
                            <option>Normal</option>
                            <option>Admissão Temporária</option>
                            <option>Drawback</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bloco 2: Itens e NCM */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="bg-primary-600 text-xs rounded px-2 py-0.5">2</span> Itens e NCM
                  </h3>
                  <button onClick={addItem} className="text-xs flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50" disabled={items.length >= 3}>
                    <Plus className="w-3 h-3" /> Adicionar Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(showAllItems ? items : items.slice(0, 2)).map((item, index) => (
                    <div key={item.id} className="relative bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      {/* Layout Clean - Descrição + NCM com badge */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium truncate">{item.desc || 'Item sem descrição'}</div>
                          {item.ncmDescricao && (
                            <div className="text-xs text-slate-500 mt-0.5 truncate">{item.ncmDescricao}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">NCM</span>
                            <input
                              maxLength={8}
                              className="w-24 bg-slate-900 border border-slate-700 text-slate-200 text-sm font-mono rounded px-2 py-1 focus:border-primary-500 outline-none"
                              value={item.ncm}
                              onChange={(e) => handleItemChange(item.id, 'ncm', e.target.value)}
                            />
                          </div>
                          {item.ncm && item.ncmConfianca && (
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                item.ncmConfianca === 'ALTA' ? 'bg-green-500' :
                                item.ncmConfianca === 'MEDIA' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              title={`Confiança ${item.ncmConfianca}`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Linha de valores - mais compacta */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Valor:</span>
                          <span className="text-white font-medium">USD {parseFloat(item.value || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Peso:</span>
                          <span className="text-white">{item.weight || '0'} kg</span>
                        </div>
                        {item.quantity && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Qtd:</span>
                            <span className="text-white">{item.quantity}</span>
                          </div>
                        )}
                      </div>

                      {/* Campos editáveis para DUIMP */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Peso bruto (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            value={item.weight}
                            onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Valor total (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            value={item.value}
                            onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Quantidade (ex: 100 UN)</label>
                          <input
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Valor unitário (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">País de origem</label>
                          <input
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            value={item.origin}
                            onChange={(e) => handleItemChange(item.id, 'origin', e.target.value)}
                          />
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute -top-2 -right-2 bg-slate-800 text-slate-400 p-1 rounded-full hover:bg-red-900/50 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Botão Ver Mais/Menos */}
                  {items.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setShowAllItems(!showAllItems)}
                      className="w-full py-2 text-xs text-slate-400 hover:text-slate-300 border border-dashed border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      {showAllItems ? (
                        <>Mostrar menos</>
                      ) : (
                        <>+ Ver mais {items.length - 2} {items.length - 2 === 1 ? 'item' : 'itens'}</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Bloco 2.5: Dados obrigatórios para DUIMP */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="bg-accent-500 text-xs rounded px-2 py-0.5">2.5</span> Dados para DUIMP
                  </h3>
                  <span className="text-[11px] text-slate-500">Preencha para habilitar o XML</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">CNPJ do Importador</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="00.000.000/0000-00"
                      value={duimpFields.cnpj}
                      onChange={(e) => setDuimpFields({ ...duimpFields, cnpj: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Razão Social do Importador</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Empresa Importadora LTDA"
                      value={duimpFields.nome}
                      onChange={(e) => setDuimpFields({ ...duimpFields, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">UF do Importador</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="SP"
                      value={duimpFields.uf}
                      onChange={(e) => setDuimpFields({ ...duimpFields, uf: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Código URF</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: 0817600 (Santos/SP)"
                      value={duimpFields.codigoURF}
                      onChange={(e) => setDuimpFields({ ...duimpFields, codigoURF: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Via de Transporte</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      value={duimpFields.viaTransporte}
                      onChange={(e) => setDuimpFields({ ...duimpFields, viaTransporte: e.target.value })}
                    >
                      <option value="MARITIMO">Marítimo</option>
                      <option value="AEREO">Aéreo</option>
                      <option value="RODOVIARIO">Rodoviário</option>
                      <option value="FERROVIARIO">Ferroviário</option>
                      <option value="COURIER">Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tipo de Declaração</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      value={duimpFields.tipoDeclaracao}
                      onChange={(e) => setDuimpFields({ ...duimpFields, tipoDeclaracao: e.target.value })}
                    >
                      <option value="CONSUMO">Consumo</option>
                      <option value="ADMISSAO_TEMPORARIA">Admissão temporária</option>
                      <option value="ENTREPOSTO">Entreposto</option>
                      <option value="REIMPORTACAO">Reimportação</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Data de Embarque</label>
                    <input
                      type="date"
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                      value={duimpFields.dataEmbarque}
                      onChange={(e) => setDuimpFields({ ...duimpFields, dataEmbarque: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Incoterm</label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="FOB"
                        value={duimpFields.incoterm}
                        onChange={(e) => setDuimpFields({ ...duimpFields, incoterm: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Moeda</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        value={duimpFields.moeda}
                        onChange={(e) => setDuimpFields({ ...duimpFields, moeda: e.target.value })}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="BRL">BRL</option>
                        <option value="CNY">CNY</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Dica: o peso bruto e valores por item são editáveis nos cartões de itens acima.
                </div>
              </div>

              {/* Bloco 3: Compliance & Action */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                 <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <span className="bg-primary-600 text-xs rounded px-2 py-0.5">3</span> Compliance (Simulação)
                 </h3>
                 
                 <div className="flex flex-col gap-4 mb-6">
                   {/* Dropdown Multi-Select para Anuentes */}
                   <div className="flex-1">
                      <span className="block text-xs text-slate-400 mb-2">Órgãos Anuentes Necessários</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setAnuentsDropdownOpen(!anuentsDropdownOpen)}
                          className="w-full bg-slate-950 border border-slate-700 text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 flex items-center justify-between hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className={selectedAnuentes.length === 0 ? 'text-slate-500' : 'text-slate-300'}>
                              {selectedAnuentes.length === 0
                                ? 'Selecione os anuentes...'
                                : `${selectedAnuentes.length} órgão(s) selecionado(s)`}
                            </span>
                            {autoFilled && selectedAnuentes.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-500/20 rounded-full">
                                <Sparkles className="w-3 h-3 text-accent-400" />
                                <span className="text-xs text-accent-400">Auto</span>
                              </div>
                            )}
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${anuentsDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {anuentsDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                            <div className="p-2 border-b border-slate-700">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAnuentes([]);
                                  setAutoFilled(false);
                                }}
                                className="text-xs text-slate-400 hover:text-slate-300"
                              >
                                Limpar seleção
                              </button>
                            </div>
                            <div className="p-1">
                              {LISTA_ANUENTES.map(anuente => (
                                <label
                                  key={anuente}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedAnuentes.includes(anuente)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedAnuentes([...selectedAnuentes, anuente]);
                                      } else {
                                        setSelectedAnuentes(selectedAnuentes.filter(a => a !== anuente));
                                      }
                                      setAutoFilled(false); // Marca como modificado manualmente
                                    }}
                                    className="rounded bg-slate-900 border-slate-600 text-primary-600 focus:ring-primary-600 focus:ring-offset-slate-900"
                                  />
                                  <span className="text-sm text-slate-300">{anuente}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tags dos anuentes selecionados */}
                      {selectedAnuentes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedAnuentes.map(anuente => (
                            <span
                              key={anuente}
                              className="inline-flex items-center gap-1 bg-primary-600/20 text-primary-400 text-xs px-2 py-1 rounded-full border border-primary-600/30"
                            >
                              {anuente}
                              <button
                                type="button"
                                onClick={() => setSelectedAnuentes(selectedAnuentes.filter(a => a !== anuente))}
                                className="hover:text-primary-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                   </div>

                   {/* LPCO */}
                   <div className="flex-1">
                      <span className="block text-xs text-slate-400 mb-2">LPCO já solicitado?</span>
                      <div className="flex items-center gap-4">
                         <button
                           type="button"
                           onClick={() => setLpcoRequested(true)}
                           className={`flex-1 py-2 px-3 rounded text-sm font-medium border transition-colors ${lpcoRequested ? 'bg-primary-600/20 border-primary-600 text-primary-400' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                         >
                           Sim
                         </button>
                         <button
                           type="button"
                           onClick={() => setLpcoRequested(false)}
                           className={`flex-1 py-2 px-3 rounded text-sm font-medium border transition-colors ${!lpcoRequested ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                         >
                           Não
                         </button>
                      </div>
                   </div>
                 </div>

                 <button
                   data-simulation-btn
                   onClick={handleSimulationClick}
                   disabled={calculating}
                   className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary-900/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {calculating ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processando...
                     </>
                   ) : (
                     <>
                      <Calculator className="w-5 h-5" /> Rodar Validação Simulada
                     </>
                   )}
                 </button>
              </div>
          </div>

          {/* Resultados da Simulação - Compacto */}
          {results && (
            <div className="mt-8 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" /> Resultado da Simulação
                  </h4>
                  <button
                    onClick={() => {
                      if (results && results.risks) setShowReport(true);
                    }}
                    disabled={!results || !results.risks}
                    className={`text-xs underline underline-offset-2 ${
                      results && results.risks
                        ? 'text-primary-400 hover:text-primary-300'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Ver detalhes completos
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Riscos detectados</div>
                    <div className="text-lg font-bold text-orange-400">{results.risks.length}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Itens com atenção imediata</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Impacto estimado</div>
                    <div className="text-lg font-bold text-red-400">{results.totalImpact}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Potencial de multas/demurrage</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Economia prevista</div>
                    <div className="text-lg font-bold text-green-400">{results.avoided}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Ao corrigir agora</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Próximos passos recomendados
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase mb-1">Prioridade 1</p>
                    <p className="text-sm text-white">{results.risks[0] || 'Sem alertas críticos'}</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase mb-1">Prioridade 2</p>
                    <p className="text-sm text-white">{results.risks[1] || 'Validação de anuentes em andamento'}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">Finalize ajustes e exporte o XML quando estiver tudo verde.</div>
              </div>
            </div>
          )}

          {/* Botão Gerar Documento */}
          {results && (
            <div className="mt-6">
              <button
                onClick={generateDocument}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-green-900/30 flex items-center justify-center gap-2"
              >
                <FileCheck className="w-5 h-5" /> Gerar Documento Pronto
              </button>
            </div>
          )}
          </div>
          )}

          {/* === STEP 4: DOCUMENT (Layout Limpo) === */}
          {workflowStep === 'document' && (
            <div className="max-w-2xl mx-auto">
              {/* Métricas de Produtividade - Compacto */}
              <div className="bg-gradient-to-r from-green-900/30 to-accent-900/30 border border-green-800/30 rounded-xl p-4 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{selectedInvoice ? SAMPLE_INVOICES[selectedInvoice as keyof typeof SAMPLE_INVOICES].processingTime : 8} min</div>
                    <div className="text-xs text-slate-400">Com copiloto</div>
                  </div>
                  <div className="text-slate-600 text-sm">vs</div>
                  <div>
                    <div className="text-xl font-bold text-slate-500 line-through">25 min</div>
                    <div className="text-xs text-slate-500">Manual</div>
                  </div>
                  <div className="bg-green-500/10 px-3 py-1.5 rounded-lg">
                    <div className="text-xl font-bold text-green-400 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> {timeStats.saved} min
                    </div>
                    <div className="text-xs text-green-400/70">economizados</div>
                  </div>
                </div>
              </div>

              {/* Card Principal - Documento Pronto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-green-800/50 rounded-xl p-6"
              >
                {/* Checklist de Validação */}
                <div className="bg-slate-950 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Checklist de Validação
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">NCMs validados</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">Valores conferidos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">País de origem OK</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {selectedAnuentes.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-slate-300">Anuências OK</span>
                    </div>
                  </div>
                </div>

                {/* Resumo da Operação */}
                <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                  <div className="bg-slate-950 rounded-lg p-3">
                    <div className="text-slate-500 text-xs mb-1">Tipo</div>
                    <div className="text-white font-medium text-xs">{operationData.type}</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3">
                    <div className="text-slate-500 text-xs mb-1">URF</div>
                    <div className="text-white font-medium text-xs">{operationData.urf}</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3">
                    <div className="text-slate-500 text-xs mb-1">País</div>
                    <div className="text-white font-medium text-xs">{operationData.country}</div>
                  </div>
                </div>

                {/* Itens - Compacto */}
                <div className="bg-slate-950 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Itens ({items.length})</h4>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-white">{item.desc || 'Item ' + (idx + 1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">NCM: {item.ncm || 'N/A'}</span>
                          {item.ncm && item.ncmConfianca && (
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                item.ncmConfianca === 'ALTA' ? 'bg-green-500' :
                                item.ncmConfianca === 'MEDIA' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              title={`Confiança ${item.ncmConfianca}`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-2">
                  <button
                    onClick={handleCopyAll}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copiar Tudo
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyFields}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Copy className="w-4 h-4" /> Copiar Campos
                    </button>
                    <button
                      onClick={handleExportDUIMP}
                      className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Exportar PDF
                    </button>
                  </div>
                </div>

                {/* Botão Preview Portal Único */}
                {results && (
                  <button
                    onClick={() => setShowFichaModal(true)}
                    className="w-full mt-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors border border-slate-800"
                  >
                    <FileText className="w-4 h-4" /> Ver preview Portal Único
                  </button>
                )}

                {/* Botão Exportar XML Siscomex */}
                {currentOperationId && (
                  <button
                    onClick={handleExportSiscomexXml}
                    className="w-full mt-3 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Exportar XML Siscomex
                  </button>
                )}
              </motion.div>

              {/* Mensagem de Sucesso */}
              <div className="mt-6 bg-green-500/10 border border-green-800/30 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-green-400 font-bold text-lg">
                  Documento pronto!
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Você economizou <span className="text-green-400 font-medium">{timeStats.saved} minutos</span> nesta operação.
                </p>
              </div>
            </div>
          )}

          {/* Modal da Ficha Portal Único */}
          <AnimatePresence>
            {showFichaModal && results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowFichaModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Preview Portal Único</h3>
                    <button
                      onClick={() => setShowFichaModal(false)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-4">
                    <FichaProdutoSimulada
                      operation={operationData}
                      items={items}
                      inadimplencia={results.inadimplencia}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
      <Footer />
    </div>
  );
};


export { PlatformSimulationPage };
export { ReportModal };
