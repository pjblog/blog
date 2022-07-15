import { HTTPController, HTTPRouter } from '@typeservice/http';

@HTTPController()
export class BlogContentService {
  @HTTPRouter({
    pathname: '/content',
    methods: 'GET'
  })
  public welcome() {
    return 'Hello word'
  }
}