import { Module } from '@nestjs/common';
import { MockModule } from '../mock/mock.module';
import * as path from 'path';

@Module({
  imports: [
    MockModule.register({
      schemasPath: path.join(__dirname, '..', '..', 'data', 'schemas'),
    }),
  ],
})
export class AppModule {}
