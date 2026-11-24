const templates = Object.freeze([
  'validator', 'zod', 'database', 'redis', 'auth', 'rabbitmq', 'websocket', 'socketio', 'nacos'
]);
const devtools = Object.freeze(['jest', 'pkg', 'pm2', 'eslint', 'babel']);

function normalizeSelection(names, choices, transport = 'websocket') {
  const selected = [...new Set(names)];
  if (selected.includes('None') || selected.includes('All')) {
    if (selected.length !== 1) {
      throw new Error('Choose None or All on its own.');
    }
    if (selected[0] === 'None') return [];
    if (!choices.includes('websocket')) return [...choices];
    if (!['websocket', 'socketio'].includes(transport)) {
      throw new Error('Choose WebSocket or Socket.IO for the HTTP server.');
    }
    return choices.filter(name => !['websocket', 'socketio'].includes(name) || name === transport);
  }
  for (const name of selected) {
    if (!choices.includes(name)) throw new Error(`Unknown selection ${name}.`);
  }
  if (selected.includes('websocket') && selected.includes('socketio')) {
    throw new Error('Choose either websocket or socketio.');
  }
  return selected;
}

function selectionValidator(choices) {
  return names => {
    try {
      normalizeSelection(names, choices);
      return true;
    } catch (error) {
      return error.message;
    }
  };
}

module.exports = { templates, devtools, normalizeSelection, selectionValidator };
