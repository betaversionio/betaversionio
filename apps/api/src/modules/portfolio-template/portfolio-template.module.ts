import { Module } from '@nestjs/common';

import { PortfolioTemplateController } from './portfolio-template.controller';
import { PortfolioTemplateService } from './portfolio-template.service';

@Module({
  controllers: [PortfolioTemplateController],
  providers: [PortfolioTemplateService],
  exports: [PortfolioTemplateService],
})
export class PortfolioTemplateModule {}
