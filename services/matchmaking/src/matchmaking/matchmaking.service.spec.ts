import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from './matchmaking.service';

const mockRedis = {
  rpush: jest.fn(), // fonction spy qui indique juste qu'elle a ete call
  llen: jest.fn(),
};

describe('MatchmakingService', () => {
  let service: MatchmakingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        {
          provide: 'REDIS_CLIENT',  // remplacement du vrai provider redis par l'objet de test
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add player to redis queue', async () => {
    mockRedis.llen.mockResolvedValue(1);

    const result = await service.joinQueue({ userId: 'user1', gameMode: 'classic' });

    expect(mockRedis.rpush).toHaveBeenCalledWith('queue:classic', 'user1');

    expect(result).toEqual({
      status: 'joined',
      position: 1,
      message: 'Waiting for opponent...',
    });
  });
});
