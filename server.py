#!/usr/bin/env python3
"""
Website Builder MCP Server
Exposes thousands of UI components via Model Context Protocol with SSE transport.
Components are pre-built and loaded from external registries.
"""

import asyncio
import json
import logging
import os
import uuid
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime

from fastmcp import FastMCP
from pydantic import BaseModel, Field, ValidationError
import uvicorn
import aiofiles
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Configuration
class Config:
    PORT = int(os.getenv("MCP_PORT", "8000"))
    HOST = os.getenv("MCP_HOST", "127.0.0.1")
    COMPONENT_REGISTRY_URL = os.getenv("COMPONENT_REGISTRY_URL", "")
    PROJECT_DIR = Path(os.getenv("PROJECT_DIR", "./project"))
    COMPONENTS_CACHE_FILE = PROJECT_DIR / "components-cache.json"


# Component Models
class ComponentProp(BaseModel):
    name: str
    type: str
    default: Optional[Any] = None
    required: bool = False
    description: Optional[str] = None


class Component(BaseModel):
    id: str
    name: str
    category: str
    html: str
    css: Optional[str] = None
    js: Optional[str] = None
    props: Dict[str, ComponentProp] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    version: str = "1.0.0"
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class ComponentRegistry(BaseModel):
    components: List[Component] = Field(default_factory=list)
    last_updated: Optional[datetime] = None
    version: str = "1.0.0"


# Global state
component_registry = ComponentRegistry()
active_projects: Dict[str, Dict] = {}  # project_id -> project_data


# Initialize FastMCP server
mcp = FastMCP(
    name="Website Builder"
)


# Component Registry Management
async def load_component_registry() -> ComponentRegistry:
    """Load component registry from cache or external source."""
    global component_registry

    # Try to load from cache first
    if Config.COMPONENTS_CACHE_FILE.exists():
        try:
            async with aiofiles.open(Config.COMPONENTS_CACHE_FILE, 'r') as f:
                data = json.loads(await f.read())
                component_registry = ComponentRegistry(**data)
                print(f"Loaded {len(component_registry.components)} components from cache")
                return component_registry
        except Exception as e:
            print(f"Failed to load cache: {e}")

    # Load from external registry URL (placeholder for now)
    if Config.COMPONENT_REGISTRY_URL:
        # TODO: Implement external registry loading
        print(f"Would load from: {Config.COMPONENT_REGISTRY_URL}")
    else:
        # Load sample components for development
        await load_sample_components()

    return component_registry


async def load_sample_components():
    """Load sample components for development and testing."""
    global component_registry

    sample_components = [
        Component(
            id="hero-section-001",
            name="Hero Section",
            category="sections",
            description="A prominent hero section with title and call-to-action",
            html="""
<div class="hero-section">
    <div class="hero-content">
        <h1>{{title}}</h1>
        <p>{{subtitle}}</p>
        <button class="cta-button">{{buttonText}}</button>
    </div>
    <div class="hero-background" style="background-image: url('{{backgroundImage}}')"></div>
</div>
            """.strip(),
            css="""
.hero-section {
    position: relative;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.hero-content {
    text-align: center;
    z-index: 2;
    color: white;
    max-width: 600px;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.cta-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.cta-button:hover {
    background: #0056b3;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: 1;
}

.hero-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
}
            """.strip(),
            props={
                "title": ComponentProp(name="title", type="string", default="Welcome", required=True),
                "subtitle": ComponentProp(name="subtitle", type="string", default="Your amazing subtitle here", required=False),
                "buttonText": ComponentProp(name="buttonText", type="string", default="Get Started", required=False),
                "backgroundImage": ComponentProp(name="backgroundImage", type="url", default="", required=False)
            },
            tags=["hero", "landing", "call-to-action"]
        ),
        Component(
            id="navbar-001",
            name="Navigation Bar",
            category="navigation",
            description="Responsive navigation bar with logo and menu items",
            html="""
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <img src="{{logoUrl}}" alt="{{brandName}}" />
        </div>
        <ul class="nav-menu">
            {{menuItems}}
        </ul>
        <div class="nav-toggle">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
</nav>
            """.strip(),
            css="""
.navbar {
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
}

.nav-logo img {
    height: 40px;
    width: auto;
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-menu li {
    margin: 0 1rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #007bff;
}

.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.nav-toggle span {
    width: 25px;
    height: 3px;
    background: #333;
    margin: 3px 0;
    transition: 0.3s;
}

@media (max-width: 768px) {
    .nav-menu {
        display: none;
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        background: white;
        flex-direction: column;
        padding: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-menu.active {
        display: flex;
    }

    .nav-menu li {
        margin: 0.5rem 0;
        text-align: center;
    }

    .nav-toggle {
        display: flex;
    }
}
            """.strip(),
            js=r"""
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});
            """.strip(),
            props={
                "brandName": ComponentProp(name="brandName", type="string", default="My Brand", required=True),
                "logoUrl": ComponentProp(name="logoUrl", type="url", default="", required=False),
                "menuItems": ComponentProp(name="menuItems", type="html", default='<li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li>', required=False)
            },
            tags=["navigation", "header", "menu", "responsive"]
        )
    ]

    component_registry.components = sample_components
    component_registry.last_updated = datetime.now()

    # Save to cache
    Config.PROJECT_DIR.mkdir(exist_ok=True)
    async with aiofiles.open(Config.COMPONENTS_CACHE_FILE, 'w') as f:
        await f.write(component_registry.model_dump_json(indent=2))

    print(f"Loaded {len(sample_components)} sample components")


# MCP Tools
@mcp.tool()
async def list_components(category: Optional[str] = None) -> List[Dict]:
    """
    List all available components, optionally filtered by category.

    Args:
        category: Optional category filter (e.g., 'sections', 'navigation')

    Returns:
        List of component summaries
    """
    components = component_registry.components

    if category:
        components = [c for c in components if c.category == category]

    return [
        {
            "id": c.id,
            "name": c.name,
            "category": c.category,
            "description": c.description,
            "tags": c.tags,
            "props": list(c.props.keys())
        }
        for c in components
    ]


@mcp.tool()
async def get_component(component_id: str) -> Optional[Dict]:
    """
    Get detailed information about a specific component.

    Args:
        component_id: The unique identifier of the component

    Returns:
        Component details including HTML, CSS, JS, and props
    """
    component = next((c for c in component_registry.components if c.id == component_id), None)

    if not component:
        return None

    return {
        "id": component.id,
        "name": component.name,
        "category": component.category,
        "description": component.description,
        "html": component.html,
        "css": component.css,
        "js": component.js,
        "props": {k: v.model_dump() for k, v in component.props.items()},
        "dependencies": component.dependencies,
        "version": component.version,
        "tags": component.tags
    }


@mcp.tool()
async def search_components(query: str) -> List[Dict]:
    """
    Search components by name, description, or tags.

    Args:
        query: Search query string

    Returns:
        List of matching components
    """
    query_lower = query.lower()
    matching_components = []

    for component in component_registry.components:
        if (query_lower in component.name.lower() or
            query_lower in (component.description or "").lower() or
            any(query_lower in tag.lower() for tag in component.tags)):
            matching_components.append({
                "id": component.id,
                "name": component.name,
                "category": component.category,
                "description": component.description,
                "tags": component.tags
            })

    return matching_components


@mcp.tool()
async def create_project(project_name: str) -> str:
    """
    Create a new website project.

    Args:
        project_name: Name of the project

    Returns:
        Project ID for future operations
    """
    project_id = str(uuid.uuid4())
    project_dir = Config.PROJECT_DIR / project_name
    project_dir.mkdir(parents=True, exist_ok=True)

    active_projects[project_id] = {
        "id": project_id,
        "name": project_name,
        "path": str(project_dir),
        "components": [],
        "created_at": datetime.now().isoformat()
    }

    return project_id


@mcp.tool()
async def add_component_to_project(
    project_id: str,
    component_id: str,
    props: Optional[Dict[str, Any]] = None,
    section: str = "main"
) -> Dict:
    """
    Add a component to a project page.

    Args:
        project_id: The project ID
        component_id: The component to add
        props: Component properties to customize
        section: Page section to add to

    Returns:
        Component instance details
    """
    if project_id not in active_projects:
        raise ValueError(f"Project {project_id} not found")

    component = next((c for c in component_registry.components if c.id == component_id), None)
    if not component:
        raise ValueError(f"Component {component_id} not found")

    # Validate props
    validated_props = {}
    props = props or {}  # Ensure props is a dict, not None
    for prop_name, prop_config in component.props.items():
        if prop_name in props:
            validated_props[prop_name] = props[prop_name]
        elif prop_config.required:
            raise ValueError(f"Required prop '{prop_name}' not provided")
        else:
            validated_props[prop_name] = prop_config.default

    component_instance = {
        "id": str(uuid.uuid4()),
        "component_id": component_id,
        "section": section,
        "props": validated_props,
        "added_at": datetime.now().isoformat()
    }

    active_projects[project_id]["components"].append(component_instance)

    return component_instance


@mcp.tool()
async def generate_project_html(project_id: str) -> str:
    """
    Generate HTML output for a project.

    Args:
        project_id: The project ID

    Returns:
        Generated HTML content
    """
    if project_id not in active_projects:
        raise ValueError(f"Project {project_id} not found")

    project = active_projects[project_id]
    if not project:
        raise ValueError(f"Project {project_id} data is invalid")
    components = []

    # Collect all components used in the project
    for comp_instance in project["components"]:
        component = next((c for c in component_registry.components if c.id == comp_instance["component_id"]), None)
        if component:
            # Apply props to HTML template
            html = component.html
            for prop_name, prop_value in comp_instance["props"].items():
                html = html.replace(f"{{{{{prop_name}}}}}", str(prop_value))

            components.append({
                "instance": comp_instance,
                "component": component,
                "rendered_html": html
            })

    # Group by sections
    sections = {}
    for comp in components:
        section = comp["instance"]["section"]
        if section not in sections:
            sections[section] = []
        sections[section].append(comp)

    # Generate HTML
    html_parts = [
        "<!DOCTYPE html>",
        "<html lang=\"en\">",
        "<head>",
        "    <meta charset=\"UTF-8\">",
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
        f"    <title>{project['name']}</title>",
        "    <style>",
        "        body { margin: 0; font-family: Arial, sans-serif; }",
        "        .section { min-height: 100vh; }",
        "    </style>"
    ]

    # Add component CSS
    css_added = set()
    for comp in components:
        if comp["component"].css and comp["component"].css not in css_added:
            html_parts.append(f"    <style>{comp['component'].css}</style>")
            css_added.add(comp["component"].css)

    html_parts.extend([
        "</head>",
        "<body>"
    ])

    # Add sections
    for section_name, section_components in sections.items():
        html_parts.append(f"    <section class=\"section\" id=\"{section_name}\">")
        for comp in section_components:
            html_parts.append(f"        {comp['rendered_html']}")
        html_parts.append("    </section>")

    # Add component JS
    js_added = set()
    for comp in components:
        if comp["component"].js and comp["component"].js not in js_added:
            html_parts.append(f"    <script>{comp['component'].js}</script>")
            js_added.add(comp["component"].js)

    html_parts.extend([
        "</body>",
        "</html>"
    ])

    return "\n".join(html_parts)


# FastAPI app for web editor
app = FastAPI(title="Website Builder", description="Visual website builder with MCP backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=".", html=True), name="static")

# HTTP Routes for Web Editor
@app.get("/editor")
async def get_editor():
    """Serve the web editor interface."""
    try:
        with open("editor.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content, media_type="text/html")
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Editor not found</h1>", status_code=404)

@app.get("/list_components")
async def http_list_components(category: Optional[str] = None):
    """HTTP endpoint for listing components."""
    components = component_registry.components

    if category:
        components = [c for c in components if c.category == category]

    return [
        {
            "id": c.id,
            "name": c.name,
            "category": c.category,
            "description": c.description,
            "tags": c.tags,
            "props": list(c.props.keys())
        }
        for c in components
    ]

@app.post("/create_project")
async def http_create_project(request: Request):
    """HTTP endpoint for creating projects."""
    data = await request.json()
    project_name = data.get("project_name", f"Project_{int(asyncio.get_event_loop().time())}")

    project_id = str(uuid.uuid4())
    project_dir = Config.PROJECT_DIR / project_name
    project_dir.mkdir(parents=True, exist_ok=True)

    active_projects[project_id] = {
        "id": project_id,
        "name": project_name,
        "path": str(project_dir),
        "components": [],
        "created_at": datetime.now().isoformat()
    }

    return project_id

@app.post("/add_component_to_project")
async def http_add_component_to_project(request: Request):
    """HTTP endpoint for adding components to projects."""
    data = await request.json()
    project_id = data["project_id"]
    component_id = data["component_id"]
    props = data.get("props")
    section = data.get("section", "main")

    if project_id not in active_projects:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    component = next((c for c in component_registry.components if c.id == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail=f"Component {component_id} not found")

    # Validate props
    validated_props = {}
    props = props or {}  # Ensure props is a dict, not None
    for prop_name, prop_config in component.props.items():
        if prop_name in props:
            validated_props[prop_name] = props[prop_name]
        elif prop_config.required:
            raise HTTPException(status_code=400, detail=f"Required prop '{prop_name}' not provided")
        else:
            validated_props[prop_name] = prop_config.default

    component_instance = {
        "id": str(uuid.uuid4()),
        "component_id": component_id,
        "section": section,
        "props": validated_props,
        "added_at": datetime.now().isoformat()
    }

    active_projects[project_id]["components"].append(component_instance)

    return component_instance

@app.post("/generate_project_html")
async def http_generate_project_html(request: Request):
    """HTTP endpoint for generating project HTML."""
    data = await request.json()
    project_id = data["project_id"]

    if project_id not in active_projects:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    project = active_projects[project_id]
    components = []

    # Collect all components used in the project
    for comp_instance in project["components"]:
        component = next((c for c in component_registry.components if c.id == comp_instance["component_id"]), None)
        if component:
            # Apply props to HTML template
            html = component.html
            for prop_name, prop_value in comp_instance["props"].items():
                html = html.replace(f"{{{{{prop_name}}}}}", str(prop_value))

            components.append({
                "instance": comp_instance,
                "component": component,
                "rendered_html": html
            })

    # Group by sections
    sections = {}
    for comp in components:
        section = comp["instance"]["section"]
        if section not in sections:
            sections[section] = []
        sections[section].append(comp)

    # Generate HTML
    html_parts = [
        "<!DOCTYPE html>",
        "<html lang=\"en\">",
        "<head>",
        "    <meta charset=\"UTF-8\">",
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
        f"    <title>{project['name']}</title>",
        "    <style>",
        "        body { margin: 0; font-family: Arial, sans-serif; }",
        "        .section { min-height: 100vh; }",
        "    </style>"
    ]

    # Add component CSS
    css_added = set()
    for comp in components:
        if comp["component"].css and comp["component"].css not in css_added:
            html_parts.append(f"    <style>{comp['component'].css}</style>")
            css_added.add(comp["component"].css)

    html_parts.extend([
        "</head>",
        "<body>"
    ])

    # Add sections
    for section_name, section_components in sections.items():
        html_parts.append(f"    <section class=\"section\" id=\"{section_name}\">")
        for comp in section_components:
            html_parts.append(f"        {comp['rendered_html']}")
        html_parts.append("    </section>")

    # Add component JS
    js_added = set()
    for comp in components:
        if comp["component"].js and comp["component"].js not in js_added:
            html_parts.append(f"    <script>{comp['component'].js}</script>")
            js_added.add(comp["component"].js)

    html_parts.extend([
        "</body>",
        "</html>"
    ])

    html = "\n".join(html_parts)
    return {"html": html}

async def main():
    """Main server startup function."""
    print("🚀 Starting Website Builder MCP Server...")

    # Load component registry
    await load_component_registry()

    # Start both MCP server and FastAPI app
    print(f"📡 Server starting on {Config.HOST}:{Config.PORT}")
    print(f"🌐 Web editor available at: http://{Config.HOST}:{Config.PORT}/editor")
    print(f"🔧 MCP SSE endpoint: http://{Config.HOST}:{Config.PORT}/sse")

    # Run both servers concurrently
    import threading
    from uvicorn import Config as UvicornConfig, Server

    # Start FastAPI server in a separate thread
    def run_fastapi():
        uvicorn_config = UvicornConfig(
            app=app,
            host=Config.HOST,
            port=Config.PORT + 1,  # Different port for HTTP API
            log_level="info"
        )
        server = Server(uvicorn_config)
        asyncio.run(server.serve())

    fastapi_thread = threading.Thread(target=run_fastapi, daemon=True)
    fastapi_thread.start()

    # Start MCP server
    mcp.run(
        transport="sse",
        host=Config.HOST,
        port=Config.PORT
    )


if __name__ == "__main__":
    asyncio.run(main())
