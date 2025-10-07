import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define a lista de status para o projeto
const statusData = [
  // É crucial que o ID 1 seja 'Pendente' para que o código de criação de projeto funcione.
  { id: 1, nome: 'Pendente' }, 
  { id: 2, nome: 'Em Andamento' },
  { id: 3, nome: 'Bloqueado' },
  { id: 4, nome: 'Revisão/Teste' },
  { id: 5, nome: 'Concluído' },
  { id: 6, nome: 'Cancelado' },
];
// Define a lista de status para tarefas
const statusTarefaData = [
  // É crucial que o ID 1 seja 'A Fazer'
  { id: 1, nome: 'A Fazer'},
  { id: 2, nome: 'Em Progresso'},
  { id: 3, nome: 'Aguardando Aprovação'},
  { id: 4, nome: 'Concluída'},
];

async function main() {
  console.log(`Iniciando o seeding...`);



  // Deleta todos os status existentes (opcional)
        //await prisma.status.deleteMany(); 
  
  // Insere os status na tabela Status
  for (const status of statusData) {
    await prisma.status.upsert({
      where: { id: status.id }, // Tenta encontrar pelo ID
      update: {}, // Não faz nada se encontrar (apenas garante que existe)
      create: status, // Cria se não encontrar
    });
  }

  console.log(`Status de Projetos inseridos com sucesso. ${statusData.length} status inseridos/atualizados.`);
  
  // --- SEED PARA STATUS DE TAREFA (Model: StatusTarefa) ---
  console.log(`\nInserindo Status de Tarefas...`);
  // Deleta os dados existentes (limpa)
  await prisma.statusTarefa.deleteMany();

  for (const status of statusTarefaData) {
    await prisma.statusTarefa.upsert({
      where: { id: status.id }, // Tenta encontrar pelo ID
      update: {}, // Não faz nada se encontrar (apenas garante que existe)
      create: status, // Cria se não encontrar
    }); 
  }
  console.log(`Status de Tarefas inseridos com sucesso. ${statusTarefaData.length} status inseridos/atualizados.`);

  console.log(`Seeding concluído com sucesso!`);
}

main()
  .catch((e) => {
    console.error("Erro durante o seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });