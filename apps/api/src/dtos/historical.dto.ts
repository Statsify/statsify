import { IntersectionType } from '@nestjs/swagger';
import { HistoricalTypeDto } from './historical-type.dto';
import { PlayerDto } from './player.dto';

export class HistoricalDto extends IntersectionType(PlayerDto, HistoricalTypeDto) {}
