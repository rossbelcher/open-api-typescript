# OpenApi to Typescript
This package creates two files to be used in your project.
Summary and description on API methods is also accepted and translated to code comments that editors pick up.
It's intended for use in an es6+ project.

## Output files
- Api class file (api-connectors.ts). This contains 1 class export with static methods for your project API's. Useage would be "ApiService.{Api class name}.{Api method name}__{Api method type}". It strongly types input and output definitions.
- Definition file (api-definitions.d.ts). This contains exports of all models used in your API controllers.

## Example usage
In the below usage I have generated a swagger from back-end and saved it to my project directory.
Any other source works as long as it's OpenApi spec.
```
import gulp from 'gulp';
import path from 'path';
import { genTypescript } from '@rossbelcher/open-api-typescript';

gulp.task('swagger', (callback) => {
    const resolvePath = relativePath => path.resolve(__dirname, relativePath);
    const swaggerFolder = resolvePath('..\\..\\swagger\\swagger.json');
    genTypescript(swaggerFolder, 'src\\Api', callback);
});
```