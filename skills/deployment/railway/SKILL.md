# Railway — Deployment Platform

Easiest deployment platform for indie projects. Push code, get a URL. One-click Postgres/Redis.

## Methods

| Method | Description |
|--------|-------------|
| `deploy(source)` | Deploys from directory or GitHub repo |
| `createDatabase(type)` | Provisions Postgres/Redis/MySQL |
| `setupDomain(domain)` | Configures custom domain with SSL |
| `getStatus()` | Returns project deployment status |

## Example

```js
const railway = new Railway();
railway.deploy('.'); // "Deploying to https://project.railway.app"
railway.createDatabase('postgres'); // Connection string returned
```
