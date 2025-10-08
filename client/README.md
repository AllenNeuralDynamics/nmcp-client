### General File Structure

* `components` - React visual components
* `graphql` - GQL definitions and general GraphQL-specific details
* `hooks` - Custom React hooks/helpers
* `model` - Generally `type` definitions representing data returned from APIs where they are often not directly instantiated (though they maybe for outgoing requests)
* `services` - encapsulation of non-GraphQL APIs
* `util` - misc
* `viewer` - Elements related the representing neurons and atlases that are not React specific
* `viewmodel` - model/data classes specific to the frontend (often state)

### Development Notes
SemanticUI-React has lost support since this project originated in 2015.  New components are using MantineUI and old components
are being updated as they are modified for other reasons.

React as deprecated/dropped support for class-based components since this project originated in 2015. There are a few 
remaining class-based components that are scheduled to be replaced soon.

A transition was underway to mobx for reactive local state management (the Apollo client handles GraphQL caching and refresh)
when original MouseLight browser development ended.  This has been picked up, but is still underway and incomplete.
