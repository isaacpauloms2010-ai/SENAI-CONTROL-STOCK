import fs from 'node:fs';
import path from 'node:path';
import { AppDatabase, Product, RawMaterial, Supplier, Customer, Workcenter, SalesOrder, ProductionOrder, User } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const INITIAL_SEED: AppDatabase = {
  company: {
    name: "Metalúrgica & Manufatura Progresso Ltda.",
    cnpj: "14.285.932/0001-44",
    address: "Av. das Indústrias, 1250 - Distrito Fabril, Joinville - SC",
    phone: "(47) 3456-7890",
    email: "pcp@manufacprogresso.com.br"
  },
  users: [
    {
      id: "usr-1",
      name: "Eng. Isaac Paulo",
      email: "isaacpauloms2010@gmail.com",
      role: "Responsável Técnico PCP",
      crea: "CREA/SC 284.910-D",
      active: true
    },
    {
      id: "usr-2",
      name: "Mariana Costa",
      email: "mariana.costa@manufacprogresso.com.br",
      role: "Supervisora de Planejamento",
      crea: "CREA/SC 194.220-F",
      active: true
    },
    {
      id: "usr-3",
      name: "Carlos Eduardo Santos",
      email: "carlos.santos@manufacprogresso.com.br",
      role: "Engenheiro de Processos",
      crea: "CREA/SC 305.112-A",
      active: true
    }
  ],
  suppliers: [
    {
      id: "sup-1",
      code: "FORN-001",
      name: "AçoBrasil Laminação & Tubos S.A.",
      contact: "Roberto Mendes",
      email: "vendas@acobrasil.ind.br",
      phone: "(11) 4002-8922",
      address: "Rodovia Anhanguera, km 105 - Campinas - SP",
      cnpj: "45.123.789/0001-12",
      suppliedProducts: "Tubos de aço carbono, barras laminadas, chapas",
      leadTimeDays: 7
    },
    {
      id: "sup-2",
      code: "FORN-002",
      name: "União Fixadores & Parafusos Industriais",
      contact: "Fernanda Lima",
      email: "comercial@uniaofixadores.com.br",
      phone: "(41) 3322-1100",
      address: "Rua das Porcas, 450 - Curitiba - PR",
      cnpj: "18.654.321/0001-99",
      suppliedProducts: "Parafusos sextavados, arruelas, porcas travantes e rebites",
      leadTimeDays: 3
    },
    {
      id: "sup-3",
      code: "FORN-003",
      name: "Tintas & Revestimentos Alfa Quim",
      contact: "Julio Cesar",
      email: "pedidos@alfaquim.com.br",
      phone: "(19) 3881-9000",
      address: "Av. dos Químicos, 90 - Paulínia - SP",
      cnpj: "29.987.654/0001-33",
      suppliedProducts: "Tinta a pó epóxi-poliéster, primer fosfatizante",
      leadTimeDays: 5
    },
    {
      id: "sup-4",
      code: "FORN-004",
      name: "Rodízios & Componentes Taurus",
      contact: "Marcio Rezende",
      email: "vendas@taurusrodizios.com.br",
      phone: "(54) 3218-5000",
      address: "Rua do Progresso, 800 - Caxias do Sul - RS",
      cnpj: "31.222.444/0001-78",
      suppliedProducts: "Rodízios industriais giratórios em poliuretano e travas",
      leadTimeDays: 4
    }
  ],
  customers: [
    {
      id: "cli-1",
      code: "CLI-001",
      name: "Logística Express & Armazéns Gerais",
      contact: "Lucas Albuquerque",
      email: "compras@logisticaexpress.com.br",
      phone: "(11) 98765-4321",
      address: "Av. Marginal Direita, 4200 - São Paulo - SP",
      cnpjCpf: "07.654.321/0001-50"
    },
    {
      id: "cli-2",
      code: "CLI-002",
      name: "Mecânica e Usinagem Fronteira",
      contact: "Valdir Pereira",
      email: "valdir@mecanicafronteira.ind.br",
      phone: "(47) 99123-8877",
      address: "Rua Santa Catarina, 310 - Joinville - SC",
      cnpjCpf: "12.333.444/0001-19"
    },
    {
      id: "cli-3",
      code: "CLI-003",
      name: "Rede Atacadista SuperMix S/A",
      contact: "Beatriz Nogueira",
      email: "patrimonio@supermix.com.br",
      phone: "(31) 3290-7766",
      address: "Rodovia Fernão Dias, km 480 - Betim - MG",
      cnpjCpf: "20.111.999/0001-88"
    },
    {
      id: "cli-4",
      code: "CLI-004",
      name: "Construtora Aliança Engenharia",
      contact: "Eng. Paulo Motta",
      email: "suprimentos@aliancaeng.com.br",
      phone: "(48) 3224-9988",
      address: "Av. Beira Mar Norte, 1500 - Florianópolis - SC",
      cnpjCpf: "03.444.777/0001-02"
    }
  ],
  rawMaterials: [
    {
      id: "mp-1",
      code: "MP-101",
      name: "Tubo Aço Quadrado 50x50mm x 2.0mm",
      unit: "m",
      stock: 320,
      minStock: 100,
      costPrice: 28.50,
      supplierId: "sup-1",
      location: "Rua A - Prateleira 01"
    },
    {
      id: "mp-2",
      code: "MP-102",
      name: "Chapa Aço Carbono #14 (1.9mm)",
      unit: "m²",
      stock: 85,
      minStock: 30,
      costPrice: 65.00,
      supplierId: "sup-1",
      location: "Rua A - Prateleira 04"
    },
    {
      id: "mp-3",
      code: "MP-103",
      name: "Cantoneira Laminada 1.1/2\" x 1/8\"",
      unit: "m",
      stock: 140,
      minStock: 60,
      costPrice: 19.80,
      supplierId: "sup-1",
      location: "Rua B - Rack 02"
    },
    {
      id: "mp-4",
      code: "MP-104",
      name: "Parafuso Sextavado M8 x 45mm c/ Porca",
      unit: "un",
      stock: 1500,
      minStock: 500,
      costPrice: 0.95,
      supplierId: "sup-2",
      location: "Caixa 12 - Prateleira 05"
    },
    {
      id: "mp-5",
      code: "MP-105",
      name: "Tinta Pó Epóxi Eletrostática Preto Fosco",
      unit: "kg",
      stock: 45,
      minStock: 25,
      costPrice: 38.00,
      supplierId: "sup-3",
      location: "Cabine de Pintura - Depósito"
    },
    {
      id: "mp-6",
      code: "MP-106",
      name: "Rodízio Giratório Industrial 4\" com Freio",
      unit: "un",
      stock: 64,
      minStock: 40,
      costPrice: 42.00,
      supplierId: "sup-4",
      location: "Rua C - Prateleira 03"
    },
    {
      id: "mp-7",
      code: "MP-107",
      name: "Ponteira Plástica 50x50mm Interna",
      unit: "un",
      stock: 400,
      minStock: 200,
      costPrice: 1.20,
      supplierId: "sup-2",
      location: "Caixa 08 - Almoxarifado"
    }
  ],
  products: [
    {
      id: "prod-1",
      code: "PRD-001",
      name: "Mesa Industrial para Solda e Montagem 1.80x0.90m",
      description: "Mesa pesada com tampo reforçado em chapa 14 e estrutura em tubo 50x50mm para suporte de até 800 kg.",
      unit: "un",
      processHours: 4.5,
      salePrice: 1480.00,
      category: "Bancadas & Mesas",
      stock: 4,
      minStock: 2,
      workstations: ["Corte & Dobra CNC", "Solda MIG/TIG", "Pintura Eletrostática", "Montagem & Embalagem"],
      bom: [
        { rawMaterialId: "mp-1", quantity: 12.0, notes: "Estrutura pernas e requadro" },
        { rawMaterialId: "mp-2", quantity: 1.62, notes: "Tampo superior conformado" },
        { rawMaterialId: "mp-4", quantity: 16, notes: "Fixação e travamentos" },
        { rawMaterialId: "mp-5", quantity: 1.2, notes: "Pintura eletrostática preto" },
        { rawMaterialId: "mp-7", quantity: 4, notes: "Pés niveladores" }
      ]
    },
    {
      id: "prod-2",
      code: "PRD-002",
      name: "Estante Modular Reforçada 5 Prateleiras 2.0x1.0m",
      description: "Estante porta pallets leve para estoques e almoxarifados, capacidade de 200 kg por nível.",
      unit: "un",
      processHours: 3.2,
      salePrice: 920.00,
      category: "Armazenagem",
      stock: 8,
      minStock: 5,
      workstations: ["Corte & Dobra CNC", "Solda MIG/TIG", "Pintura Eletrostática", "Montagem & Embalagem"],
      bom: [
        { rawMaterialId: "mp-3", quantity: 18.0, notes: "Colunas e travessas" },
        { rawMaterialId: "mp-2", quantity: 2.5, notes: "5 bandejas em chapa" },
        { rawMaterialId: "mp-4", quantity: 40, notes: "Parafusos de montagem" },
        { rawMaterialId: "mp-5", quantity: 1.8, notes: "Pintura cinza/preto" },
        { rawMaterialId: "mp-7", quantity: 4, notes: "Sapatas plásticas" }
      ]
    },
    {
      id: "prod-3",
      code: "PRD-003",
      name: "Carrinho Industrial Plataforma com 4 Rodízios 500kg",
      description: "Carro para movimentação interna de peças e matérias-primas com grade frontal e 4 rodízios industriais.",
      unit: "un",
      processHours: 2.8,
      salePrice: 750.00,
      category: "Movimentação Interna",
      stock: 6,
      minStock: 3,
      workstations: ["Corte & Dobra CNC", "Solda MIG/TIG", "Pintura Eletrostática", "Montagem & Embalagem"],
      bom: [
        { rawMaterialId: "mp-1", quantity: 8.5, notes: "Chassi inferior e puxador" },
        { rawMaterialId: "mp-2", quantity: 1.1, notes: "Base de chapa" },
        { rawMaterialId: "mp-4", quantity: 16, notes: "Fixação dos rodízios" },
        { rawMaterialId: "mp-5", quantity: 0.9, notes: "Pintura eletrostática" },
        { rawMaterialId: "mp-6", quantity: 4, notes: "Kit de rodízios com freio" }
      ]
    },
    {
      id: "prod-4",
      code: "PRD-004",
      name: "Armário de Ferramentas com 2 Portas e Fechadura",
      description: "Armário industrial robusto para proteção e organização de ferramentas especiais na linha de produção.",
      unit: "un",
      processHours: 5.0,
      salePrice: 1650.00,
      category: "Armazenagem",
      stock: 2,
      minStock: 2,
      workstations: ["Corte & Dobra CNC", "Solda MIG/TIG", "Pintura Eletrostática", "Montagem & Embalagem"],
      bom: [
        { rawMaterialId: "mp-1", quantity: 6.0, notes: "Estrutura e requadro" },
        { rawMaterialId: "mp-2", quantity: 3.8, notes: "Laterais, portas e fundo" },
        { rawMaterialId: "mp-4", quantity: 24, notes: "Dobradiças e fixadores" },
        { rawMaterialId: "mp-5", quantity: 2.2, notes: "Pintura eletrostática azul/preto" }
      ]
    }
  ],
  workcenters: [
    {
      id: "wc-1",
      code: "POSTO-01",
      name: "Corte & Dobra CNC",
      machineCount: 2,
      dailyHoursPerMachine: 8,
      workDaysPerMonth: 22,
      efficiencyRate: 85,
      notes: "Guilhotina hidráulica 3m e Prensa dobradeira CNC 100 ton"
    },
    {
      id: "wc-2",
      code: "POSTO-02",
      name: "Solda MIG/TIG & Caldeiraria",
      machineCount: 3,
      dailyHoursPerMachine: 8,
      workDaysPerMonth: 22,
      efficiencyRate: 80,
      notes: "3 cabines de solda equipadas com exaustão e tochas refrigeradas"
    },
    {
      id: "wc-3",
      code: "POSTO-03",
      name: "Pintura Eletrostática a Pó & Cura",
      machineCount: 1,
      dailyHoursPerMachine: 8,
      workDaysPerMonth: 22,
      efficiencyRate: 90,
      notes: "Cabine contínua com estufa de cura 220°C a gás"
    },
    {
      id: "wc-4",
      code: "POSTO-04",
      name: "Montagem Final, Teste & Embalagem",
      machineCount: 2,
      dailyHoursPerMachine: 8,
      workDaysPerMonth: 22,
      efficiencyRate: 90,
      notes: "Bancadas com parafusadeiras pneumáticas e embaladora stretch"
    }
  ],
  orders: [
    {
      id: "ord-1",
      code: "PED-2026-001",
      customerId: "cli-1",
      customerName: "Logística Express & Armazéns Gerais",
      orderDate: "2026-10-01",
      deliveryDate: "2026-10-18",
      priority: "ALTA",
      status: "EM_PRODUCAO",
      items: [
        {
          productId: "prod-3",
          productCode: "PRD-003",
          productName: "Carrinho Industrial Plataforma com 4 Rodízios 500kg",
          quantity: 6,
          unitPrice: 750.00,
          processHoursPerUnit: 2.8
        }
      ],
      totalAmount: 4500.00,
      notes: "Entrega urgente para expansão do armazém 3",
      hasProductionOrder: true,
      productionOrderIds: ["op-1"]
    },
    {
      id: "ord-2",
      code: "PED-2026-002",
      customerId: "cli-3",
      customerName: "Rede Atacadista SuperMix S/A",
      orderDate: "2026-10-03",
      deliveryDate: "2026-10-25",
      priority: "MEDIA",
      status: "EM_PRODUCAO",
      items: [
        {
          productId: "prod-2",
          productCode: "PRD-002",
          productName: "Estante Modular Reforçada 5 Prateleiras 2.0x1.0m",
          quantity: 10,
          unitPrice: 920.00,
          processHoursPerUnit: 3.2
        }
      ],
      totalAmount: 9200.00,
      notes: "Itens embalados em filme stretch duplo para transporte rodoviário",
      hasProductionOrder: true,
      productionOrderIds: ["op-2"]
    },
    {
      id: "ord-3",
      code: "PED-2026-003",
      customerId: "cli-2",
      customerName: "Mecânica e Usinagem Fronteira",
      orderDate: "2026-10-06",
      deliveryDate: "2026-10-30",
      priority: "URGENTE",
      status: "PENDENTE",
      items: [
        {
          productId: "prod-1",
          productCode: "PRD-001",
          productName: "Mesa Industrial para Solda e Montagem 1.80x0.90m",
          quantity: 4,
          unitPrice: 1480.00,
          processHoursPerUnit: 4.5
        }
      ],
      totalAmount: 5920.00,
      notes: "Cliente aguardando aprovação do PCP para início",
      hasProductionOrder: false
    }
  ],
  productionOrders: [
    {
      id: "op-1",
      code: "OP-2026-001",
      salesOrderId: "ord-1",
      customerName: "Logística Express & Armazéns Gerais",
      productId: "prod-3",
      productCode: "PRD-003",
      productName: "Carrinho Industrial Plataforma com 4 Rodízios 500kg",
      quantity: 6,
      plannedStartDate: "2026-10-05",
      plannedEndDate: "2026-10-15",
      actualStartDate: "2026-10-06",
      status: "EM_ANDAMENTO",
      priority: "ALTA",
      totalProcessHours: 16.8, // 6 * 2.8h
      producedQuantity: 3,
      assignedWorkstation: "Solda MIG/TIG & Caldeiraria",
      technicalResponsible: "Eng. Isaac Paulo",
      materialsDeducted: true,
      stockCredited: false,
      notes: "3 unidades soldadas e enviadas para cabine de pintura.",
      bomRequirements: [
        {
          rawMaterialId: "mp-1",
          code: "MP-101",
          name: "Tubo Aço Quadrado 50x50mm x 2.0mm",
          requiredQuantity: 51.0,
          unit: "m",
          stockAvailable: 320,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-2",
          code: "MP-102",
          name: "Chapa Aço Carbono #14 (1.9mm)",
          requiredQuantity: 6.6,
          unit: "m²",
          stockAvailable: 85,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-4",
          code: "MP-104",
          name: "Parafuso Sextavado M8 x 45mm c/ Porca",
          requiredQuantity: 96,
          unit: "un",
          stockAvailable: 1500,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-5",
          code: "MP-105",
          name: "Tinta Pó Epóxi Eletrostática Preto Fosco",
          requiredQuantity: 5.4,
          unit: "kg",
          stockAvailable: 45,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-6",
          code: "MP-106",
          name: "Rodízio Giratório Industrial 4\" com Freio",
          requiredQuantity: 24,
          unit: "un",
          stockAvailable: 64,
          status: "SUFICIENTE"
        }
      ],
      history: [
        {
          date: "2026-10-05 08:30",
          responsible: "Eng. Isaac Paulo",
          action: "Emissão de Ordem de Produção",
          note: "Ordem gerada a partir do pedido PED-2026-001"
        },
        {
          date: "2026-10-06 07:45",
          responsible: "Mariana Costa",
          action: "Início de Produção e Baixa de Materiais",
          note: "Matérias-primas requisitadas no almoxarifado"
        },
        {
          date: "2026-10-07 16:20",
          responsible: "Carlos Eduardo Santos",
          action: "Apontamento Parcial de Produção",
          note: "3 carrinhos concluíram caldeiraria e foram liberados para pintura"
        }
      ]
    },
    {
      id: "op-2",
      code: "OP-2026-002",
      salesOrderId: "ord-2",
      customerName: "Rede Atacadista SuperMix S/A",
      productId: "prod-2",
      productCode: "PRD-002",
      productName: "Estante Modular Reforçada 5 Prateleiras 2.0x1.0m",
      quantity: 10,
      plannedStartDate: "2026-10-08",
      plannedEndDate: "2026-10-22",
      status: "PLANEJADA",
      priority: "MEDIA",
      totalProcessHours: 32.0, // 10 * 3.2h
      producedQuantity: 0,
      assignedWorkstation: "Corte & Dobra CNC",
      technicalResponsible: "Eng. Isaac Paulo",
      materialsDeducted: false,
      stockCredited: false,
      notes: "Aguardando conclusão do corte da chapa #14.",
      bomRequirements: [
        {
          rawMaterialId: "mp-3",
          code: "MP-103",
          name: "Cantoneira Laminada 1.1/2\" x 1/8\"",
          requiredQuantity: 180.0,
          unit: "m",
          stockAvailable: 140,
          status: "EM_FALTA" // Notice: Stock 140 vs 180 required! Realistic MRP alert!
        },
        {
          rawMaterialId: "mp-2",
          code: "MP-102",
          name: "Chapa Aço Carbono #14 (1.9mm)",
          requiredQuantity: 25.0,
          unit: "m²",
          stockAvailable: 85,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-4",
          code: "MP-104",
          name: "Parafuso Sextavado M8 x 45mm c/ Porca",
          requiredQuantity: 400,
          unit: "un",
          stockAvailable: 1500,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-5",
          code: "MP-105",
          name: "Tinta Pó Epóxi Eletrostática Preto Fosco",
          requiredQuantity: 18.0,
          unit: "kg",
          stockAvailable: 45,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-7",
          code: "MP-107",
          name: "Ponteira Plástica 50x50mm Interna",
          requiredQuantity: 40,
          unit: "un",
          stockAvailable: 400,
          status: "SUFICIENTE"
        }
      ],
      history: [
        {
          date: "2026-10-04 14:15",
          responsible: "Eng. Isaac Paulo",
          action: "Emissão de Ordem de Produção",
          note: "Ordem programada com alerta de necessidade de compra de cantoneira"
        }
      ]
    },
    {
      id: "op-3",
      code: "OP-2026-003",
      productId: "prod-1",
      productCode: "PRD-001",
      productName: "Mesa Industrial para Solda e Montagem 1.80x0.90m",
      quantity: 2,
      plannedStartDate: "2026-09-25",
      plannedEndDate: "2026-10-02",
      actualStartDate: "2026-09-25",
      actualEndDate: "2026-10-02",
      status: "CONCLUIDA",
      priority: "MEDIA",
      totalProcessHours: 9.0,
      producedQuantity: 2,
      assignedWorkstation: "Montagem Final, Teste & Embalagem",
      technicalResponsible: "Eng. Isaac Paulo",
      materialsDeducted: true,
      stockCredited: true,
      notes: "Produção para estoque de segurança concluída com sucesso.",
      bomRequirements: [
        {
          rawMaterialId: "mp-1",
          code: "MP-101",
          name: "Tubo Aço Quadrado 50x50mm x 2.0mm",
          requiredQuantity: 24.0,
          unit: "m",
          stockAvailable: 320,
          status: "SUFICIENTE"
        },
        {
          rawMaterialId: "mp-2",
          code: "MP-102",
          name: "Chapa Aço Carbono #14 (1.9mm)",
          requiredQuantity: 3.24,
          unit: "m²",
          stockAvailable: 85,
          status: "SUFICIENTE"
        }
      ],
      history: [
        {
          date: "2026-09-25 08:00",
          responsible: "Eng. Isaac Paulo",
          action: "Emissão de Ordem de Produção",
          note: "Reposição de estoque"
        },
        {
          date: "2026-09-26 09:30",
          responsible: "Mariana Costa",
          action: "Início de Produção",
          note: "Materiais separados"
        },
        {
          date: "2026-10-02 17:00",
          responsible: "Eng. Isaac Paulo",
          action: "Baixa Concluída",
          note: "2 unidades aprovadas no controle de qualidade e adicionadas ao estoque"
        }
      ]
    }
  ]
};

class DatabaseManager {
  private db: AppDatabase;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_PATH)) {
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          ...INITIAL_SEED,
          ...parsed,
          users: parsed.users?.length ? parsed.users : INITIAL_SEED.users,
          rawMaterials: parsed.rawMaterials?.length ? parsed.rawMaterials : INITIAL_SEED.rawMaterials,
          products: parsed.products?.length ? parsed.products : INITIAL_SEED.products,
          suppliers: parsed.suppliers?.length ? parsed.suppliers : INITIAL_SEED.suppliers,
          customers: parsed.customers?.length ? parsed.customers : INITIAL_SEED.customers,
          workcenters: parsed.workcenters?.length ? parsed.workcenters : INITIAL_SEED.workcenters,
          orders: parsed.orders || INITIAL_SEED.orders,
          productionOrders: parsed.productionOrders || INITIAL_SEED.productionOrders,
          company: parsed.company || INITIAL_SEED.company,
        };
      }
    } catch (err) {
      console.error('Failed to load database from file, initializing seed:', err);
    }

    this.saveDatabase(INITIAL_SEED);
    return JSON.parse(JSON.stringify(INITIAL_SEED));
  }

  private saveDatabase(data: AppDatabase) {
    try {
      const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Failed to write database file:', err);
      // fallback direct write
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  public getSnapshot(): AppDatabase {
    return JSON.parse(JSON.stringify(this.db));
  }

  public resetToSeed(): AppDatabase {
    this.db = JSON.parse(JSON.stringify(INITIAL_SEED));
    this.saveDatabase(this.db);
    return this.getSnapshot();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.db.users;
  }

  public getUserById(id: string): User | undefined {
    return this.db.users.find(u => u.id === id);
  }

  public saveUser(user: Partial<User> & { name: string; email: string }): User {
    if (user.id) {
      const index = this.db.users.findIndex(u => u.id === user.id);
      if (index >= 0) {
        this.db.users[index] = { ...this.db.users[index], ...user } as User;
        this.saveDatabase(this.db);
        return this.db.users[index];
      }
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name,
      email: user.email,
      role: user.role || 'Responsável Técnico',
      crea: user.crea || '',
      active: true
    };
    this.db.users.push(newUser);
    this.saveDatabase(this.db);
    return newUser;
  }

  // --- Raw Materials ---
  public getRawMaterials(): RawMaterial[] {
    return this.db.rawMaterials;
  }

  public saveRawMaterial(material: Omit<RawMaterial, 'id'> & { id?: string }): RawMaterial {
    if (material.id) {
      const index = this.db.rawMaterials.findIndex(m => m.id === material.id);
      if (index >= 0) {
        this.db.rawMaterials[index] = { ...this.db.rawMaterials[index], ...material } as RawMaterial;
        this.saveDatabase(this.db);
        return this.db.rawMaterials[index];
      }
    }
    const newMaterial: RawMaterial = {
      id: `mp-${Date.now()}`,
      code: material.code || `MP-${Math.floor(100 + Math.random() * 900)}`,
      name: material.name,
      unit: material.unit || 'un',
      stock: Number(material.stock) || 0,
      minStock: Number(material.minStock) || 0,
      costPrice: Number(material.costPrice) || 0,
      supplierId: material.supplierId || '',
      location: material.location || ''
    };
    this.db.rawMaterials.push(newMaterial);
    this.saveDatabase(this.db);
    return newMaterial;
  }

  public deleteRawMaterial(id: string): boolean {
    const prevLen = this.db.rawMaterials.length;
    this.db.rawMaterials = this.db.rawMaterials.filter(m => m.id !== id);
    if (this.db.rawMaterials.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  public adjustRawMaterialStock(id: string, delta: number, reason: string): RawMaterial | null {
    const mat = this.db.rawMaterials.find(m => m.id === id);
    if (!mat) return null;
    mat.stock = Math.max(0, Number((mat.stock + delta).toFixed(2)));
    this.saveDatabase(this.db);
    return mat;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.db.products;
  }

  public saveProduct(product: Omit<Product, 'id'> & { id?: string }): Product {
    if (product.id) {
      const index = this.db.products.findIndex(p => p.id === product.id);
      if (index >= 0) {
        this.db.products[index] = {
          ...this.db.products[index],
          ...product,
          processHours: Number(product.processHours) || 0,
          salePrice: Number(product.salePrice) || 0,
          stock: Number(product.stock) || 0,
          minStock: Number(product.minStock) || 0,
          bom: product.bom || []
        };
        this.saveDatabase(this.db);
        return this.db.products[index];
      }
    }
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      code: product.code || `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: product.name,
      description: product.description || '',
      unit: product.unit || 'un',
      processHours: Number(product.processHours) || 1,
      salePrice: Number(product.salePrice) || 0,
      category: product.category || 'Geral',
      stock: Number(product.stock) || 0,
      minStock: Number(product.minStock) || 0,
      workstations: product.workstations || ["Corte", "Solda", "Pintura", "Montagem"],
      bom: product.bom || []
    };
    this.db.products.push(newProduct);
    this.saveDatabase(this.db);
    return newProduct;
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.db.products.length;
    this.db.products = this.db.products.filter(p => p.id !== id);
    if (this.db.products.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    return this.db.suppliers;
  }

  public saveSupplier(supplier: Omit<Supplier, 'id'> & { id?: string }): Supplier {
    if (supplier.id) {
      const idx = this.db.suppliers.findIndex(s => s.id === supplier.id);
      if (idx >= 0) {
        this.db.suppliers[idx] = { ...this.db.suppliers[idx], ...supplier };
        this.saveDatabase(this.db);
        return this.db.suppliers[idx];
      }
    }
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code: supplier.code || `FORN-${Math.floor(100 + Math.random() * 900)}`,
      name: supplier.name,
      contact: supplier.contact || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      cnpj: supplier.cnpj || '',
      suppliedProducts: supplier.suppliedProducts || '',
      leadTimeDays: Number(supplier.leadTimeDays) || 5
    };
    this.db.suppliers.push(newSup);
    this.saveDatabase(this.db);
    return newSup;
  }

  public deleteSupplier(id: string): boolean {
    const prevLen = this.db.suppliers.length;
    this.db.suppliers = this.db.suppliers.filter(s => s.id !== id);
    if (this.db.suppliers.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.db.customers;
  }

  public saveCustomer(customer: Omit<Customer, 'id'> & { id?: string }): Customer {
    if (customer.id) {
      const idx = this.db.customers.findIndex(c => c.id === customer.id);
      if (idx >= 0) {
        this.db.customers[idx] = { ...this.db.customers[idx], ...customer };
        this.saveDatabase(this.db);
        return this.db.customers[idx];
      }
    }
    const newCust: Customer = {
      id: `cli-${Date.now()}`,
      code: customer.code || `CLI-${Math.floor(100 + Math.random() * 900)}`,
      name: customer.name,
      contact: customer.contact || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      cnpjCpf: customer.cnpjCpf || ''
    };
    this.db.customers.push(newCust);
    this.saveDatabase(this.db);
    return newCust;
  }

  public deleteCustomer(id: string): boolean {
    const prevLen = this.db.customers.length;
    this.db.customers = this.db.customers.filter(c => c.id !== id);
    if (this.db.customers.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Workcenters / Capacity ---
  public getWorkcenters(): Workcenter[] {
    return this.db.workcenters;
  }

  public saveWorkcenter(wc: Omit<Workcenter, 'id'> & { id?: string }): Workcenter {
    if (wc.id) {
      const idx = this.db.workcenters.findIndex(w => w.id === wc.id);
      if (idx >= 0) {
        this.db.workcenters[idx] = {
          ...this.db.workcenters[idx],
          ...wc,
          machineCount: Number(wc.machineCount) || 1,
          dailyHoursPerMachine: Number(wc.dailyHoursPerMachine) || 8,
          workDaysPerMonth: Number(wc.workDaysPerMonth) || 22,
          efficiencyRate: Number(wc.efficiencyRate) || 80
        };
        this.saveDatabase(this.db);
        return this.db.workcenters[idx];
      }
    }
    const newWc: Workcenter = {
      id: `wc-${Date.now()}`,
      code: wc.code || `POSTO-0${this.db.workcenters.length + 1}`,
      name: wc.name,
      machineCount: Number(wc.machineCount) || 1,
      dailyHoursPerMachine: Number(wc.dailyHoursPerMachine) || 8,
      workDaysPerMonth: Number(wc.workDaysPerMonth) || 22,
      efficiencyRate: Number(wc.efficiencyRate) || 80,
      notes: wc.notes || ''
    };
    this.db.workcenters.push(newWc);
    this.saveDatabase(this.db);
    return newWc;
  }

  public deleteWorkcenter(id: string): boolean {
    const prevLen = this.db.workcenters.length;
    this.db.workcenters = this.db.workcenters.filter(w => w.id !== id);
    if (this.db.workcenters.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Sales Orders ---
  public getOrders(): SalesOrder[] {
    return this.db.orders;
  }

  public saveOrder(order: Omit<SalesOrder, 'id'> & { id?: string }): SalesOrder {
    const customer = this.db.customers.find(c => c.id === order.customerId);
    const customerName = customer ? customer.name : (order.customerName || 'Cliente Diversos');

    if (order.id) {
      const idx = this.db.orders.findIndex(o => o.id === order.id);
      if (idx >= 0) {
        this.db.orders[idx] = {
          ...this.db.orders[idx],
          ...order,
          customerName,
          totalAmount: Number(order.totalAmount) || 0
        };
        this.saveDatabase(this.db);
        return this.db.orders[idx];
      }
    }

    const year = new Date().getFullYear();
    const count = this.db.orders.length + 1;
    const code = order.code || `PED-${year}-${String(count).padStart(3, '0')}`;

    const newOrder: SalesOrder = {
      id: `ord-${Date.now()}`,
      code,
      customerId: order.customerId,
      customerName,
      orderDate: order.orderDate || new Date().toISOString().split('T')[0],
      deliveryDate: order.deliveryDate || '',
      priority: order.priority || 'MEDIA',
      status: order.status || 'PENDENTE',
      items: order.items || [],
      totalAmount: Number(order.totalAmount) || 0,
      notes: order.notes || '',
      hasProductionOrder: false,
      productionOrderIds: []
    };
    this.db.orders.push(newOrder);
    this.saveDatabase(this.db);
    return newOrder;
  }

  public deleteOrder(id: string): boolean {
    const prevLen = this.db.orders.length;
    this.db.orders = this.db.orders.filter(o => o.id !== id);
    if (this.db.orders.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Production Orders ---
  public getProductionOrders(): ProductionOrder[] {
    return this.db.productionOrders;
  }

  public getProductionOrderById(id: string): ProductionOrder | undefined {
    return this.db.productionOrders.find(op => op.id === id);
  }

  public checkBomRequirements(productId: string, quantity: number) {
    const product = this.db.products.find(p => p.id === productId);
    if (!product || !product.bom) return [];

    return product.bom.map(item => {
      const rawMat = this.db.rawMaterials.find(rm => rm.id === item.rawMaterialId);
      const requiredQuantity = Number((item.quantity * quantity).toFixed(2));
      const stockAvailable = rawMat ? rawMat.stock : 0;
      let status: 'SUFICIENTE' | 'CRITICO' | 'EM_FALTA' = 'SUFICIENTE';

      if (stockAvailable < requiredQuantity) {
        status = 'EM_FALTA';
      } else if (stockAvailable - requiredQuantity < (rawMat?.minStock || 0)) {
        status = 'CRITICO';
      }

      return {
        rawMaterialId: item.rawMaterialId,
        code: rawMat ? rawMat.code : 'N/A',
        name: rawMat ? rawMat.name : 'Material não encontrado',
        unit: rawMat ? rawMat.unit : 'un',
        requiredQuantity,
        stockAvailable,
        status
      };
    });
  }

  public createProductionOrder(params: {
    productId: string;
    quantity: number;
    salesOrderId?: string;
    plannedStartDate: string;
    plannedEndDate: string;
    priority?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    assignedWorkstation?: string;
    technicalResponsible: string;
    notes?: string;
  }): ProductionOrder {
    const product = this.db.products.find(p => p.id === params.productId);
    if (!product) throw new Error('Produto não encontrado');

    const year = new Date().getFullYear();
    const count = this.db.productionOrders.length + 1;
    const code = `OP-${year}-${String(count).padStart(3, '0')}`;

    let customerName = 'Produção Interna / Estoque';
    if (params.salesOrderId) {
      const order = this.db.orders.find(o => o.id === params.salesOrderId);
      if (order) {
        customerName = order.customerName;
      }
    }

    const bomRequirements = this.checkBomRequirements(params.productId, params.quantity);
    const totalProcessHours = Number((product.processHours * params.quantity).toFixed(2));

    const newOp: ProductionOrder = {
      id: `op-${Date.now()}`,
      code,
      salesOrderId: params.salesOrderId,
      customerName,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity: Number(params.quantity),
      plannedStartDate: params.plannedStartDate || new Date().toISOString().split('T')[0],
      plannedEndDate: params.plannedEndDate,
      status: 'PLANEJADA',
      priority: params.priority || 'MEDIA',
      totalProcessHours,
      producedQuantity: 0,
      assignedWorkstation: params.assignedWorkstation || (product.workstations[0] || 'Geral'),
      technicalResponsible: params.technicalResponsible,
      bomRequirements,
      materialsDeducted: false,
      stockCredited: false,
      notes: params.notes || '',
      history: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          responsible: params.technicalResponsible,
          action: 'Emissão da Ordem de Produção',
          note: `OP criada para ${params.quantity} ${product.unit}(s)`
        }
      ]
    };

    this.db.productionOrders.push(newOp);

    // If linked to sales order, update sales order status
    if (params.salesOrderId) {
      const order = this.db.orders.find(o => o.id === params.salesOrderId);
      if (order) {
        order.hasProductionOrder = true;
        if (!order.productionOrderIds) order.productionOrderIds = [];
        order.productionOrderIds.push(newOp.id);
        if (order.status === 'PENDENTE') {
          order.status = 'EM_PRODUCAO';
        }
      }
    }

    this.saveDatabase(this.db);
    return newOp;
  }

  public updateProductionOrderStatus(
    id: string,
    status: ProductionOrder['status'],
    responsible: string,
    note?: string,
    producedQuantity?: number
  ): ProductionOrder {
    const op = this.db.productionOrders.find(o => o.id === id);
    if (!op) throw new Error('Ordem de produção não encontrada');

    const previousStatus = op.status;
    op.status = status;

    if (producedQuantity !== undefined) {
      op.producedQuantity = Number(producedQuantity);
    }

    if (status === 'EM_ANDAMENTO' && !op.actualStartDate) {
      op.actualStartDate = new Date().toISOString().split('T')[0];

      // Auto-deduct raw materials if not already deducted
      if (!op.materialsDeducted) {
        this.deductBomMaterialsForOp(op, responsible);
      }
    }

    if (status === 'CONCLUIDA' && !op.actualEndDate) {
      op.actualEndDate = new Date().toISOString().split('T')[0];
      op.producedQuantity = op.quantity;

      // Ensure raw materials were deducted
      if (!op.materialsDeducted) {
        this.deductBomMaterialsForOp(op, responsible);
      }

      // Credit finished product to stock
      if (!op.stockCredited) {
        const prod = this.db.products.find(p => p.id === op.productId);
        if (prod) {
          prod.stock += op.quantity;
          op.stockCredited = true;
        }
      }

      // If associated sales order, check if all OPs are complete
      if (op.salesOrderId) {
        const order = this.db.orders.find(o => o.id === op.salesOrderId);
        if (order) {
          const allOps = this.db.productionOrders.filter(p => p.salesOrderId === order.id);
          const allDone = allOps.every(p => p.status === 'CONCLUIDA');
          if (allDone) {
            order.status = 'CONCLUIDO';
          }
        }
      }
    }

    op.history.push({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responsible,
      action: `Status alterado de ${previousStatus} para ${status}`,
      note: note || (status === 'CONCLUIDA' ? 'Baixa técnica de ordem de produção finalizada com crédito em estoque.' : undefined)
    });

    this.saveDatabase(this.db);
    return op;
  }

  private deductBomMaterialsForOp(op: ProductionOrder, responsible: string) {
    const prod = this.db.products.find(p => p.id === op.productId);
    if (!prod || !prod.bom) return;

    for (const item of prod.bom) {
      const mat = this.db.rawMaterials.find(m => m.id === item.rawMaterialId);
      if (mat) {
        const needed = item.quantity * op.quantity;
        mat.stock = Math.max(0, Number((mat.stock - needed).toFixed(2)));
      }
    }
    op.materialsDeducted = true;
  }

  public completeProductionOrderWithBaixa(
    id: string,
    responsible: string,
    producedQuantity: number,
    note?: string
  ): ProductionOrder {
    return this.updateProductionOrderStatus(id, 'CONCLUIDA', responsible, note, producedQuantity);
  }

  public deleteProductionOrder(id: string): boolean {
    const prevLen = this.db.productionOrders.length;
    this.db.productionOrders = this.db.productionOrders.filter(o => o.id !== id);
    if (this.db.productionOrders.length !== prevLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Viability & PCP Calculations ---
  public calculateCapacityAndViability() {
    const workcenters = this.db.workcenters;
    const activeOps = this.db.productionOrders.filter(
      op => op.status === 'PLANEJADA' || op.status === 'EM_ANDAMENTO' || op.status === 'EM_PAUSA'
    );

    // Calculate total factory capacity in hours/month
    let totalNominalHoursMonth = 0;
    let totalEffectiveHoursMonth = 0;
    let totalDailyCapacityHours = 0;

    const workcenterStats = workcenters.map(wc => {
      const nominalHours = wc.machineCount * wc.dailyHoursPerMachine * wc.workDaysPerMonth;
      const effectiveHours = nominalHours * (wc.efficiencyRate / 100);
      const dailyHours = wc.machineCount * wc.dailyHoursPerMachine * (wc.efficiencyRate / 100);

      totalNominalHoursMonth += nominalHours;
      totalEffectiveHoursMonth += effectiveHours;
      totalDailyCapacityHours += dailyHours;

      // Allocated hours for this workstation
      const allocatedOps = activeOps.filter(
        op => !op.assignedWorkstation || op.assignedWorkstation.toLowerCase().includes(wc.name.toLowerCase()) || wc.name.toLowerCase().includes(op.assignedWorkstation.toLowerCase())
      );
      const allocatedHours = allocatedOps.reduce((sum, op) => sum + (op.totalProcessHours * ((op.quantity - op.producedQuantity) / (op.quantity || 1))), 0);
      const utilization = effectiveHours > 0 ? (allocatedHours / effectiveHours) * 100 : 0;

      let status: 'NORMAL' | 'ATENCAO' | 'SOBRECARGA' = 'NORMAL';
      if (utilization > 100) status = 'SOBRECARGA';
      else if (utilization >= 80) status = 'ATENCAO';

      return {
        id: wc.id,
        code: wc.code,
        name: wc.name,
        machines: wc.machineCount,
        dailyHours: Number(dailyHours.toFixed(1)),
        effectiveMonthlyHours: Number(effectiveHours.toFixed(1)),
        allocatedHours: Number(allocatedHours.toFixed(1)),
        utilizationRate: Number(utilization.toFixed(1)),
        availableHours: Number(Math.max(0, effectiveHours - allocatedHours).toFixed(1)),
        status,
        activeOpCount: allocatedOps.length
      };
    });

    const totalAllocatedHours = activeOps.reduce(
      (sum, op) => sum + (op.totalProcessHours * ((op.quantity - op.producedQuantity) / (op.quantity || 1))),
      0
    );

    const overallUtilization = totalEffectiveHoursMonth > 0 ? (totalAllocatedHours / totalEffectiveHoursMonth) * 100 : 0;
    let overallStatus: 'NORMAL' | 'ATENCAO' | 'SOBRECARGA' = 'NORMAL';
    if (overallUtilization > 100) overallStatus = 'SOBRECARGA';
    else if (overallUtilization >= 80) overallStatus = 'ATENCAO';

    // Days of backlog work
    const daysOfBacklog = totalDailyCapacityHours > 0 ? Number((totalAllocatedHours / totalDailyCapacityHours).toFixed(1)) : 0;

    return {
      totalEffectiveHoursMonth: Number(totalEffectiveHoursMonth.toFixed(1)),
      totalAllocatedHours: Number(totalAllocatedHours.toFixed(1)),
      availableCapacityHours: Number(Math.max(0, totalEffectiveHoursMonth - totalAllocatedHours).toFixed(1)),
      overallUtilization: Number(overallUtilization.toFixed(1)),
      overallStatus,
      daysOfBacklog,
      activeOrdersCount: activeOps.length,
      workcenters: workcenterStats
    };
  }

  // Calculate Materials Requirements Planning (MRP)
  public calculateMaterialsMRP() {
    const activeOps = this.db.productionOrders.filter(
      op => (op.status === 'PLANEJADA' || op.status === 'EM_ANDAMENTO') && !op.materialsDeducted
    );

    const requirementsMap: Record<string, {
      material: RawMaterial;
      totalRequired: number;
      availableStock: number;
      shortage: number;
      associatedOps: string[];
    }> = {};

    for (const op of activeOps) {
      const prod = this.db.products.find(p => p.id === op.productId);
      if (!prod || !prod.bom) continue;

      for (const item of prod.bom) {
        const mat = this.db.rawMaterials.find(m => m.id === item.rawMaterialId);
        if (!mat) continue;

        const needed = item.quantity * op.quantity;
        if (!requirementsMap[mat.id]) {
          requirementsMap[mat.id] = {
            material: mat,
            totalRequired: 0,
            availableStock: mat.stock,
            shortage: 0,
            associatedOps: []
          };
        }
        requirementsMap[mat.id].totalRequired += needed;
        requirementsMap[mat.id].associatedOps.push(op.code);
      }
    }

    return Object.values(requirementsMap).map(req => {
      const shortage = Math.max(0, req.totalRequired - req.availableStock);
      return {
        ...req,
        totalRequired: Number(req.totalRequired.toFixed(2)),
        shortage: Number(shortage.toFixed(2)),
        status: shortage > 0 ? 'EM_FALTA' : (req.availableStock - req.totalRequired < req.material.minStock ? 'CRITICO' : 'SUFICIENTE')
      };
    });
  }

  public getCompany() {
    return this.db.company;
  }
}

export const db = new DatabaseManager();
