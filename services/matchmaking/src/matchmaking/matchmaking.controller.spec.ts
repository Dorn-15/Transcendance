import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';

describe('MatchmakingController', () => {
  let controller: MatchmakingController;
  let service: MatchmakingService;

  const mockMatchmakingService = {
    joinQueue: jest.fn().mockResolvedValue({
      status: 'joined',
      position: 1,
      message: 'Mocked response',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchmakingController],
      providers: [
        {
          provide: MatchmakingService,
          useValue: mockMatchmakingService,
        },
      ],
    }).compile();

    controller = module.get<MatchmakingController>(MatchmakingController);
    service = module.get<MatchmakingService>(MatchmakingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call joinQueue in the service', async () => {
    const dto = { userId: 'user1', gameMode: 'classic'};

    const result = await controller.joinQueue(dto);

    expect(service.joinQueue).toHaveBeenCalledWith(dto);

    expect(result).toEqual({
      status: 'joined',
      position: 1,
      message: 'Mocked response',
    });
  });
});
