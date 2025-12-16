import  {IsString, IsNotEmpty } from 'class-validator';

export class JoinQueueDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    gameMode: string;
}