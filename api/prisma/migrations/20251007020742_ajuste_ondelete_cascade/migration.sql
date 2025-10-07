-- DropForeignKey
ALTER TABLE "public"."tarefas" DROP CONSTRAINT "tarefas_projetoId_fkey";

-- AddForeignKey
ALTER TABLE "public"."tarefas" ADD CONSTRAINT "tarefas_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "public"."projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
