-- DropForeignKey
ALTER TABLE "public"."projeto_usuarios" DROP CONSTRAINT "projeto_usuarios_projetoId_fkey";

-- AddForeignKey
ALTER TABLE "public"."projeto_usuarios" ADD CONSTRAINT "projeto_usuarios_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "public"."projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
