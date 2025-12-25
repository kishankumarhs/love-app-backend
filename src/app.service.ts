import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './user/entities/countries.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Country)
    private countries: Repository<Country>,
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
