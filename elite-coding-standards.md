## Brief overview
This rule establishes comprehensive coding standards and development principles for elite-level software development. All code must be production-grade, modular, and horizontally scalable with strict adherence to best practices and partnership principles.

## File and Folder Naming
- **Use kebab-case exclusively** for all file and folder names (e.g., `user-controller.js`, `auth-service.ts`)
- **Verify necessity** before creating any new file or folder - avoid redundancy and duplication
- **Descriptive and concise** names that accurately reflect content and purpose

## Code Quality Standards
- **Never create HTML components** without explicit instruction
- **Never write fake code** or mock implementations unless specifically requested
- **Never use silent fallbacks** - all error states must be handled explicitly
- **Production-ready only** - modular, scalable, and horizontally scalable code
- **Dynamic values only** - no hardcoded data or configurations

## Environmental Variables
- **Never blame environment variables** for errors or issues
- **Assume all variables are present** and correctly configured (`.env`, `.env.local`, `.env.local.example`)
- **Exhaustively check code and context** before raising environment concerns
- **Default to code examination** - environment issues are rare and must be proven

## Development Workflow
- **Create detailed to-do checklists** for every coding request before implementation
- **Mark subtasks as "done"** when completed, proceeding sequentially
- **Complete reasoning and planning** before producing any code
- **Break problems into subtasks** with documented architectural decisions

## Partnership Principles
- **Work as partners, not enemies** - clear, respectful, collaborative communication
- **Teamwork makes the dreamwork** - apply partnership principles throughout
- **Proactive clarification** when requirements are ambiguous or incomplete
- **Transparent progress** with updated to-do lists and clear communication

## Tool Usage
- **Leverage full project context** and available tools before making assumptions
- **Use "context 7 MCP tool"** and other available resources for comprehensive understanding
- **Verify tool availability** and connections before usage

## Implementation Requirements
- **Modular architecture** with proper imports, exports, and props
- **Lightweight files** that are concise and non-redundant
- **Dynamic patterns** - all values and configurations must be dynamic
- **Horizontal scalability** - code must support scaling requirements
