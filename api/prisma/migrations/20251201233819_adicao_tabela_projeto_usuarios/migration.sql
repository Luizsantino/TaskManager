-- CreateTable
CREATE TABLE "public"."projeto_usuarios" (
    "projetoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "projeto_usuarios_pkey" PRIMARY KEY ("projetoId","userId")
);

-- AddForeignKey
ALTER TABLE "public"."projeto_usuarios" ADD CONSTRAINT "projeto_usuarios_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "public"."projetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projeto_usuarios" ADD CONSTRAINT "projeto_usuarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
