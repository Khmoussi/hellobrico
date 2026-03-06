import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisDto {
  @ApiProperty({
    description: 'Number of leads created this month',
    example: 24,
  })
  leadsThisMonth!: number;

  @ApiProperty({
    description: 'Number of quotes sent this month',
    example: 12,
  })
  quotesSentThisMonth!: number;

  @ApiProperty({
    description: 'Conversion rate (CONVERTI leads / total leads) as percentage',
    example: 15.5,
  })
  conversionRate!: number;

  @ApiProperty({
    description: 'Number of active projects (EN_PREPARATION + EN_COURS)',
    example: 8,
  })
  activeProjects!: number;
}
