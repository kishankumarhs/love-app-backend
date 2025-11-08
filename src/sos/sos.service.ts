import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SOS } from './entities/sos.entity';
import { CreateSOSDto } from './dto/create-sos.dto';

@Injectable()
export class SOSService {
  constructor(
    @InjectRepository(SOS)
    private sosRepository: Repository<SOS>,
  ) {}

  async create(createSOSDto: CreateSOSDto): Promise<SOS> {
    const sos = this.sosRepository.create(createSOSDto);
    return this.sosRepository.save(sos);
  }

  async findAll(): Promise<SOS[]> {
    return this.sosRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<SOS> {
    return this.sosRepository.findOne({ where: { id }, relations: ['user'] });
  }
}