import { swagger } from "../lib/swagger/swagger";

const [A] = swagger.createGroup('Plugin1', '插件1相关');
export const SwaggerWithPlugin1 = A;