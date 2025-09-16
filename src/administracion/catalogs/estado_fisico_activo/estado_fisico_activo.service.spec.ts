import { Test, TestingModule } from '@nestjs/testing';
import { EstadoFisicoActivoService } from './estado_fisico_activo.service';

describe('EstadoFisicoActivoService', () => {
  let service: EstadoFisicoActivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoFisicoActivoService],
    }).compile();

    service = module.get<EstadoFisicoActivoService>(EstadoFisicoActivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
