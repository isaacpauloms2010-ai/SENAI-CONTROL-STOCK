# ManufacERP — Sistema Integrado de Gestão & PCP de Manufatura

Aplicação web full-stack completa para planejamento e controle da produção (PCP) e gestão integrada (ERP básico) voltada para pequenas e médias indústrias de manufatura.

---

## 🚀 Funcionalidades Principais

1. **Cadastros Persistentes (Banco de Dados em Disco):**
   - **Ficha Técnica do Produto**: Código, nome, descrição, categoria, tempo de processo padrão (horas/unidade), estoques e Lista Estruturada de Materiais (BOM - Bill of Materials).
   - **Matérias-Primas / Almoxarifado**: Código, nome, unidade (m, m², kg, un, l), estoque atual, estoque de segurança mínimo, custo unitário e fornecedor associado.
   - **Capacidade Produtiva**: Postos e células de trabalho, quantidade de máquinas instaladas, horas disponíveis por turno/dia, dias úteis no mês e taxa de eficiência (OEE %).
   - **Clientes & Fornecedores**: Cadastros completos com CNPJ/CPF, contatos, prazos médios de entrega (lead times) e canais de comunicação.

2. **Gestão de Pedidos e Produção:**
   - **Carteira de Pedidos de Venda**: Clientes, múltiplos itens, datas de entrega desejada e prioridade.
   - **Emissão de Ordens de Produção (OP)**: Emissão a partir de pedidos ou para reposição de estoque, com verificação dinâmica da disponibilidade de materiais (BOM) em tempo real.
   - **Acompanhamento em Tempo Real**: Status das OPs (Planejada, Em Andamento, Em Pausa, Concluída), apontamento de progresso e histórico com auditoria.
   - **Baixa Técnica & Crédito em Estoque**: Ao concluir uma OP, o sistema deduz automaticamente os insumos do almoxarifado conforme a BOM e credita o produto acabado no estoque de produtos acabados.
   - **Cálculo de Viabilidade Produtiva**: Cruzamento entre demanda de horas e capacidade disponível por posto e total da fábrica, com simulador interativo de impacto de novos pedidos e detecção de gargalos.

3. **Interface, Responsável Técnico e Relatórios:**
   - **Identificação do Responsável Técnico em Todas as Telas**: Exibição fixa no cabeçalho superior do profissional atuante (ex: *Eng. Isaac Paulo - CREA/SC 284.910-D*), com autenticação e seletor rápido de técnicos.
   - **Emissão e Impressão de OPs para Chão de Fábrica**: Folha padrão A4 com campos para apontamento manual por operadores, conferência de almoxarifado e assinaturas de qualidade.
   - **Relatórios Gerenciais**: Acompanhamento de OPs, Planejamento de Necessidade de Materiais (MRP) com alertas de déficit, histórico de baixas e exportação em CSV.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express, TSX
- **Persistência de Dados:** Motor de banco de dados baseado em arquivo atômico (`data/db.json`) com gravação segura (escrita temporária + rename atômico contra corrupção), sem necessidade de instalação de SGBD externo.

---

## 📋 Instruções de Setup Local

### 1. Pré-requisitos
- Node.js versão 18.x ou superior
- npm versão 9.x ou superior

### 2. Instalação de Dependências
Na raiz do projeto, execute:
```bash
npm install
```

### 3. Variáveis de Ambiente (Opcional)
Copie o arquivo `.env.example` para `.env` se desejar customizar a porta de execução:
```bash
cp .env.example .env
```
Variáveis suportadas:
- `PORT`: Porta do servidor (padrão: `3000`)
- `NODE_ENV`: Modo de execução (`development` ou `production`)

### 4. Executando o Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor inicializará na porta 3000 integrando a API RESTful em `/api` e o frontend Vite:
Acesse no seu navegador: **`http://localhost:3000`**

### 5. Build de Produção
Para compilar os arquivos estáticos otimizados para produção:
```bash
npm run build
npm start
```

---

## 📂 Estrutura de Pastas

```text
├── data/
│   └── db.json                    # Base de dados persistente em disco (criada automaticamente)
├── server/
│   ├── types.ts                   # Tipos de dados e schemas TypeScript do backend
│   ├── db.ts                      # Gerenciador de persistência atômica, seeders e cálculos de PCP/MRP
│   └── api.ts                     # Rotas e controladores da API REST Express
├── src/
│   ├── types/
│   │   └── index.ts               # Interfaces TypeScript compartilhadas no frontend
│   ├── services/
│   │   └── api.ts                 # Cliente HTTP e integração com a API
│   ├── context/
│   │   └── AuthContext.tsx        # Contexto do Responsável Técnico e autenticação
│   ├── components/
│   │   ├── Layout.tsx             # Layout global com cabeçalho do Responsável Técnico
│   │   ├── DashboardView.tsx      # Dashboard com KPIs, alertas e gauges de ocupação
│   │   ├── ProductionOrdersView.tsx # Gestão e acompanhamento das OPs
│   │   ├── ViabilityView.tsx      # Cálculo de viabilidade e simulador de capacidade
│   │   ├── SalesOrdersView.tsx    # Gestão de pedidos de venda e emissão rápida de OP
│   │   ├── ProductsView.tsx       # Fichas técnicas e estruturas BOM
│   │   ├── RawMaterialsView.tsx   # Almoxarifado e movimentação rápida de estoque
│   │   ├── CapacityView.tsx       # Parque fabril, máquinas e postos de trabalho
│   │   ├── SuppliersView.tsx      # Fornecedores homologados
│   │   ├── CustomersView.tsx      # Clientes cadastrados
│   │   ├── ReportsView.tsx        # Relatórios gerenciais, MRP e impressão
│   │   ├── PrintProductionOrderModal.tsx # Folha impressa de OP para o chão de fábrica
│   │   ├── CreateProductionOrderModal.tsx # Emissão de OP com prévia de materiais
│   │   ├── CompleteProductionOrderModal.tsx # Baixa técnica com dedução de estoque
│   │   ├── ProductModal.tsx       # Editor de Ficha Técnica e BOM
│   │   ├── RawMaterialModal.tsx   # Cadastro de matéria-prima
│   │   ├── SalesOrderModal.tsx    # Cadastro de pedido de venda
│   │   ├── WorkcenterModal.tsx    # Cadastro de postos de trabalho
│   │   ├── SupplierModal.tsx      # Cadastro de fornecedores
│   │   ├── CustomerModal.tsx      # Cadastro de clientes
│   │   ├── LoginModal.tsx         # Autenticação e troca de responsável técnico
│   │   └── SetupModal.tsx         # Modal de guia de setup e backup
│   ├── App.tsx                    # Orquestrador principal da aplicação
│   ├── main.tsx                   # Ponto de entrada React
│   └── index.css                  # Estilos globais Tailwind e regras @media print
├── server.ts                      # Ponto de entrada do servidor Full-Stack
├── package.json                   # Dependências e scripts de execução
├── tsconfig.json                  # Configurações TypeScript
└── vite.config.ts                 # Configurações do Vite
```

---

## 📦 Dados Iniciais (Seeders)

A aplicação vem pré-configurada com um conjunto de dados para testes imediatos:
- **Responsáveis Técnicos**: Eng. Isaac Paulo (CREA/SC 284.910-D), Mariana Costa e Carlos Eduardo.
- **Produtos com Ficha Técnica Completa**: Mesas Industriais para Solda, Estantes Modulares Pesadas, Carrinhos Industriais com Rodízios e Armários de Ferramentas.
- **Matérias-Primas**: Tubos 50x50mm, Chapas de Aço #14, Cantoneiras, Parafusos M8, Tintas Epóxi, Rodízios 4" e Ponteiras.
- **Postos de Trabalho**: Corte CNC, Solda MIG/TIG, Cabine de Pintura e Montagem Final.
- **Ordens de Produção & Pedidos**: Exemplos em andamento com alerta de estoque crítico (permitindo testar o MRP imediatamente) e concluídas.
