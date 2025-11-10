#!/usr/bin/env python3
"""
Simple Website Builder MCP Server
Like the Zapier example but for our component system.
"""

import asyncio
import json
from typing import Optional

from fastmcp import FastMCP
from fastmcp.client.transports import StreamableHttpTransport

# Initialize FastMCP server
mcp = FastMCP(name="Website Builder")

# Sample component data
COMPONENTS = [
    {
        "id": "hero-section-001",
        "name": "Hero Section",
        "category": "sections",
        "description": "A prominent hero section with title and call-to-action",
        "tags": ["hero", "landing", "call-to-action"],
        "props": ["title", "subtitle", "buttonText", "backgroundImage"]
    },
    {
        "id": "navbar-001",
        "name": "Navigation Bar",
        "category": "navigation",
        "description": "Responsive navigation bar with logo and menu items",
        "tags": ["navigation", "header", "menu", "responsive"],
        "props": ["brandName", "logoUrl", "menuItems"]
    }
]

@mcp.tool()
async def list_components(category: Optional[str] = None):
    """
    List all available components, optionally filtered by category.

    Args:
        category: Optional category filter (e.g., 'sections', 'navigation')

    Returns:
        List of component summaries
    """
    components = COMPONENTS

    if category:
        components = [c for c in components if c["category"] == category]

    return components

@mcp.tool()
async def get_component(component_id: str) -> dict:
    """
    Get detailed information about a specific component.

    Args:
        component_id: The unique identifier of the component

    Returns:
        Component details
    """
    component = next((c for c in COMPONENTS if c["id"] == component_id), None)

    if not component:
        return {"error": f"Component {component_id} not found"}

    return component

@mcp.tool()
async def search_components(query: str) -> list:
    """
    Search components by name, description, or tags.

    Args:
        query: Search query string

    Returns:
        List of matching components
    """
    query_lower = query.lower()
    matching_components = []

    for component in COMPONENTS:
        if (query_lower in component["name"].lower() or
            query_lower in component["description"].lower() or
            any(query_lower in tag.lower() for tag in component["tags"])):
            matching_components.append(component)

    return matching_components

if __name__ == "__main__":
    import sys

    # Check if we should run with stdio (for testing) or sse
    if len(sys.argv) > 1 and sys.argv[1] == "--stdio":
        # Run with stdio transport for testing
        mcp.run(transport="stdio")
    else:
        # Run the MCP server with SSE transport
        mcp.run(
            transport="sse",
            host="127.0.0.1",
            port=8000
        )
