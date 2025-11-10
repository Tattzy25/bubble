#!/usr/bin/env python3
"""
Simple Website Builder MCP Server
Like the Zapier example but for our component system.
"""

import asyncio
import json
import os
from typing import Optional
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastmcp import FastMCP

# Initialize FastAPI for health checks and HTTP endpoints
app = FastAPI(title="Website Builder MCP Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# HTTP Endpoints for health checks and Railway compatibility
@app.get("/health")
async def health_check():
    """Simple health check endpoint for Railway - returns 200 OK"""
    return {"status": "ok"}

@app.head("/health")
async def health_check_head():
    """HEAD request support for health checks"""
    return {"status": "ok"}

@app.post("/list_components")
async def http_list_components(category: Optional[str] = None):
    """HTTP endpoint for listing components"""
    try:
        components = COMPONENTS
        if category:
            components = [c for c in components if c["category"] == category]

        return {
            "status": "success",
            "count": len(components),
            "components": components
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Website Builder MCP Server",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "list_components": "/list_components (POST)",
            "mcp_sse": "/sse"
        }
    }

if __name__ == "__main__":
    import sys

    # Railway assigns a port via PORT environment variable
    # Default to 8000 for local development
    port = int(os.getenv("PORT", 8000))

    print(f"Starting server on port {port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"Components API: http://localhost:{port}/list_components")

    # Run FastAPI server with HTTP endpoints for Railway compatibility
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
