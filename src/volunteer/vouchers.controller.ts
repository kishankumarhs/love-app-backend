import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { VoucherService } from './services/voucher.service';
import { ActivateVoucherDto } from './dto/activate-voucher.dto';
import { WifiVoucher } from './entities/wifi-voucher.entity';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
    constructor(private readonly voucherService: VoucherService) { }

    /**
     * Redeem a voucher code.
     * Mobile App Logic:
     * - Call this when user enters a code.
     * - Success (200): Code is valid and activated. Show success screen.
     * - Error (404): Code not found.
     * - Error (400): Code expired, already used, or invalid state. Show error message.
     */
    @Post('redeem')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Redeem/Activate a voucher code' })
    @ApiResponse({
        status: 200,
        description: 'Voucher successfully activated',
        type: WifiVoucher,
    })
    @ApiResponse({
        status: 400,
        description: 'Voucher expired, already used, or invalid',
    })
    @ApiResponse({ status: 404, description: 'Voucher code not found' })
    @ApiBody({ type: ActivateVoucherDto })
    redeem(@Body() activateVoucherDto: ActivateVoucherDto) {
        return this.voucherService.activateVoucher(activateVoucherDto);
    }
}
