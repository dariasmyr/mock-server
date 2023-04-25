import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import * as fs from 'fs';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => {
        const typeDefs = fs.readFileSync(
          './src/schemas/schema.graphql',
          'utf8',
        );
        const schema = makeExecutableSchema({ typeDefs });
        const schemaWithMocks = addMocksToSchema({ schema });
        return {
          typeDefs,
          schema: schemaWithMocks,
          playground: true,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
