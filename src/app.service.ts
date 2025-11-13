import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Countries } from './user/entities/countires.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Countries)
    private countries: Repository<Countries>,
  ) {}
  getHello(): string {
    return 'LOVE App Backend API is running!';
  }

  async getCountries() {
    const countries = await this.countries.find({});
    console.log(countries);
    return countries;
  }
}
