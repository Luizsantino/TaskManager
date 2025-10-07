// src/test-env.ts

import 'dotenv/config'; // Tenta carregar o .env

const dbUrl = process.env.DATABASE_URL;

console.log('--- Início do Teste de Ambiente ---');
console.log(`O valor lido para DATABASE_URL é: ${dbUrl}`);

if (dbUrl && dbUrl.startsWith('postgresql://')) {
  console.log('✅ SUCESSO: A variável foi lida corretamente!');
} else {
  console.log('❌ FALHA: A variável NÃO foi encontrada ou está com formato inválido.');
}
console.log('--- Fim do Teste de Ambiente ---');