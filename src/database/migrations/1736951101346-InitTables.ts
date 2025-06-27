import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1736951101346 implements MigrationInterface {
    name = 'InitTables1736951101346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mnt_tokens" ("id" text NOT NULL, "token" text NOT NULL, "expiration_time" TIMESTAMP WITH TIME ZONE NOT NULL, "refresh_token" text, "refresh_expiration_time" TIMESTAMP WITH TIME ZONE, "active" boolean, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_user" text NOT NULL, CONSTRAINT "PK_1c5a962297ae4167f7e4c0f18b1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_permisos_roles" ("id" text NOT NULL, "asignado_especial" boolean DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id_modulo" text NOT NULL, "id_rol" text NOT NULL, CONSTRAINT "PK_4525f9e5efb0533b87dcb993633" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_etiquetas" ("id" text NOT NULL, "nombre" character varying(100) NOT NULL, "icono" character varying(50) NOT NULL, "descripcion" text, "visible" boolean DEFAULT true, "activo" boolean DEFAULT true, "prioridad" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_94600f4b14c988568d154f2d001" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_menu" ("id" text NOT NULL, "nombre" character varying(100) NOT NULL, "descripcion" text, "visible" boolean, "activo" boolean, "icono" character varying(100) NOT NULL, "filename" character varying(150) NOT NULL, "admin" boolean, "super_admin" boolean, "prioridad" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_etiqueta" text, CONSTRAINT "PK_2216fec43cb877e45b117688e1e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_modulos" ("id" text NOT NULL, "nombre" character varying(100) NOT NULL, "descripcion" text, "visible" boolean DEFAULT true, "activo" boolean DEFAULT true, "icono" character varying(100), "filename" character varying(150) NOT NULL, "method" character varying(10), "is_father" boolean, "prioridad" integer, "frontend" boolean DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_padre" text, "id_menu" text, CONSTRAINT "PK_8ca60ad3eda75b274f71b06c1db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_permisos_usuarios" ("id" text NOT NULL, "asignado_especial" boolean DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id_modulo" text NOT NULL, "id_usuario" text, CONSTRAINT "PK_7451badbbc7254cefb59f1b5790" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_restore_account" ("id" text NOT NULL, "date_time_expiration" TIMESTAMP WITH TIME ZONE NOT NULL, "ip" character varying(100) NOT NULL, "link_restore" text NOT NULL, "token_restore" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_user" text NOT NULL, CONSTRAINT "PK_dab33f1a540accb6a6637c30d1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_rol_user" ("id" text NOT NULL, "nombre" character varying(50) NOT NULL, "descripcion" character varying(250), "activo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f952cfe5caa9d3fd0a71e61010c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_usuarios" ("id" text NOT NULL, "email" character varying(100), "password" text NOT NULL, "activo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_rol" text NOT NULL, CONSTRAINT "UQ_540dc996098cb83e8f478221371" UNIQUE ("email"), CONSTRAINT "PK_f4c882b5bfef1cec732d8336f2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mnt_permisos_modulos" ("id" text NOT NULL, "id_modulo_visa" text NOT NULL, "id_modulo_endpoint" text NOT NULL, CONSTRAINT "PK_cfcbbffacbf44d5cd82eb33cf3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bit_log_errores" ("id" text NOT NULL, "error" text NOT NULL, "url" text NOT NULL, "params" text, "body" text, "query" text, "method" character varying(20), "ip" character varying(100) NOT NULL, "fecha_hora" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_usuario" text, CONSTRAINT "PK_c3830ca3a1e6514a575bd50f9ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mnt_tokens" ADD CONSTRAINT "FK_16ccb8b7566562f8f81cd337bdd" FOREIGN KEY ("id_user") REFERENCES "mnt_usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_roles" ADD CONSTRAINT "FK_2d07d41c7dca4d131b2d791f7a8" FOREIGN KEY ("id_modulo") REFERENCES "mnt_modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_roles" ADD CONSTRAINT "FK_c52dc82f9eb2a3c9b6f82baf89e" FOREIGN KEY ("id_rol") REFERENCES "mnt_rol_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_menu" ADD CONSTRAINT "FK_3e87762988f24690f81cca9af9d" FOREIGN KEY ("id_etiqueta") REFERENCES "mnt_etiquetas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_modulos" ADD CONSTRAINT "FK_e033f260a289bf57ee6e94f40a4" FOREIGN KEY ("id_padre") REFERENCES "mnt_modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_modulos" ADD CONSTRAINT "FK_cf8d10484b933f7c2317a931fe0" FOREIGN KEY ("id_menu") REFERENCES "mnt_menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_usuarios" ADD CONSTRAINT "FK_1119f8998b2b24b667c94d8bc37" FOREIGN KEY ("id_modulo") REFERENCES "mnt_modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_usuarios" ADD CONSTRAINT "FK_20698b7eb95233b2641ca4e26cc" FOREIGN KEY ("id_usuario") REFERENCES "mnt_usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_restore_account" ADD CONSTRAINT "FK_00833dd4d7063d17a176a3c6794" FOREIGN KEY ("id_user") REFERENCES "mnt_usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_usuarios" ADD CONSTRAINT "FK_7e2690925322b10866c6600b713" FOREIGN KEY ("id_rol") REFERENCES "mnt_rol_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_modulos" ADD CONSTRAINT "FK_3c5ce7ddbe24ed70d1fac64e45e" FOREIGN KEY ("id_modulo_visa") REFERENCES "mnt_modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_modulos" ADD CONSTRAINT "FK_5cd0e9f6f62a0769e5db7cacf3f" FOREIGN KEY ("id_modulo_endpoint") REFERENCES "mnt_modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mnt_permisos_modulos" DROP CONSTRAINT "FK_5cd0e9f6f62a0769e5db7cacf3f"`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_modulos" DROP CONSTRAINT "FK_3c5ce7ddbe24ed70d1fac64e45e"`);
        await queryRunner.query(`ALTER TABLE "mnt_usuarios" DROP CONSTRAINT "FK_7e2690925322b10866c6600b713"`);
        await queryRunner.query(`ALTER TABLE "mnt_restore_account" DROP CONSTRAINT "FK_00833dd4d7063d17a176a3c6794"`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_usuarios" DROP CONSTRAINT "FK_20698b7eb95233b2641ca4e26cc"`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_usuarios" DROP CONSTRAINT "FK_1119f8998b2b24b667c94d8bc37"`);
        await queryRunner.query(`ALTER TABLE "mnt_modulos" DROP CONSTRAINT "FK_cf8d10484b933f7c2317a931fe0"`);
        await queryRunner.query(`ALTER TABLE "mnt_modulos" DROP CONSTRAINT "FK_e033f260a289bf57ee6e94f40a4"`);
        await queryRunner.query(`ALTER TABLE "mnt_menu" DROP CONSTRAINT "FK_3e87762988f24690f81cca9af9d"`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_roles" DROP CONSTRAINT "FK_c52dc82f9eb2a3c9b6f82baf89e"`);
        await queryRunner.query(`ALTER TABLE "mnt_permisos_roles" DROP CONSTRAINT "FK_2d07d41c7dca4d131b2d791f7a8"`);
        await queryRunner.query(`ALTER TABLE "mnt_tokens" DROP CONSTRAINT "FK_16ccb8b7566562f8f81cd337bdd"`);
        await queryRunner.query(`DROP TABLE "bit_log_errores"`);
        await queryRunner.query(`DROP TABLE "mnt_permisos_modulos"`);
        await queryRunner.query(`DROP TABLE "mnt_usuarios"`);
        await queryRunner.query(`DROP TABLE "mnt_rol_user"`);
        await queryRunner.query(`DROP TABLE "mnt_restore_account"`);
        await queryRunner.query(`DROP TABLE "mnt_permisos_usuarios"`);
        await queryRunner.query(`DROP TABLE "mnt_modulos"`);
        await queryRunner.query(`DROP TABLE "mnt_menu"`);
        await queryRunner.query(`DROP TABLE "mnt_etiquetas"`);
        await queryRunner.query(`DROP TABLE "mnt_permisos_roles"`);
        await queryRunner.query(`DROP TABLE "mnt_tokens"`);
    }

}
