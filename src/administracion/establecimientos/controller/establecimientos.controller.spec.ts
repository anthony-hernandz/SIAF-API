import { Test, TestingModule } from '@nestjs/testing';
import { EstablecimientosController } from './establecimientos.controller';

describe('EstablecimientosController', () => {
  let controller: EstablecimientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstablecimientosController],
    }).compile();

    controller = module.get<EstablecimientosController>(
      EstablecimientosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
