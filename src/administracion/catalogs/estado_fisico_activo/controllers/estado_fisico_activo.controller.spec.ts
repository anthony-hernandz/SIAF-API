import { Test, TestingModule } from '@nestjs/testing';
import { EstadoFisicoActivoController } from './estado_fisico_activo.controller';
import { EstadoFisicoActivoService } from '../estado_fisico_activo.service';

describe('EstadoFisicoActivoController', () => {
  let controller: EstadoFisicoActivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoFisicoActivoController],
      providers: [EstadoFisicoActivoService],
    }).compile();

    controller = module.get<EstadoFisicoActivoController>(EstadoFisicoActivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
