/*
  Warnings:

  - Added the required column `statusTarefaId` to the `tarefas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."tarefas" DROP CONSTRAINT "tarefas_assigneeId_fkey";

-- AlterTable
ALTER TABLE "public"."tarefas" ADD COLUMN     "statusTarefaId" INTEGER NOT NULL,
ALTER COLUMN "assigneeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."status_tarefa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "status_tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "status_tarefa_nome_key" ON "public"."status_tarefa"("nome");

-- AddForeignKey
ALTER TABLE "public"."tarefas" ADD CONSTRAINT "tarefas_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tarefas" ADD CONSTRAINT "tarefas_statusTarefaId_fkey" FOREIGN KEY ("statusTarefaId") REFERENCES "public"."status_tarefa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
