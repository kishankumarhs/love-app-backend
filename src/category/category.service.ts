import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const slug = slugify(createCategoryDto.name, { lower: true, strict: true });

        // Check for existing slug to avoid unique constraint error before saving
        const existing = await this.categoryRepository.findOne({ where: { slug } });
        if (existing) {
            throw new ConflictException('Category with this name already exists');
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
        });
        return this.categoryRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        if (updateCategoryDto.name) {
            const slug = slugify(updateCategoryDto.name, { lower: true, strict: true });
            // Only check if slug changed
            if (slug !== category.slug) {
                const existing = await this.categoryRepository.findOne({ where: { slug } });
                if (existing) {
                    throw new ConflictException('Category with this name already exists');
                }
                category.slug = slug;
            }
        }

        Object.assign(category, updateCategoryDto);
        return this.categoryRepository.save(category);
    }

    async remove(id: string): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }
}
