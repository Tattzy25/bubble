# Website Builder MCP Server

A drag-and-drop website builder that exposes thousands of pre-built UI components via Model Context Protocol (MCP) with Server-Sent Events (SSE) transport.

## Features

- **Visual Drag & Drop Editor**: Build websites by dragging components onto a canvas
- **Component Registry**: Unified catalog of components from multiple libraries (shadcn/ui, Magic UI, etc.)
- **MCP Integration**: Expose components as tools for AI assistants and other clients
- **Real-time Collaboration**: SSE-powered live updates
- **No Code Generation**: Pure component assembly from pre-built libraries
- **Multi-Framework Support**: React, Vue, Angular, and vanilla HTML/CSS/JS

## Architecture

- **Backend**: Python MCP server with FastMCP + FastAPI
- **Frontend**: HTML5 drag-and-drop editor with real-time canvas
- **Components**: JSON-based registry with 60+ libraries (2000+ components)
- **Transport**: SSE for real-time updates, HTTP REST API for editor

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python server.py
```

### 3. Open the Editor
Navigate to: `http://localhost:8001/editor`

## Usage

### Visual Editor
1. **Browse Components**: Use the sidebar or floating bubble to explore components
2. **Drag & Drop**: Drag components onto the canvas sections
3. **Customize**: Edit component properties in real-time
4. **Save Project**: Generate production-ready HTML/CSS/JS files

### MCP Integration
The server exposes components as MCP tools that other clients can use:

```python
# List all components
components = await mcp.call("list_components")

# Add component to project
await mcp.call("add_component_to_project", {
    "project_id": "my-project",
    "component_id": "hero-section-001",
    "props": {"title": "Welcome!"}
})
```

## Component Registry

Currently includes sample components. To add your own:

1. **Update `components.json`** with registry URLs
2. **Add component definitions** following the schema
3. **Restart server** to load new components

### Component Schema
```json
{
  "id": "unique-component-id",
  "name": "Component Name",
  "category": "sections|navigation|buttons|forms",
  "description": "Component description",
  "html": "<div class='component'>{{propName}}</div>",
  "css": ".component { styles }",
  "js": "console.log('init');",
  "props": {
    "propName": {
      "name": "propName",
      "type": "string",
      "default": "default value",
      "required": true
    }
  },
  "tags": ["tag1", "tag2"],
  "dependencies": ["react", "styled-components"]
}
```

## API Endpoints

### MCP Tools (SSE Transport)
- `list_components(category?)` - List available components
- `get_component(component_id)` - Get component details
- `search_components(query)` - Search components
- `create_project(project_name)` - Create new project
- `add_component_to_project(project_id, component_id, props?, section?)` - Add component
- `generate_project_html(project_id)` - Generate HTML output

### HTTP REST API (Port 8001)
- `GET /editor` - Web editor interface
- `GET /list_components?category=sections` - List components
- `POST /create_project` - Create project
- `POST /add_component_to_project` - Add component to project
- `POST /generate_project_html` - Generate project HTML

## Configuration

### Environment Variables
```bash
MCP_PORT=8000              # MCP server port
MCP_HOST=127.0.0.1         # Server host
COMPONENT_REGISTRY_URL=""   # External registry URL
PROJECT_DIR="./project"     # Project storage directory
```

### Registry Configuration
Edit `components.json` to add component registries:

```json
{
  "registries": {
    "@shadcnblocks": "https://api.shadcnblocks.com/r/{name}.json",
    "@magicui": "https://api.magicui.com/components/{name}.json"
  }
}
```

## Development

### Project Structure
```
website-builder-mcp/
├── server.py              # Main MCP server
├── editor.html            # Web editor interface
├── components.json        # Registry configuration
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── project/              # Generated projects
    ├── components-cache.json
    └── [project-name]/
        ├── index.html
        ├── styles.css
        └── script.js
```

### Adding New Components

1. **Create component files** in your registry
2. **Update registry configuration** in `components.json`
3. **Restart server** to reload components
4. **Test in editor** by dragging components

### Extending the Editor

The editor is built with vanilla JavaScript and can be extended:

- **Custom component renderers** for different frameworks
- **Advanced drag-drop features** (snapping, alignment)
- **Real-time collaboration** via WebSockets
- **Component property editors** with live preview

## Integration Examples

### VS Code Extension
```typescript
// Connect to MCP server
const mcpClient = new MCPClient('http://localhost:8000');

// Get components for IntelliSense
const components = await mcpClient.call('list_components');

// Insert component on command
await mcpClient.call('add_component_to_project', {
    project_id: workspace.projectId,
    component_id: selectedComponent
});
```

### AI Assistant Integration
```python
# Claude/GPT can now use components
response = await ai.chat("Add a hero section to my website", {
    tools: mcp_tools  # Component tools available
});
```

## Roadmap

- [ ] Multi-registry support (60+ libraries from CSV)
- [ ] Framework-specific component variants (React/Vue/Angular)
- [ ] Advanced drag-drop features (grid snapping, alignment)
- [ ] Real-time collaboration
- [ ] Component marketplace
- [ ] Export to frameworks (Next.js, Nuxt, etc.)
- [ ] Theme customization
- [ ] Component versioning
- [ ] Performance optimization

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Add** components or features
4. **Test** thoroughly
5. **Submit** a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This README

---

**Built with ❤️ using Model Context Protocol**
