const handler = (args, state) => {
  console.log('\n  \u2550\u2550\u2550 /vibe:design \u2014 UI Generation & Approval \u2550\u2550\u2550\n');
  console.log('  Generates UI screens via Stitch MCP.');
  console.log('  Pipeline: generate-ui \u2192 preview \u2192 iterate \u2192 approve');
  console.log('\n  \x1b[2mRequires Stitch API key and has_ui=true in stack.\x1b[0m\n');
  return { status: 'reference' };
};

module.exports = { handler };
