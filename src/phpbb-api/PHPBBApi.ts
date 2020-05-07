import axios, { AxiosRequestConfig } from 'axios';
import { IGame } from '../models/data-types';
import IPHPBBApi, { IPostOptions } from './IPHBBApi';

export const config: AxiosRequestConfig = {
  withCredentials: true,
  auth: {
    username: process.env.USER,
    password: process.env.PASSWORD,
  },
};

const PHPBAPI: IPHPBBApi = {
  post: async (game: IGame, options: IPostOptions) => {
    // TODO: Implement this
  },
};

export default PHPBAPI;
