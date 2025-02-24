/**
 * https://github.com/zilliztech/zdoc/blob/master/plugins/apifox-docs/meta/openapi.json
 *
 * Copy github openapi.json to client/src/openapi/openapi.json
 * Run: yarn openapi
 *
 * Or set GITHUB_TOKEN to fetch openapi.json from github
 * Run: GITHUB_TOKEN=ghpxxx yarn openapi
 */

const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const sourcePath = 'src/openapi/openapi.json';
const targetPath = 'src/pages/play/language/extensions/json/openapi.json';

async function fetchOpenApiJson() {
  const url =
    'https://api.github.com/repos/zilliztech/zdoc/contents/plugins/apifox-docs/meta/openapi.json';

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}

function getProperties(schema) {
  const result = [];
  const { properties, required = [] } = schema;

  if (!properties) {
    return [];
  }

  for (const [key, value] of Object.entries(properties)) {
    const { type } = value;
    result.push({
      name: key,
      type,
      required: required.includes(key),
      children: getProperties(value),
    });
  }
  return result;
}

async function bootstrap() {
  const openapiData = GITHUB_TOKEN
    ? await fetchOpenApiJson()
    : JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const { paths } = openapiData;
  const IdentifierMapArr = [];

  for (const [path, detail] of Object.entries(paths)) {
    if (path.startsWith('/v2/vectordb')) {
      const pathParts = path.split('/').filter(part => part); // Split and filter empty parts
      const [, , resource, ...rest] = pathParts;
      const action = rest.join('/');
      const resourceIndex = IdentifierMapArr.findIndex(
        item => item.name === resource
      );

      const { requestBody } = detail.post ?? {};
      const properties = requestBody
        ? getProperties(requestBody.content['application/json'].schema)
        : [];

      if (resourceIndex < 0) {
        IdentifierMapArr.push({
          name: resource,
          children: [{ name: action, children: properties }],
        });
      } else {
        const actionIndex = IdentifierMapArr[resourceIndex].children.findIndex(
          item => item.name === action
        );
        if (actionIndex < 0) {
          IdentifierMapArr[resourceIndex].children.push({
            name: action,
            children: properties,
          });
        }
      }
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(IdentifierMapArr, null, 2));
}
bootstrap();
