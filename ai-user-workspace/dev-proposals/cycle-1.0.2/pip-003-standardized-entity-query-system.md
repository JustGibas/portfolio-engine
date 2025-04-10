# PIP-003: Standardized Entity Query System

**Status**: 🔵 In Progress  
**Cycle ID**: 1.0.2  
**Related Task**: [Task ID TBD]

## Problem Statement

The current ECS architecture requires calling `getEntitiesWith()` with specific component names, leading to verbose and repetitive code across systems. There's no standardized way to perform complex queries on entities with multiple criteria (such as having certain components but not others), or to filter entities based on component property values. This results in systems implementing their own ad-hoc filtering logic, leading to inconsistent patterns and potential performance issues.

## Proposal

Create a flexible, chainable entity query system that provides a standardized way to:
1. Find entities with specific combinations of components
2. Filter entities based on component property values
3. Exclude entities with certain components
4. Reuse query definitions across the codebase
5. Optimize repeated queries for better performance

## Benefits

1. **Cleaner Code**: Reduce boilerplate in systems with expressive queries
2. **Performance Optimization**: Cache query results and optimize frequent queries
3. **Consistency**: Standardized query pattern across all systems
4. **Flexibility**: Support complex queries without custom filtering logic
5. **Readability**: Queries clearly express intent and are self-documenting

## Implementation Details

### 1. Create an EntityQuery Class

```javascript
class EntityQuery {
  constructor(world) {
    this.world = world;
    this.withComponents = [];
    this.withoutComponents = [];
    this.filters = [];
    this.resultCache = null;
    this.cacheValid = false;
  }
  
  // Find entities with all specified components
  with(...componentTypes) {
    this.withComponents.push(...componentTypes);
    this.cacheValid = false;
    return this;
  }
  
  // Exclude entities with any of these components
  without(...componentTypes) {
    this.withoutComponents.push(...componentTypes);
    this.cacheValid = false;
    return this;
  }
  
  // Filter by component property values
  where(componentType, propertyFilter) {
    this.filters.push({ componentType, propertyFilter });
    this.cacheValid = false;
    return this;
  }
  
  // Execute the query and return matching entities
  execute() {
    if (this.cacheValid && this.resultCache) {
      return [...this.resultCache]; // Return copy of cached results
    }
    
    // Start with entities that have all required components
    let results = this.withComponents.length > 0 
      ? this.world.getEntitiesWith(...this.withComponents)
      : this.world.getAllEntityIds();
    
    // Exclude entities with any excluded components
    if (this.withoutComponents.length > 0) {
      results = results.filter(entityId => {
        return !this.withoutComponents.some(compType => 
          this.world.hasComponent(entityId, compType)
        );
      });
    }
    
    // Apply property filters
    if (this.filters.length > 0) {
      results = results.filter(entityId => {
        return this.filters.every(({ componentType, propertyFilter }) => {
          const component = this.world.getComponent(entityId, componentType);
          if (!component) return false;
          
          // Handle different types of property filters
          if (typeof propertyFilter === 'function') {
            return propertyFilter(component);
          } else if (typeof propertyFilter === 'object') {
            return Object.entries(propertyFilter).every(([key, value]) => 
              component[key] === value
            );
          }
          return true;
        });
      });
    }
    
    // Cache the results
    this.resultCache = results;
    this.cacheValid = true;
    
    return [...results]; // Return a copy to prevent mutation
  }
  
  // Iterator support
  [Symbol.iterator]() {
    const results = this.execute();
    return results[Symbol.iterator]();
  }
  
  // Invalidate the cache when the world changes
  invalidateCache() {
    this.cacheValid = false;
  }
}
```

### 2. Add Query Methods to World Class

```javascript
// Add to World class
createQuery() {
  return new EntityQuery(this);
}

// Register common/frequent queries
registerQuery(name, queryBuilder) {
  if (!this.queries) {
    this.queries = new Map();
    this.queryResults = new Map();
  }
  
  const query = queryBuilder(new EntityQuery(this));
  this.queries.set(name, query);
  return query;
}

// Get a registered query's results (cached)
getQueryResults(name) {
  if (!this.queries || !this.queries.has(name)) {
    return [];
  }
  
  // Execute and cache if needed
  if (!this.queryResults.has(name)) {
    const query = this.queries.get(name);
    this.queryResults.set(name, query.execute());
  }
  
  return this.queryResults.get(name);
}
```

### 3. Update System Class to Support Queries

```javascript
// Add to System class
registerQuery(name, builderFn) {
  if (!this.queries) {
    this.queries = new Map();
  }
  
  const query = builderFn(new EntityQuery(this.world));
  this.queries.set(name, query);
  return query;
}

// Get query results in update method
update(deltaTime) {
  // Example of using a query
  const renderables = this.queries.get('renderables')?.execute() || [];
  
  for (const entityId of renderables) {
    // Process entities
  }
}
```

### 4. Usage Examples

```javascript
// In RenderSystem constructor
constructor() {
  super();
  // Setup queries during initialization
  this.registerQuery('renderables', q => 
    q.with('position', 'appearance')
     .without('hidden')
     .where('appearance', app => app.visible === true)
  );
}

// Complex query example
const activeEnemies = world.createQuery()
  .with('enemy', 'position', 'health')
  .without('stunned', 'dead')
  .where('health', health => health.current > 0)
  .where('position', pos => 
    pos.x > playerPos.x - viewRange && 
    pos.x < playerPos.x + viewRange
  )
  .execute();

// Using iterator support
for (const entityId of world.createQuery().with('physics', 'velocity')) {
  // Process each matching entity
}
```

## Visual Design

```
┌─ Entity Query Syntax ───────────────────────────────┐
│                                                     │
│  world.createQuery()                                │
│    .with('component1', 'component2')  ◄── Required  │
│    .without('component3')             ◄── Excluded  │
│    .where('component1', {                           │
│      property: value                  ◄── Filter    │
│    })                                               │
│    .where('component2', comp => {                   │
│      return comp.value > threshold    ◄── Custom    │
│    })                                               │
│    .execute()                         ◄── Run Query │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Files to Modify

1. `engine/core/world.js` - Add query methods
2. `engine/core/system.js` - Add query support
3. Create new file: `engine/core/entity-query.js` - Implement EntityQuery class
4. Update various systems to use the new query system

## Success Criteria

1. Systems can express complex entity queries in a clean, readable way
2. Query performance is equal or better than manual filtering
3. Common queries can be reused without code duplication
4. Queries automatically update when entities change
5. Query language is intuitive and well-documented

## Learning Opportunities

1. Fluent interface design pattern
2. Query optimization techniques
3. Caching strategies
4. Iterator protocol implementation
5. Functional programming concepts (filters, predicates)