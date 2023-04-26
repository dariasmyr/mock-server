import { DynamicModule, Module } from '@nestjs/common';
import { GqlModuleOptions, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import * as fs from 'fs';

function getFilesInDir(dir: string): string[] {
  return fs.readdirSync(dir).reduce((files, file) => {
    const name = dir + '/' + file;
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getFilesInDir(name)] : [...files, name];
  }, []);
}

function getFileNameWithoutExtension(file) {
  return file.split('/').pop().split('.').shift();
}

@Module({
  imports: [MockModule],
})
export class MockModule {
  static register(options: { schemasPath: string }): DynamicModule {
    const files = getFilesInDir(options.schemasPath);
    const gqlModules = files.map((file) => {
      const typeDefs = fs.readFileSync(file, { encoding: 'utf-8' });
      const schema = makeExecutableSchema({ typeDefs });
      const schemaWithMocks = addMocksToSchema({ schema });

      const options: GqlModuleOptions = {
        driver: ApolloDriver,
        typeDefs,
        schema: schemaWithMocks,
        path: `/${getFileNameWithoutExtension(file)}`,
      };

      return GraphQLModule.forRoot(options);
    });

    return {
      module: MockModule,
      imports: [...gqlModules],
    };
  }
}
