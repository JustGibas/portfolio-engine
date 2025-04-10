# JavaScript Documentation Template
=========================================================================

## Format Guide

This document standardizes documentation for JavaScript files across the Portfolio Engine project. Use this template for consistent, comprehensive, and visually engaging documentation.

## Full File Template

```javascript
/**
 * =====================================================================
 * 
 * [FILENAME] - [BRIEF DESCRIPTION]
 * =====================================================================
 * 
 * @fileoverview [DETAILED FILE DESCRIPTION]
 * 
 * This file [EXPLAIN PRIMARY PURPOSE AND FUNCTIONALITY].
 * [ADDITIONAL CONTEXT AND IMPORTANCE]
 * 
 * ## Key Responsibilities:
 * - [RESPONSIBILITY 1]
 * - [RESPONSIBILITY 2]
 * - [RESPONSIBILITY 3]
 * 
 * ## [FLOW/PROCESS] Diagram:
 * 
 * ┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
 * │                │     │                 │     │                 │
 * │  [STEP 1]      ├────►│  [STEP 2]       ├────►│  [STEP 3]       │
 * │                │     │                 │     │                 │
 * └────────────────┘     └─────────────────┘     └─────────────────┘
 * 
 * ## Architecture/Relationships:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │                    [COMPONENT NAME]                     │
 * │                                                         │
 * │  ┌───────────┐   ┌───────────┐   ┌───────────────────┐  │
 * │  │           │   │           │   │                   │  │
 * │  │  [ITEM 1] │◄──┤  [ITEM 2] │◄──┤     [ITEM 3]      │  │
 * │  │           │   │           │   │                   │  │
 * │  └───────────┘   └───────────┘   └───────────────────┘  │
 * └─────────────────────────────────────────────────────────┘
 * 
 * ## Implementation Notes:
 * - [NOTE 1]
 * - [NOTE 2]
 * - [NOTE 3]
 * 
 * ## Dependencies:
 * - [DEPENDENCY 1]: [PURPOSE]
 * - [DEPENDENCY 2]: [PURPOSE]
 * 
 * ## Example Usage:
 * ```javascript
 * import { SomeFunction } from './this-file.js';
 * 
 * const result = SomeFunction({
 *   param1: 'value',
 *   param2: 42
 * });
 * ```
 * 
 * ## Performance Considerations:
 * - [CONSIDERATION 1]
 * - [CONSIDERATION 2]
 * 
 * ## Accessibility Notes:
 * - [ACCESSIBILITY NOTE 1]
 * - [ACCESSIBILITY NOTE 2]
 * 
 * ## TODO/Future Improvements:
 * - [ ] [IMPROVEMENT 1]
 * - [ ] [IMPROVEMENT 2]
 * 
 * @lastModified [Cycle ID]
 */
```

## Section Guidelines

### 1. ASCII Art Header
The header provides visual branding and makes files easily recognizable.

### 2. Flow Diagrams
Flow diagrams illustrate process flow, transformations, or user journeys. Example:

```
┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                │     │                 │     │                 │
│  Parse Input   ├────►│  Process Data   ├────►│  Format Output  │
│                │     │                 │     │                 │
└────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3. Architecture Diagrams
Architecture diagrams show relationships between components:

```
┌─────────────────────────────────────────────────────────┐
│                    Component Name                       │
│                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────────────┐  │
│  │           │   │           │   │                   │  │
│  │  Model    │◄──┤ Controller│◄──┤     View          │  │
│  │           │   │           │   │                   │  │
│  └───────────┘   └───────────┘   └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4. Responsibility Section
Clear enumeration of the file's responsibilities:

```
## Key Responsibilities:
- Handle user authentication and session management
- Process API responses and transform data
- Maintain component lifecycle and state
```

### 5. Example Usage Section
Practical examples demonstrating how to use the module:

```javascript
/**
 * ## Example Usage:
 * ```javascript
 * import { authenticateUser } from './auth-service.js';
 * 
 * const user = await authenticateUser({
 *   username: 'example',
 *   password: 'secure123'
 * });
 * 
 * if (user.authenticated) {
 *   startUserSession(user);
 * }
 * ```
 */
```

## API Documentation Template

For documenting API methods:

```javascript
/**
 * ## API Reference: [API Name]
 *
 * ### Methods
 *
 * #### methodName(param1, param2)
 * Purpose: Brief description  
 * Parameters:  
 * - param1 (Type) – Description   
 * - param2 (Type) – Description  
 * Returns: (ReturnType) – Description  
 * Example:  
 * const result = methodName('value1', 42);  
 * Notes: Edge cases; performance
 */
```

## Component Documentation Template

For documenting components:

```javascript
/**
 * ## Component: [ComponentName]
 *
 * ### Overview
 * Brief description of the component.
 *
 * ### Dependencies
 * - Dependency 1  
 * - Dependency 2
 *
 * ### Properties
 * | Property  | Type   | Default | Description            |
 * |-----------|--------|---------|------------------------|
 * | prop1     | String | null    | Explanation            |
 * | prop2     | Number | 0       | Explanation            |
 *
 * ### Events
 * | Event Name | Payload      | Description        |
 * |------------|--------------|--------------------|
 * | event:name | {id, value}  | When this event fires |
 *
 * ### Usage Example
 * // Example code showing component usage
 */
```

## Visual Separator Guidelines

### Primary Section Divider
```
=========================================================================
```
Usage: Between major sections

### Minimal Dividers
```
· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · 
```
Usage: For subtle separation

### Critical Information
```
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```
Usage: To highlight warnings

=========================================================================
**Last Updated**: Cycle 1.0.1
**Status**: Approved template for all JavaScript files