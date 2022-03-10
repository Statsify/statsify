import { Service } from 'typedi';

@Service()
export class ExampleService {
  public findAll() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
}
