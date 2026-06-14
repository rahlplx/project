/**
 * Utility Catalog
 * Curated open-source tools by category (7-10 per category)
 */

const UTILITY_CATALOG = {
  auth: {
    repos: [
      { name: 'NextAuth.js', url: 'https://github.com/nextauthjs/next-auth', stars: 25000, license: 'ISC', description: 'Authentication for Next.js' },
      { name: 'Passport.js', url: 'https://github.com/jaredhanson/passport', stars: 22000, license: 'MIT', description: 'Simple, unobtrusive authentication for Node.js' },
      { name: 'Auth.js', url: 'https://github.com/authjs/authjs', stars: 5000, license: 'ISC', description: 'Authentication for the web' },
      { name: 'Lucia', url: 'https://github.com/lucia-auth/lucia', stars: 8000, license: 'MIT', description: 'Authentication, simple and clean' },
      { name: 'Clerk', url: 'https://github.com/clerk/javascript', stars: 5000, license: 'MIT', description: 'The most comprehensive User Management Platform' },
      { name: 'Supabase Auth', url: 'https://github.com/supabase/auth', stars: 2000, license: 'Apache-2.0', description: 'Supabase Auth' },
      { name: 'Firebase Auth', url: 'https://github.com/firebase/firebase-ios-sdk', stars: 5000, license: 'Apache-2.0', description: 'Firebase SDK' },
      { name: 'Keycloak', url: 'https://github.com/keycloak/keycloak', stars: 20000, license: 'Apache-2.0', description: 'Open Source Identity and Access Management' },
      { name: 'Auth0', url: 'https://github.com/auth0/node-auth0', stars: 5000, license: 'MIT', description: 'Node.js SDK for Auth0' }
    ]
  },
  api: {
    repos: [
      { name: 'Express', url: 'https://github.com/expressjs/express', stars: 65000, license: 'MIT', description: 'Fast, unopinionated, minimalist web framework for Node.js' },
      { name: 'Fastify', url: 'https://github.com/fastify/fastify', stars: 32000, license: 'MIT', description: 'Fast and low overhead web framework for Node.js' },
      { name: 'NestJS', url: 'https://github.com/nestjs/nest', stars: 68000, license: 'MIT', description: 'A progressive Node.js framework' },
      { name: 'Hono', url: 'https://github.com/honojs/hono', stars: 20000, license: 'MIT', description: 'Ultrafast web framework for the Edges' },
      { name: 'tRPC', url: 'https://github.com/trpc/trpc', stars: 35000, license: 'MIT', description: 'End-to-end typesafe APIs made easy' },
      { name: 'Strapi', url: 'https://github.com/strapi/strapi', stars: 60000, license: 'MIT', description: 'The leading open-source headless CMS' },
      { name: 'Hasura', url: 'https://github.com/hasura/graphql-engine', stars: 30000, license: 'Apache-2.0', description: 'Blazingly fast, instant realtime GraphQL APIs' },
      { name: 'PostgREST', url: 'https://github.com/PostgREST/postgrest', stars: 23000, license: 'MIT', description: 'REST API for any Postgres database' },
      { name: 'Prisma', url: 'https://github.com/prisma/prisma', stars: 40000, license: 'Apache-2.0', description: 'Next-generation ORM for Node.js and TypeScript' }
    ]
  },
  ui: {
    repos: [
      { name: 'shadcn/ui', url: 'https://github.com/shadcn-ui/ui', stars: 75000, license: 'MIT', description: 'Beautifully designed components built with Radix UI and Tailwind CSS' },
      { name: 'Radix UI', url: 'https://github.com/radix-ui/primitives', stars: 15000, license: 'MIT', description: 'Unstyled, accessible components for building design systems' },
      { name: 'Headless UI', url: 'https://github.com/tailwindlabs/headlessui', stars: 25000, license: 'MIT', description: 'Completely unstyled, fully accessible UI components' },
      { name: 'Chakra UI', url: 'https://github.com/chakra-ui/chakra-ui', stars: 35000, license: 'MIT', description: 'Simple, Modular & Accessible UI Components for React' },
      { name: 'Mantine', url: 'https://github.com/mantinedev/mantine', stars: 25000, license: 'MIT', description: 'React components library with native dark theme support' },
      { name: 'Ant Design', url: 'https://github.com/ant-design/ant-design', stars: 90000, license: 'MIT', description: 'An enterprise-class UI design language and React UI library' },
      { name: 'Material UI', url: 'https://github.com/mui/material-ui', stars: 93000, license: 'MIT', description: 'React UI component library' },
      { name: 'NextUI', url: 'https://github.com/nextui-org/nextui', stars: 22000, license: 'MIT', description: 'Beautiful, fast and modern React UI library' },
      { name: 'Park UI', url: 'https://github.com/cschroeter/park-ui', stars: 3000, license: 'MIT', description: 'Beautifully designed components built with Ark UI and Panda CSS' }
    ]
  },
  billing: {
    repos: [
      { name: 'Stripe Node', url: 'https://github.com/stripe/stripe-node', stars: 37000, license: 'MIT', description: 'The Stripe Node.js library' },
      { name: 'Lemon Squeezy', url: 'https://github.com/lemonsqueezy/lemonsqueezy.js', stars: 500, license: 'MIT', description: 'Lemon Squeezy API client for JavaScript' },
      { name: 'Paddle', url: 'https://github.com/PaddleHQ/paddle-node', stars: 200, license: 'MIT', description: 'Paddle API client for Node.js' },
      { name: 'Chargebee', url: 'https://github.com/chargebee/chargebee-node', stars: 100, license: 'MIT', description: 'Chargebee API client for Node.js' },
      { name: 'Recurly', url: 'https://github.com/recurly/recurly-client-node', stars: 100, license: 'MIT', description: 'Recurly API client for Node.js' },
      { name: 'Billing.js', url: 'https://github.com/nicholasgasior/billing.js', stars: 50, license: 'MIT', description: 'Simple billing library' },
      { name: 'PayPal SDK', url: 'https://github.com/paypal/PayPal-node-SDK', stars: 1000, license: 'Apache-2.0', description: 'PayPal SDK for Node.js' },
      { name: 'Square SDK', url: 'https://github.com/square/square-nodejs-sdk', stars: 300, license: 'MIT', description: 'Square SDK for Node.js' },
      { name: 'Braintree', url: 'https://github.com/braintree/braintree_node', stars: 400, license: 'MIT', description: 'Braintree API client for Node.js' }
    ]
  },
  permissions: {
    repos: [
      { name: 'CASL', url: 'https://github.com/stalniy/casl', stars: 6000, license: 'MIT', description: 'Isomorphic authorization library for managing roles and permissions' },
      { name: 'AccessControl', url: 'https://github.com/onury/AccessControl', stars: 2500, license: 'MIT', description: 'Role and Attribute-based Access Control for Node.js' },
      { name: 'RBAC', url: 'https://github.com/otavio-sf/rbac', stars: 200, license: 'MIT', description: 'Role Based Access Control for Node.js' },
      { name: 'Node ACL', url: 'https://github.com/optimalboost/node-acl', stars: 2500, license: 'MIT', description: 'An ACL (access control list) implementation for Node.js' },
      { name: 'Casbin', url: 'https://github.com/casbin/node-casbin', stars: 2500, license: 'Apache-2.0', description: 'An authorization library that supports various access control models' },
      { name: 'Permify', url: 'https://github.com/Permify/permify', stars: 3000, license: 'Apache-2.0', description: 'Open source authorization service' },
      { name: 'Open Policy Agent', url: 'https://github.com/open-policy-agent/opa', stars: 9000, license: 'Apache-2.0', description: 'Open Policy Agent (OPA) is a general-purpose policy engine' },
      { name: 'SpiceDB', url: 'https://github.com/authzed/spicedb', stars: 4000, license: 'Apache-2.0', description: 'Open source permissions database' },
      { name: 'Oso', url: 'https://github.com/osohq/oso', stars: 1500, license: 'Apache-2.0', description: 'A general-purpose authorization library' }
    ]
  }
};

/**
 * Get utilities by category
 * @param {string} category - Category name
 * @returns {Array} Repos in category
 */
function getUtilitiesByCategory(category) {
  return UTILITY_CATALOG[category]?.repos || [];
}

/**
 * Get utility by name
 * @param {string} name - Utility name
 * @returns {Object|null} Utility object or null
 */
function getUtilityByName(name) {
  for (const category of Object.values(UTILITY_CATALOG)) {
    const found = category.repos.find(repo => repo.name === name);
    if (found) return found;
  }
  return null;
}

module.exports = { UTILITY_CATALOG, getUtilitiesByCategory, getUtilityByName };
