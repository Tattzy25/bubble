# Website Builder Editor - Implementation Plan

## Overview
Create a drag-and-drop website builder that exposes thousands of components via a simple Python MCP server with SSE transport. Components are pre-built and hosted externally - we only create the editor interface and component registry.

## Architecture
- **Backend**: Python MCP server using FastMCP with SSE transport
- **Frontend**: Simple HTML/CSS/JS editor with drag-and-drop
- **Components**: External registry of pre-built components (user provides)
- **Storage**: Auto-save to project files when editor mode disabled

## Detailed To-Do Checklist

### Phase 1: Core Infrastructure
- [x] Set up Python project structure with proper imports/exports
- [x] Install FastMCP and required dependencies
- [x] Create basic MCP server with SSE transport on configurable port
- [x] Implement component registry system (JSON-based catalog)
- [x] Create dynamic tool generation for component exposure

### Phase 2: Component Registry System
- [ ] Design component metadata structure (name, category, props, HTML)
- [ ] Implement component loader from external sources
- [ ] Create component validation and caching system
- [ ] Build component search and filtering capabilities
- [ ] Add component versioning and update mechanisms

### Phase 3: MCP Server Tools
- [x] `list_components` - Return all available components by category
- [x] `get_component` - Fetch specific component details and HTML
- [x] `search_components` - Find components by name/description
- [x] `add_to_page` - Tool for adding components to current page
- [x] `update_component_props` - Modify component properties
- [x] `remove_component` - Remove component from page

### Phase 4: Web Editor Interface
- [x] Create minimal HTML editor with drag-drop zones
- [x] Implement component palette/sidebar
- [x] Add page canvas with section-based layout
- [x] Create floating bubble widget for quick component access
- [x] Implement real-time preview mode

### Phase 5: Drag & Drop Functionality
- [ ] HTML5 drag-drop API integration
- [ ] Component instantiation on drop
- [ ] Position management and snapping
- [ ] Section navigation and organization
- [ ] Undo/redo functionality

### Phase 6: Auto-Save System
- [ ] File system watcher for project directory
- [ ] Auto-save on editor mode toggle
- [ ] Generate clean HTML/CSS/JS output files
- [ ] Preserve component relationships and hierarchy
- [ ] Backup and versioning system

### Phase 7: Real-Time Updates
- [ ] SSE integration for live component updates
- [ ] Real-time collaboration support (optional)
- [ ] Component hot-reloading from registry
- [ ] Live preview synchronization

### Phase 8: Production Polish
- [ ] Error handling and validation
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation and examples
- [ ] Docker containerization for easy deployment

## Technical Specifications

### Component Registry Format
```json
{
  "components": [
    {
      "id": "hero-section-001",
      "name": "Hero Section",
      "category": "sections",
      "html": "<div class='hero'>...</div>",
      "css": ".hero { ... }",
      "js": "function initHero() { ... }",
      "props": {
        "title": "string",
        "subtitle": "string",
        "backgroundImage": "url"
      },
      "dependencies": ["bootstrap", "jquery"]
    }
  ]
}
```

### MCP Tool Schema
- Tools dynamically generated from component registry
- Each component becomes a tool with configurable props
- Tools return HTML snippets for editor integration

### File Output Structure
```
project/
├── index.html (generated)
├── styles.css (generated)
├── script.js (generated)
├── components.json (registry cache)
└── assets/ (copied resources)
```

## Success Criteria
- [ ] Single command startup: `python server.py`
- [ ] Web editor accessible at `http://localhost:8000/editor`
- [ ] Components load from external registry
- [ ] Drag-drop functionality works smoothly
- [ ] Auto-save generates production-ready files
- [ ] MCP clients can connect and use component tools
- [ ] No code generation - pure component assembly
- [ ] Horizontal scalability for thousands of components
