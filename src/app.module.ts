import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import * as fs from 'fs';

function getFilesInDir(dir) {
  return fs.readdirSync(dir).reduce((files, file) => {
    const name = dir + '/' + file;
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getFilesInDir(name)] : [...files, name];
  }, []);
}

const files = getFilesInDir('./src/schemas');
function getFileNameWithoutExtension(file) {
  return file.split('/').pop().split('.').shift();
}

@Module({
  imports: [
    ...files.map((file) => {
      return GraphQLModule.forRootAsync<ApolloDriverConfig>({
        driver: ApolloDriver,
        useFactory: async () => {
          const typeDefs = fs.readFileSync(file, 'utf8');
          const schema = makeExecutableSchema({ typeDefs });
          const schemaWithMocks = addMocksToSchema({ schema });
          return {
            typeDefs,
            schema: schemaWithMocks,
            playground: true,
            path: `/${getFileNameWithoutExtension(file)}`,
          };
        },
      });
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
