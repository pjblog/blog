import { DataSource, DataSourceOptions } from 'typeorm';
import { createContext } from '@typeservice/process';
import { logger } from './logger';

type TCreateORMServerEntity = DataSourceOptions['entities'];

export const PBLOG_ORM_DATASOURCE_CONTEXT = createContext<DataSource>();

export interface TORMConfigs {
  readonly type: string,
  readonly host: string,
  readonly port: number,
  readonly username: string,
  readonly password: string,
  readonly database: string,
}

export interface TCreateORMServerProps {
  synchronize?: boolean,
  entities: TCreateORMServerEntity,
  configs: TORMConfigs,
}

export function createORMServer(props: TCreateORMServerProps) {
  return async () => {
    const configs = Object.assign(props.configs, {
      synchronize: !!props.synchronize,
      logging: false,
      entities: props.entities,
    }) as DataSourceOptions;
    const connection = new DataSource(configs);
    const datasource = await connection.initialize();
    PBLOG_ORM_DATASOURCE_CONTEXT.setContext(datasource);
    logger.warn('-', '[Plugin]', 'Pjblog orm started!');
    return () => datasource.destroy();
  }
}